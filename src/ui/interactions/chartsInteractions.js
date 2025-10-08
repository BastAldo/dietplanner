import { getState } from '../../core/state.js';
import { handleChartTypeChange, handleRangeFilterChange, openChartModal, handleDateShift } from '../charts.js';
import { log } from '../../utils/logger.js';

export function initializeChartsListeners() {
  const chartsPage = document.getElementById('charts-page');
  
  chartsPage.addEventListener('click', (e) => {
    const state = getState();
    const btnChartType = e.target.closest('.btn-chart-type');
    const btnRangeFilter = e.target.closest('#charts-range-filter button');
    const btnExpand = e.target.closest('.btn-expand-chart');
    const btnPrev = e.target.closest('#charts-prev-btn');
    const btnNext = e.target.closest('#charts-next-btn');

    if (btnChartType) {
      handleChartTypeChange(e, state);
    } else if (btnRangeFilter) {
      handleRangeFilterChange(e, state);
    } else if (btnExpand) {
      const chartId = btnExpand.dataset.chartId;
      log('Interactions', 'Expand chart button clicked', { chartId });
      openChartModal(state, chartId);
    } else if (btnPrev) {
      handleDateShift(-1, state);
    } else if (btnNext) {
      handleDateShift(1, state);
    }
  });

  // Handler per chiudere il modale del grafico
  const chartModal = document.getElementById('chart-modal');
  chartModal.addEventListener('click', e => {
      if (e.target === chartModal || e.target.closest('.modal-close-btn')) {
          log('Interactions', 'Closing chart modal');
          chartModal.classList.add('modal-hidden');
      }
  });
}
