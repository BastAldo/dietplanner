import { updateWeeklyPlan, resetWeeklyPlan, setPlannerConfig, setConfigUrl } from '../core/state.js';
import { fetchAndParseConfig } from '../api/configService.js';
import { showNotification } from './notifications.js';
import { openSelectionModal } from './renderer.js';
async function handleLoadConfig() {
  const url = document.getElementById('config-url-input').value.trim();
  setConfigUrl(url);
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config);
    showNotification('Configurazione caricata!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}
function handleCalendarClick(e) {
  const slot = e.target.closest('.calendar-slot');
  if (!slot) return;
  const deleteButton = e.target.closest('.delete-meal-btn');
  if (deleteButton) {
    updateWeeklyPlan(deleteButton.dataset.slotId, null);
    return;
  }
  if (slot.childElementCount === 0) {
    openSelectionModal(slot.dataset.slotId);
  }
}
export function initializeEventListeners() {
  document.getElementById('reset-btn').addEventListener('click', () => { if(confirm('Sei sicuro?')) resetWeeklyPlan(); });
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => document.getElementById(e.target.dataset.target).classList.add('modal-hidden'));
  });
  document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);
}
