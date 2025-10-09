import { getState, setUiState } from '../../core/state.js';

function handleRangeChange(newRange) {
    const currentState = getState();
    const newUiState = {
        ...currentState.ui,
        charts: {
            ...currentState.ui.charts,
            currentRangeFilter: newRange,
            dateOffset: 0
        }
    };
    setUiState(newUiState);
}

function handleDateNavigation(direction) {
    const currentState = getState();
    const { dateOffset, currentRangeFilter } = currentState.ui.charts;
    const newOffset = dateOffset + (direction * currentRangeFilter);

    if (newOffset <= 0) {
        const newUiState = {
            ...currentState.ui,
            charts: {
                ...currentState.ui.charts,
                dateOffset: newOffset
            }
        };
        setUiState(newUiState);
    }
}

export function initializeChartsListeners() {
    const chartsPage = document.getElementById('charts-page');
    if (!chartsPage) return;

    chartsPage.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        
        if (target.matches('.range-filter-btn')) {
            const newRange = target.dataset.range === 'all' ? 9999 : parseInt(target.dataset.range, 10);
            handleRangeChange(newRange);
        } else if (target.id === 'charts-prev-btn') {
            handleDateNavigation(-1);
        } else if (target.id === 'charts-next-btn') {
            handleDateNavigation(1);
        }
    });
}
