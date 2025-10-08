import { MEAL_TYPES, DAYS, WEEK_STARTS_ON_MONDAY } from '../utils/constants.js';
import { BIOMETRIC_FIELDS } from '../config/forms.js';
import { UI_TEXT } from '../config/uiText.js';

let chartInstances = {};
let currentPlannerChartType = 'bar';
let currentRangeFilter = '30';

const toISODateString = (date) => date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : WEEK_STARTS_ON_MONDAY);
  return new Date(d.setDate(diff));
}

function getChartColors() {
    const style = getComputedStyle(document.documentElement);
    return {
        primary: style.getPropertyValue('--primary-color').trim(),
        secondary: style.getPropertyValue('--secondary-color').trim(),
        textColor: style.getPropertyValue('--text-color').trim(),
        borderColor: style.getPropertyValue('--border-color').trim(),
        danger: style.getPropertyValue('--danger-color').trim(),
        success: style.getPropertyValue('--success-color').trim(),
        warning: style.getPropertyValue('--warning-color').trim()
    };
}

function calculateWeeklyCalorieData(state) {
  const weekStart = getWeekStartDate(state.focusedDate);
  const weeklyData = { labels: [], calories: [] };

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const isoDate = toISODateString(dayDate);
    weeklyData.labels.push(DAYS[i]);

    let dailyMin = 0, dailyMax = 0;
    MEAL_TYPES.forEach(type => {
      const meal = state.weeklyPlan[`${isoDate}-${type}`];
      if (meal && typeof meal.calories_min === 'number') {
        const minCals = Number(meal.calories_min) || 0;
        const maxCals = Number(meal.calories_max) || minCals;
        dailyMin += minCals;
        dailyMax += maxCals;
      }
    });
    weeklyData.calories.push([dailyMin, dailyMax]);
  }
  return weeklyData;
}

function destroyAllCharts() {
  Object.values(chartInstances).forEach(chart => {
    if (chart) chart.destroy();
  });
  chartInstances = {};
}

function renderPlannerChart(state) {
  const weeklyData = calculateWeeklyCalorieData(state);
  const colors = getChartColors();
  const isLineChart = currentPlannerChartType === 'line';
  
  const datasets = isLineChart ?
  [{
      label: UI_TEXT.CHART_KCAL_MIN_LABEL,
      data: weeklyData.calories.map(c => c[0]),
      borderColor: colors.secondary,
      fill: false,
      tension: 0.1
  },{
      label: UI_TEXT.CHART_KCAL_MAX_LABEL,
      data: weeklyData.calories.map(c => c[1]),
      borderColor: colors.primary,
      fill: '-1',
      backgroundColor: colors.primary + '33',
      tension: 0.1
  }]
  :
  [{
      label: UI_TEXT.CHART_KCAL_RANGE_LABEL,
      data: weeklyData.calories,
      backgroundColor: colors.primary,
      borderColor: colors.secondary
  }];
  
  const ctx = document.getElementById('planner-chart-canvas').getContext('2d');
  chartInstances.planner = new Chart(ctx, {
    type: currentPlannerChartType,
    data: {
      labels: weeklyData.labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: colors.textColor },
          grid: { color: colors.borderColor }
        },
        x: {
          ticks: { color: colors.textColor },
          grid: { display: false }
        }
      },
      plugins: {
        legend: {
          display: isLineChart,
          labels: { color: colors.textColor }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (isLineChart) {
                return `${context.dataset.label}: ${context.parsed.y}`;
              }
              const value = context.raw;
              if (value[0] === value[1]) {
                return `${UI_TEXT.KCAL_LABEL}: ${value[0]}`;
              }
              return `${UI_TEXT.KCAL_LABEL}: ${value[0]} - ${value[1]}`;
            }
          }
        }
      }
    }
  });
}

function filterDataByRange(data, rangeInDays) {
  if (rangeInDays === 'all') return data;
  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(now.getDate() - parseInt(rangeInDays, 10));
  return data.filter(entry => new Date(entry.date) >= cutoffDate);
}

function getBiometricsData(state) {
  const sortedData = [...state.biometricData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const data = filterDataByRange(sortedData, currentRangeFilter);
  const labels = data.map(entry => new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }));
  
  const datasets = {};
  const numericFields = BIOMETRIC_FIELDS.filter(f => f.type === 'number');

  numericFields.forEach(field => {
      datasets[field.id] = {
          label: field.label,
          data: data.map(entry => entry[field.id] || null)
      };
  });

  return { labels, datasets, filteredData: data };
}

function renderBiometricsChart(state, data) {
  const { labels, datasets } = data;
  const colors = getChartColors();
  const colorCycle = [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger];
  
  const chartDatasets = Object.values(datasets)
      .map((dataset, index) => ({
          label: dataset.label,
          data: dataset.data,
          fill: false,
          borderColor: colorCycle[index % colorCycle.length],
          tension: 0.1,
          pointBackgroundColor: colorCycle[index % colorCycle.length],
          pointRadius: 4
      }))
      .filter(d => d.data.some(val => val !== null));

  const ctx = document.getElementById('biometrics-chart-canvas').getContext('2d');

  chartInstances.biometrics = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: chartDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: { color: colors.textColor },
          grid: { color: colors.borderColor }
        },
        x: {
          ticks: { color: colors.textColor },
          grid: { display: false }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: colors.textColor },
          onClick: (e, legendItem, legend) => {
            const index = legendItem.datasetIndex;
            const ci = legend.chart;
            if (ci.isDatasetVisible(index)) {
                ci.hide(index);
                legendItem.hidden = true;
            } else {
                ci.show(index);
                legendItem.hidden = false;
            }
          }
        }
      }
    }
  });
}

