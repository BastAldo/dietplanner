import { setState } from '../../core/state.js';
import { renderCharts } from '../charts.js';
import { formatShortDate } from '../../utils/formatters.js';

export function setupChart(canvasId, type, label, labels, data, goal) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chartData = {
        labels: labels,
        datasets: [{
            label: label,
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: type === 'line' ? true : false,
            tension: 0.1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false
            }
        },
        plugins: {}
    };

    if (type === 'line' && goal) {
        options.plugins.annotation = {
            annotations: {
                line1: {
                    type: 'line',
                    yMin: goal,
                    yMax: goal,
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 2,
                    label: {
                        content: 'Goal',
                        enabled: true,
                        position: 'end'
                    }
                }
            }
        };
    }
    if (type === 'bar') {
        chartData.datasets[0].backgroundColor = data.map(v => v >= 0 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(75, 192, 192, 0.5)');
    }


    return new Chart(ctx, {
        type: type,
        data: chartData,
        options: options
    });
}

export function updateChartNavigation(appData, currentRangeFilter, dateOffset, filteredData) {
    const rangeButtons = document.querySelectorAll('.range-filter-btn');
    rangeButtons.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.range) === currentRangeFilter);
    });

    const prevBtn = document.getElementById('prev-range');
    const nextBtn = document.getElementById('next-range');
    nextBtn.disabled = dateOffset >= 0;

    const dateRangeLabel = document.getElementById('date-range');
    if (filteredData && filteredData.length > 0) {
        const startDate = formatShortDate(new Date(filteredData[0].date));
        const endDate = formatShortDate(new Date(filteredData[filteredData.length - 1].date));
        dateRangeLabel.textContent = `${startDate} - ${endDate}`;
    } else if (appData.biometrics.length === 0) {
        dateRangeLabel.textContent = 'No Data';
    } else {
        const tempEndDate = new Date();
        tempEndDate.setDate(tempEndDate.getDate() + dateOffset);
        const tempStartDate = new Date(tempEndDate);
        tempStartDate.setDate(tempStartDate.getDate() - (currentRangeFilter -1));
        dateRangeLabel.textContent = `${formatShortDate(tempStartDate)} - ${formatShortDate(tempEndDate)}`;
    }
}

export function calculateWeightTrend(data) {
    if (data.length < 2) return { labels: [], values: [] };

    const dailyChanges = [];
    for (let i = 1; i < data.length; i++) {
        const date1 = new Date(data[i-1].date).getTime();
        const date2 = new Date(data[i].date).getTime();
        const weight1 = parseFloat(data[i-1].weight);
        const weight2 = parseFloat(data[i].weight);
        const daysBetween = (date2 - date1) / (1000 * 60 * 60 * 24);

        if (daysBetween > 0) {
            const dailyChange = (weight2 - weight1) / daysBetween;
            for (let j = 0; j < daysBetween; j++) {
                const currentDate = new Date(date1 + (j * 1000 * 60 * 60 * 24));
                dailyChanges.push({ date: currentDate, change: dailyChange });
            }
        }
    }
    
    if (dailyChanges.length < 1) return { labels: [], values: [] };

    const movingAverages = [];
    for (let i = 0; i < dailyChanges.length; i++) {
        const windowStart = new Date(dailyChanges[i].date);
        windowStart.setDate(windowStart.getDate() - 6);
        const window = dailyChanges.filter(d => {
            const dDate = new Date(d.date);
            return dDate >= windowStart && dDate <= dailyChanges[i].date;
        });
        if(window.length > 0) {
            const sum = window.reduce((acc, val) => acc + val.change, 0);
            movingAverages.push({
                date: formatShortDate(dailyChanges[i].date),
                avg: sum / window.length
            });
        }
    }
    
    return {
        labels: movingAverages.map(ma => ma.date),
        values: movingAverages.map(ma => ma.avg)
    };
}

export function getBiometricsData(appData, currentRangeFilter, dateOffset) {
    const allBiometrics = [...appData.biometrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (allBiometrics.length === 0) {
        return { filteredData: [], fullData: [] };
    }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    endDate.setDate(endDate.getDate() + dateOffset);

    let startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (currentRangeFilter - 1));
    startDate.setHours(0, 0, 0, 0);

    const filteredData = allBiometrics.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });

    return { filteredData, fullData: allBiometrics };
}
