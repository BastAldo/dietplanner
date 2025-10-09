import { getState } from '../core/state.js';
import { formatShortDate } from '../utils/formatters.js';
import { BIOMETRIC_FIELDS } from '../config/forms.js';
import { MEAL_TYPES } from '../utils/constants.js';

let biometricChart = null;
let trendChart = null;
let plannerChart = null;
let correlationChart = null;

function setupChart(canvasId, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, config);
}

function linearRegression(data) {
    const n = data.length;
    if (n < 2) return { m: 0, b: 0 };
    let sx = 0, sy = 0, sxy = 0, sxx = 0;
    data.forEach(p => {
        sx += p.x;
        sy += p.y;
        sxy += p.x * p.y;
        sxx += p.x * p.x;
    });
    const m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const b = (sy / n) - (m * sx / n);
    return { m, b };
}

function getBiometricsData(appData, currentRangeFilter, dateOffset) {
    const allBiometrics = [...appData.biometricData].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (allBiometrics.length === 0) return { filteredData: [], fullData: [] };

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    endDate.setDate(endDate.getDate() + dateOffset);

    let startDate;
    if (currentRangeFilter === 9999) {
        startDate = new Date(allBiometrics[0].date);
    } else {
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - (currentRangeFilter - 1));
    }
    startDate.setHours(0, 0, 0, 0);

    const filteredData = allBiometrics.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });

    return { filteredData, fullData: allBiometrics };
}

function updateChartNavigation(appData, currentRangeFilter, dateOffset, filteredData) {
    document.querySelectorAll('.range-filter-btn').forEach(btn => {
        const range = btn.dataset.range === 'all' ? 9999 : parseInt(btn.dataset.range, 10);
        btn.classList.toggle('active', range === currentRangeFilter);
    });
    document.getElementById('charts-next-btn').disabled = dateOffset >= 0;
    const dateRangeLabel = document.getElementById('date-range');
    if (filteredData.length > 0) {
        const start = formatShortDate(new Date(filteredData[0].date));
        const end = formatShortDate(new Date(filteredData[filteredData.length - 1].date));
        dateRangeLabel.textContent = `${start} - ${end}`;
    } else {
        dateRangeLabel.textContent = 'Nessun dato';
    }
}

function renderBiometricSelector(selectedKey) {
    const container = document.getElementById('biometric-selector');
    const options = BIOMETRIC_FIELDS
        .filter(f => f.type === 'number' && f.id !== 'basalMetabolism')
        .map(f => `<button class="btn-chart-type ${f.id === selectedKey ? 'active' : ''}" data-key="${f.id}">${f.label}</button>`)
        .join('');
    container.innerHTML = options;
}

