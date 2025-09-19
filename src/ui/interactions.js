import { getState, updateWeeklyPlan, resetWeeklyPlan, setPlannerConfig, setConfigUrl, setActiveFilter } from '../core/state.js';
import { isPlacementValid } from '../core/validation.js';
import { fetchAndParseConfig } from '../api/configService.js';
import { showNotification } from './notifications.js';
import { openSelectionModal } from './renderer.js';

const IS_DESKTOP = window.matchMedia('(min-width: 768px)').matches;
let draggedMealId = null;

function handleCalendarClick(e) {
  if (e.target.matches('.delete-meal-btn')) {
    updateWeeklyPlan(e.target.dataset.slotId, null);
    return;
  }
  // Attiva il modale di selezione solo su mobile e su slot vuoti
  if (!IS_DESKTOP && e.target.matches('.calendar-slot:empty')) {
    openSelectionModal(e.target.dataset.slotId);
  }
}

function handleDrop(e) { /* ... (invariato) ... */ }

export function initializeEventListeners() {
  document.getElementById('reset-btn').addEventListener('click', () => { if(confirm('Sei sicuro?')) resetWeeklyPlan(); });
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
  document.querySelectorAll('.modal-close-btn').forEach(btn => { /* ... (invariato) ... */ });
  document.getElementById('filter-container').addEventListener('click', handleFilterClick);
  document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);

  // Attiva il drag & drop solo su desktop
  if (IS_DESKTOP) {
      const calendar = document.getElementById('calendar-grid');
      const library = document.getElementById('meal-library');
      library.addEventListener('dragstart', e => { if (e.target.classList.contains('meal-card')) draggedMealId = e.target.dataset.mealId; });
      calendar.addEventListener('drop', handleDrop);
      calendar.addEventListener('dragover', e => { if(e.target.closest('.calendar-slot')) e.preventDefault(); });
  }
}
// ... (altre funzioni di interazione come handleLoadConfig, handleFilterClick, etc. sono invariate)
