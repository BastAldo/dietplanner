import { getState, updateWeeklyPlan, resetWeeklyPlan, setPlannerConfig, setConfigUrl, setActiveFilter } from '../core/state.js';
import { isPlacementValid } from '../core/validation.js';
import { fetchAndParseConfig } from '../api/configService.js';
import { showNotification } from './notifications.js';

let draggedMealId = null;

export function initializeEventListeners() {
  document.getElementById('reset-btn').addEventListener('click', () => { if(confirm('Sei sicuro?')) resetWeeklyPlan(); });
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => document.getElementById(btn.dataset.target).classList.add('modal-hidden'));
  });
  document.getElementById('filter-container').addEventListener('click', handleFilterClick);
  const calendar = document.getElementById('calendar-grid');
  calendar.addEventListener('click', handleCalendarClick);
  calendar.addEventListener('dragover', e => { if(e.target.closest('.calendar-slot')) e.preventDefault(); });
  calendar.addEventListener('drop', handleDrop);
  const library = document.getElementById('meal-library');
  library.addEventListener('dragstart', e => { if (e.target.classList.contains('meal-card')) draggedMealId = e.target.dataset.mealId; });
}

async function handleLoadConfig() {
  const url = document.getElementById('config-url-input').value.trim();
  setConfigUrl(url);
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config);
    showNotification('Configurazione caricata con successo!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

function handleFilterClick(e) {
  if (e.target.matches('.filter-btn')) {
    setActiveFilter(e.target.dataset.filter);
  }
}

function handleCalendarClick(e) {
  if (e.target.matches('.delete-meal-btn')) {
    const slotId = e.target.dataset.slotId;
    updateWeeklyPlan(slotId, null);
  }
}

function handleDrop(e) {
  e.preventDefault();
  const slot = e.target.closest('.calendar-slot');
  if (!slot || !draggedMealId) return;
  const state = getState();
  const mealToAdd = state.masterMealList.find(m => m.id === draggedMealId);
  if (!mealToAdd) return;
  const validationResult = isPlacementValid(mealToAdd, slot.dataset.slotId, state.weeklyPlan, state.masterMealList, state.rules);
  if (validationResult.isValid) {
    updateWeeklyPlan(slot.dataset.slotId, draggedMealId);
  } else {
    showNotification(validationResult.message, 'error');
  }
  draggedMealId = null;
}