function renderSummaryStats(fullData, goalWeight) {
    const container = document.getElementById('charts-summary-stats');
    if (fullData.length < 2) {
        container.innerHTML = '<p>Dati insufficienti per le statistiche.</p>';
        return;
    }
    const currentWeight = parseFloat(fullData[fullData.length - 1].weight);
    const weightData = fullData.map(d => ({ x: new Date(d.date).getTime(), y: parseFloat(d.weight) }));
    const regression = linearRegression(weightData);
    const dailyChange = regression.m * (1000 * 60 * 60 * 24);
    const weeklyChange = dailyChange * 7;

    let weeksToGoal = 'N/A';
    if (goalWeight && currentWeight !== goalWeight && Math.abs(weeklyChange) > 0.01) {
        const diff = goalWeight - currentWeight;
        if ((weeklyChange > 0 && diff > 0) || (weeklyChange < 0 && diff < 0)) {
            weeksToGoal = Math.round(diff / weeklyChange);
        }
    }

    container.innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${currentWeight.toFixed(1)} kg</span>
            <span class="stat-label">Peso Attuale</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${goalWeight ? goalWeight + ' kg' : 'N/D'}</span>
            <span class="stat-label">Obiettivo</span>
        </div>
        <div class="stat-item">
            <span class="stat-value ${weeklyChange >= 0 ? 'positive' : 'negative'}">${weeklyChange.toFixed(2)} kg</span>
            <span class="stat-label">Variazione Media/Sett.</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${weeksToGoal}</span>
            <span class="stat-label">Settimane all'Obiettivo</span>
        </div>
    `;
}

export function renderCharts() {
    const appData = getState();
    const { currentRangeFilter, dateOffset, selectedBiometric } = appData.ui.charts;
    const { filteredData, fullData } = getBiometricsData(appData, currentRangeFilter, dateOffset);
    
    updateChartNavigation(appData, currentRangeFilter, dateOffset, filteredData);
    renderBiometricSelector(selectedBiometric);

    if (fullData.length === 0) {
        document.getElementById('charts-summary-stats').innerHTML = '';
        document.getElementById('charts-container').innerHTML = '<p class="placeholder-text">Nessun dato biometrico disponibile. Aggiungi dati nella sezione "Progressi".</p>';
        return;
    }

    renderSummaryStats(fullData, appData.userGoals.target_weight);

    // Render Biometric Chart
    if (biometricChart) biometricChart.destroy();
    const selectedField = BIOMETRIC_FIELDS.find(f => f.id === selectedBiometric) || BIOMETRIC_FIELDS.find(f => f.id === 'weight');
    const chartData = filteredData.filter(d => d[selectedField.id]).map(d => ({ x: new Date(d.date), y: parseFloat(d[selectedField.id]) }));
    biometricChart = setupChart('biometrics-chart-canvas', {
        type: 'line',
        data: {
            datasets: [{
                label: selectedField.label,
                data: chartData,
                borderColor: 'rgba(149, 117, 205, 1)',
                backgroundColor: 'rgba(149, 117, 205, 0.2)',
                fill: true,
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day' } } } }
    });

    // Render Trend Chart
    if (trendChart) trendChart.destroy();
    const trendData = linearRegression(fullData.map(d => ({ x: new Date(d.date).getTime(), y: parseFloat(d.weight) })));
    trendChart = setupChart('velocity-chart-canvas', {
      type: 'line',
      data: {
          labels: filteredData.map(d => formatShortDate(d.date)),
          datasets: [{
              label: 'Trend del Peso (kg)',
              data: filteredData.map(d => trendData.m * new Date(d.date).getTime() + trendData.b),
              borderColor: 'rgba(255, 99, 132, 1)',
              fill: false,
              pointRadius: 0,
          }, {
              label: 'Peso (kg)',
              data: filteredData.map(d => parseFloat(d.weight)),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              type: 'scatter',
          }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
    
    // Render Planner Chart
    if (plannerChart) plannerChart.destroy();
    const weekStart = new Date(appData.focusedDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);

    const plannerLabels = [];
    const plannerData = [];
    for (let i=0; i<7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      plannerLabels.push(date.toLocaleDateString('it-IT', { weekday: 'short' }));
      const isoDate = date.toISOString().split('T')[0];
      let min = 0, max = 0;
      MEAL_TYPES.forEach(type => {
        const meal = appData.weeklyPlan[`${isoDate}-${type}`];
        if (meal) {
          min += meal.calories_min || 0;
          max += meal.calories_max || meal.calories_min || 0;
        }
      });
      plannerData.push(min === max ? [0, max] : [min, max]);
    }

    plannerChart = setupChart('planner-chart-canvas', {
      type: 'bar',
      data: {
        labels: plannerLabels,
        datasets: [{
          label: 'Calorie Pianificate (min-max)',
          data: plannerData,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          borderSkipped: false,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Render Correlation Chart
    if (correlationChart) correlationChart.destroy();
    const correlationData = [];
    for (let i = 1; i < fullData.length; i++) {
        const date1 = new Date(fullData[i - 1].date);
        const date2 = new Date(fullData[i].date);
        const weight1 = parseFloat(fullData[i - 1].weight);
        const weight2 = parseFloat(fullData[i].weight);
        const daysBetween = (date2 - date1) / (1000 * 60 * 60 * 24);
        if (daysBetween <= 0) continue;

        let totalCalories = 0;
        let dayCount = 0;
        for (let d = new Date(date1); d < date2; d.setDate(d.getDate() + 1)) {
            const iso = d.toISOString().split('T')[0];
            let dailyCals = 0;
            MEAL_TYPES.forEach(type => {
                const meal = appData.weeklyPlan[`${iso}-${type}`];
                if(meal) dailyCals += meal.calories_min || 0;
            });
            if(dailyCals > 0) {
              totalCalories += dailyCals;
              dayCount++;
            }
        }
        if(dayCount > 0) {
          const avgCalories = totalCalories / dayCount;
          const dailyWeightChange = (weight2 - weight1) / daysBetween;
          correlationData.push({ x: avgCalories, y: dailyWeightChange });
        }
    }
    correlationChart = setupChart('correlation-chart-canvas', {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Correlazione Calorie/Variazione Peso',
          data: correlationData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'Media Calorie Giornaliere' }}, y: { title: { display: true, text: 'Variazione Media Peso Giornaliera (kg)' }} }}
    });
}
