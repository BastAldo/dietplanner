import { renderApp } from '../renderer.js';
import { getState, setState } from '../../core/state.js';

function handleRangeChange(newRange) {
    const currentState = getState();
    currentState.ui.charts.currentRangeFilter = newRange;
    currentState.ui.charts.dateOffset = 0;
    setState(currentState);
    renderApp();
}

function handleDateNavigation(direction) {
    const currentState = getState();
    const currentOffset = currentState.ui.charts.dateOffset;
    const range = currentState.ui.charts.currentRangeFilter;
    const newOffset = currentOffset + (direction * range);

    if (newOffset <= 0) {
        currentState.ui.charts.dateOffset = newOffset;
        setState(currentState);
        renderApp();
    }
}

export function initializeChartsListeners() {
    const chartsPage = document.getElementById('charts-page');

    chartsPage.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('.range-filter-btn')) {
            const newRange = parseInt(target.dataset.range);
            handleRangeChange(newRange);
        } else if (target.id === 'prev-range') {
            handleDateNavigation(-1);
        } else if (target.id === 'next-range') {
            handleDateNavigation(1);
        }
    });
}
