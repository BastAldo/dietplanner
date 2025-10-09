import { getState } from '../core/state.js';
import { calculateWeightTrend, getBiometricsData, setupChart, updateChartNavigation } from '../ui/interactions/chartsInteractions.js';
import { formatShortDate } from '../utils/formatters.js';

let weightChart = null;
let weightTrendChart = null;

export function renderCharts() {
    const appData = getState();
    const { currentRangeFilter, dateOffset } = appData.ui.charts;
    const chartsView = document.getElementById('charts-view');
    if (!chartsView) return;

    const { filteredData, fullData } = getBiometricsData(appData, currentRangeFilter, dateOffset);

    if (!fullData || fullData.length === 0) {
        chartsView.querySelector('.charts-container').innerHTML = '<p>Nessun dato biometrico disponibile. Aggiungi dati nella sezione "Progressi".</p>';
        chartsView.querySelector('.charts-summary-stats').innerHTML = '';
        updateChartNavigation(appData, currentRangeFilter, dateOffset, []);
        return;
    } else {
         chartsView.querySelector('.charts-container').innerHTML = `
            <div class="chart-container">
                <canvas id="weight-chart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="weight-trend-chart"></canvas>
            </div>
        `;
    }

    updateChartNavigation(appData, currentRangeFilter, dateOffset, filteredData);

    // Statistiche di Riepilogo
    const currentWeight = parseFloat(fullData[fullData.length - 1].weight);
    const goalWeight = appData.goals.weightGoal;

    const fullWeightData = fullData.map(d => [
        new Date(d.date).getTime(),
        parseFloat(d.weight)
    ]);

    let weeklyChange = 0;
    let weeksToGoal = 'N/A';

    if (fullWeightData.length > 1) {
        const linearRegression = ss.linearRegression(fullWeightData);
        const slope = linearRegression.m;
        const dailyChange = slope * (1000 * 60 * 60 * 24);
        weeklyChange = dailyChange * 7;

        if (goalWeight && currentWeight !== goalWeight) {
            const weightDifference = goalWeight - currentWeight;
            if (Math.abs(weeklyChange) > 0.01 && ((weeklyChange < 0 && weightDifference < 0) || (weeklyChange > 0 && weightDifference > 0))) {
                const estimatedWeeks = weightDifference / weeklyChange;
                weeksToGoal = Math.round(estimatedWeeks);
            }
        }
    }

    const summaryStats = `
        <div><strong>Peso Attuale:</strong> ${currentWeight.toFixed(1)} kg</div>
        <div><strong>Obiettivo Peso:</strong> ${goalWeight ? goalWeight + ' kg' : 'Non impostato'}</div>
        <div><strong>Variazione Media/Settimana:</strong> <span class="${weeklyChange >= 0 ? 'positive' : 'negative'}">${weeklyChange.toFixed(2)} kg</span></div>
        <div><strong>Settimane Stimate all'Obiettivo:</strong> ${weeksToGoal}</div>
    `;
    chartsView.querySelector('.charts-summary-stats').innerHTML = summaryStats;

    // Grafico del Peso
    if (weightChart) {
        weightChart.destroy();
    }
    if (filteredData.length > 0) {
        const weightLabels = filteredData.map(item => formatShortDate(new Date(item.date)));
        const weightValues = filteredData.map(item => parseFloat(item.weight));
        weightChart = setupChart('weight-chart', 'line', 'Peso (kg)', weightLabels, weightValues, goalWeight);
    } else {
        const weightCanvas = document.getElementById('weight-chart');
        if (weightCanvas) {
            const ctx = weightCanvas.getContext('2d');
            ctx.clearRect(0, 0, weightCanvas.width, weightCanvas.height);
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Nessun dato per questo periodo", weightCanvas.width/2, weightCanvas.height/2);
        }
    }

    // Grafico Andamento Variazione Peso
    const fullTrendData = calculateWeightTrend(fullData);
    let visibleTrendData = { labels: [], values: [] };

    if (filteredData.length > 0 && fullTrendData.labels.length > 0) {
        const viewStartDate = new Date(filteredData[0].date).getTime();
        const viewEndDate = new Date(filteredData[filteredData.length - 1].date).getTime();

        for(let i = 0; i < fullTrendData.labels.length; i++) {
            const trendDate = new Date(fullTrendData.labels[i]).getTime();
             if (trendDate >= viewStartDate && trendDate <= viewEndDate) {
                visibleTrendData.labels.push(fullTrendData.labels[i]);
                visibleTrendData.values.push(fullTrendData.values[i]);
            }
        }
    }

    if (weightTrendChart) {
        weightTrendChart.destroy();
    }
    if (visibleTrendData.labels.length > 0) {
        weightTrendChart = setupChart('weight-trend-chart', 'bar', 'Andamento Variazione Peso (kg/giorno, media 7gg)', visibleTrendData.labels, visibleTrendData.values);
    } else {
         const trendCanvas = document.getElementById('weight-trend-chart');
        if(trendCanvas){
            const ctx = trendCanvas.getContext('2d');
            ctx.clearRect(0, 0, trendCanvas.width, trendCanvas.height);
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Dati insufficienti per mostrare il trend", trendCanvas.width/2, trendCanvas.height/2);
        }
    }
}
