import { getState } from '../../core/state.js';
import { handleChartTypeChange, handleRangeFilterChange } from '../charts.js';

export function initializeChartsListeners() {
  const chartsPage = document.getElementById('charts-page');
  
  chartsPage.addEventListener('click', (e) => {
    const state = getState();
    if (e.target.closest('.chart-type-switcher')) {
      handleChartTypeChange(e, state);
    }
    if (e.target.closest('#charts-range-filter')) {
      handleRangeFilterChange(e, state);
    }
  });
}