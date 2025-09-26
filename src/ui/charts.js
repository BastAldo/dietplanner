import { MEAL_TYPES, DAYS, WEEK_STARTS_ON_MONDAY } from '../utils/constants.js';

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
        bgColor: style.getPropertyValue('--bg-color').trim()
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
      if (meal && meal.calories_min) {
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
      label: 'Kcal Min',
      data: weeklyData.calories.map(c => c[0]),
      borderColor: colors.secondary,
      fill: false,
      tension: 0.1
  },{
      label: 'Kcal Max',
      data: weeklyData.calories.map(c => c[1]),
      borderColor: colors.primary,
      fill: '-1',
      backgroundColor: colors.primary + '33',
      tension: 0.1
  }]
  :
  [{
      label: 'Kcal (Min-Max)',
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
                return `Kcal: ${value[0]}`;
              }
              return `Kcal: ${value[0]} - ${value[1]}`;
            }
          }
        }
      }
    }
  });
}

function getBiometricsData(state) {
  const data = [...state.biometricData].reverse();
  const labels = data.map(entry => new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }));
  const weights = data.map(entry => entry.weight);
  return { labels, weights };
}

function renderBiometricsChart(state) {
  const { labels, weights } = getBiometricsData(state);
  const colors = getChartColors();
  const ctx = document.getElementById('biometrics-chart-canvas').getContext('2d');

  biometricsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Peso (kg)',
        data: weights,
        fill: false,
        borderColor: colors.primary,
        tension: 0.1,
        pointBackgroundColor: colors.secondary,
        pointRadius: 5
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
        legend: {
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
    // Rimuove e ri-aggiunge l'event listener per evitare duplicati
    const boundHandler = (e) => handleChartTypeChange(e, state);
    switcher.replaceWith(switcher.cloneNode(true));
    document.querySelector('.chart-type-switcher').addEventListener('click', boundHandler);
}