function renderCorrelationChart(state, data) {
    const { filteredData } = data;
    if (filteredData.length < 2) return;

    const labels = filteredData.map(entry => new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }));
    const weightData = filteredData.map(entry => entry.weight || null);

    const calorieData = filteredData.map(entry => {
        const isoDate = entry.date;
        let dailyMin = 0;
        MEAL_TYPES.forEach(type => {
            const meal = state.weeklyPlan[`${isoDate}-${type}`];
            if (meal) {
                dailyMin += Number(meal.calories_min) || 0;
            }
        });
        return dailyMin > 0 ? dailyMin : null;
    });

    const colors = getChartColors();
    const ctx = document.getElementById('correlation-chart-canvas').getContext('2d');
    chartInstances.correlation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Peso (kg)',
                    data: weightData,
                    type: 'line',
                    borderColor: colors.secondary,
                    tension: 0.1,
                    yAxisID: 'yWeight',
                },
                {
                    label: 'Kcal Assunte',
                    data: calorieData,
                    backgroundColor: colors.primary + '80',
                    yAxisID: 'yKcal',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yWeight: {
                    type: 'linear',
                    position: 'left',
                    ticks: { color: colors.secondary },
                    grid: { color: colors.borderColor }
                },
                yKcal: {
                    type: 'linear',
                    position: 'right',
                    ticks: { color: colors.primary },
                    grid: { display: false }
                },
                x: {
                    ticks: { color: colors.textColor },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    labels: { color: colors.textColor }
                }
            }
        }
    });
}

function renderVelocityChart(data) {
  const { filteredData } = data;
  if (filteredData.length < 2) return;

  const weeklyChanges = [];
  for (let i = 1; i < filteredData.length; i++) {
      const prev = filteredData[i - 1];
      const curr = filteredData[i];
      const daysDiff = (new Date(curr.date) - new Date(prev.date)) / (1000 * 60 * 60 * 24);
      if (daysDiff > 0) {
          const weightChange = curr.weight - prev.weight;
          const changePerWeek = (weightChange / daysDiff) * 7;
          weeklyChanges.push({
              date: curr.date,
              change: changePerWeek.toFixed(2)
          });
      }
  }

  const labels = weeklyChanges.map(c => new Date(c.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }));
  const changeData = weeklyChanges.map(c => c.change);
  const colors = getChartColors();

  const ctx = document.getElementById('velocity-chart-canvas').getContext('2d');
  chartInstances.velocity = new Chart(ctx, {
      type: 'bar',
      data: {
          labels,
          datasets: [{
              label: 'Variazione media settimanale (kg)',
              data: changeData,
              backgroundColor: changeData.map(v => v < 0 ? colors.success : colors.danger),
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              y: {
                  ticks: { color: colors.textColor },
                  grid: { color: colors.borderColor }
              },
              x: {
                  ticks: { color: colors.textColor },
                  grid: { display: false }
              }
          },
          plugins: {
              legend: { display: false }
          }
      }
  });
}

function renderSummaryStats(data) {
  const { filteredData } = data;
  const container = document.getElementById('charts-summary-stats');
  if (filteredData.length < 2) {
    container.innerHTML = '';
    return;
  }

  const first = filteredData[0];
  const last = filteredData[filteredData.length - 1];
  
  const weightChange = (last.weight - first.weight).toFixed(1);
  const daysDiff = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
  const avgWeeklyChange = daysDiff > 0 ? ((weightChange / daysDiff) * 7).toFixed(2) : 0;

  container.innerHTML = `
    <div class="stat-item">
      <div class="stat-value">${weightChange} kg</div>
      <div class="stat-label">Variazione Peso (${currentRangeFilter}gg)</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${avgWeeklyChange} kg</div>
      <div class="stat-label">Variazione media / settimana</div>
    </div>
  `;
}

export function handleChartTypeChange(event, state) {
    const type = event.target.dataset.type;
    if (type && type !== currentPlannerChartType) {
        currentPlannerChartType = type;
        document.querySelectorAll('.btn-chart-type').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        if (chartInstances.planner) {
          chartInstances.planner.destroy();
        }
        renderPlannerChart(state);
    }
}

export function handleRangeFilterChange(event, state) {
  const range = event.target.dataset.range;
  if (range && range !== currentRangeFilter) {
    currentRangeFilter = range;
    document.querySelectorAll('#charts-range-filter .btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.range === range);
    });
    renderCharts(state);
  }
}

export function renderCharts(state) {
    destroyAllCharts();
    document.getElementById('velocity-chart-title').textContent = "Andamento Variazione Peso";

    const biometricsData = getBiometricsData(state);

    const placeholder = document.getElementById('biometrics-chart-placeholder');
    const canvas = document.getElementById('biometrics-chart-canvas');
    if (biometricsData.filteredData.length < 2) {
        placeholder.textContent = UI_TEXT.BIOMETRICS_CHART_EMPTY;
        placeholder.classList.remove('hidden');
        canvas.classList.add('hidden');
        document.getElementById('charts-summary-stats').innerHTML = '';
        document.getElementById('velocity-chart-canvas').getContext('2d').clearRect(0,0,1,1); // Clear canvas
    } else {
        placeholder.classList.add('hidden');
        canvas.classList.remove('hidden');
        renderBiometricsChart(state, biometricsData);
        renderCorrelationChart(state, biometricsData);
        renderVelocityChart(biometricsData);
        renderSummaryStats(biometricsData);
    }
    
    renderPlannerChart(state);
}
