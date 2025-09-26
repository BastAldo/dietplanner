import { MEAL_TYPES, DAYS, WEEK_STARTS_ON_MONDAY } from '../utils/constants.js';

let plannerChartInstance = null;
let biometricsChartInstance = null;

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
  const weeklyData = { labels: [], minCalories: [], maxCalories: [] };

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
    weeklyData.minCalories.push(dailyMin);
    weeklyData.maxCalories.push(dailyMax);
  }
  return weeklyData;
}

function renderPlannerChart(state) {
  const ctx = document.getElementById('planner-chart-canvas').getContext('2d');
  if (plannerChartInstance) {
    plannerChartInstance.destroy();
  }

  const weeklyData = calculateWeeklyCalorieData(state);
  const colors = getChartColors();

  plannerChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeklyData.labels,
      datasets: [{
        label: 'Kcal Min',
        data: weeklyData.minCalories,
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        borderWidth: 1
      }, {
        label: 'Kcal Max',
        data: weeklyData.maxCalories,
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
        borderWidth: 1
      }]
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
          labels: { color: colors.textColor }
        }
      }
    }
  });
}

function getBiometricsData(state) {
  const data = [...state.biometricData].reverse(); // oldest to newest
  const labels = data.map(entry => new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }));
  const weights = data.map(entry => entry.weight);
  return { labels, weights };
}

function renderBiometricsChart(state) {
  const ctx = document.getElementById('biometrics-chart-canvas').getContext('2d');
  const placeholder = document.getElementById('biometrics-chart-placeholder');
  const canvas = document.getElementById('biometrics-chart-canvas');

  if (biometricsChartInstance) {
    biometricsChartInstance.destroy();
  }

  if (state.biometricData.length < 2) {
    canvas.classList.add('hidden');
    placeholder.classList.remove('hidden');
    return;
  }
  
  canvas.classList.remove('hidden');
  placeholder.classList.add('hidden');

  const { labels, weights } = getBiometricsData(state);
  const colors = getChartColors();

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

export function renderCharts(state) {
    renderPlannerChart(state);
    renderBiometricsChart(state);
}
