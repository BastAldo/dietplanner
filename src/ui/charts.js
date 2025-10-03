import { MEAL_TYPES, DAYS, WEEK_STARTS_ON_MONDAY } from '../utils/constants.js';
import { BIOMETRIC_FIELDS } from '../config/forms.js';
import { UI_TEXT } from '../config/uiText.js';

let plannerChartInstance = null;
let biometricsChartInstance = null;
let currentPlannerChartType = 'bar';

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
  plannerChartInstance = new Chart(ctx, {
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

function getBiometricsData(state) {
  const data = [...state.biometricData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = data.map(entry => new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }));
  
  const datasets = {};
  const numericFields = BIOMETRIC_FIELDS.filter(f => f.type === 'number' && f.id !== 'basalMetabolism' && f.id !== 'bmi');

  numericFields.forEach(field => {
      datasets[field.id] = {
          label: field.label,
          data: data.map(entry => entry[field.id] || null)
      };
  });

  return { labels, datasets };
}

function renderBiometricsChart(state) {
  const { labels, datasets } = getBiometricsData(state);
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

  biometricsChartInstance = new Chart(ctx, {
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
          labels: { color: colors.textColor }
        }
      }
    }
  });
}

function handleChartTypeChange(event, state) {
    const type = event.target.dataset.type;
    if (type && type !== currentPlannerChartType) {
        currentPlannerChartType = type;
        document.querySelectorAll('.btn-chart-type').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        if (plannerChartInstance) {
          plannerChartInstance.destroy();
        }
        renderPlannerChart(state);
    }
}

export function renderCharts(state) {
    if (plannerChartInstance) {
        plannerChartInstance.destroy();
    }
    if (biometricsChartInstance) {
        biometricsChartInstance.destroy();
    }

    renderPlannerChart(state);
    renderBiometricsChart(state);

    const switcher = document.querySelector('.chart-type-switcher');
    const boundHandler = (e) => handleChartTypeChange(e, state);
    switcher.replaceWith(switcher.cloneNode(true));
    document.querySelector('.chart-type-switcher').addEventListener('click', boundHandler);
}
