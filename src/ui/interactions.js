import { updateWeeklyPlan, resetWeeklyPlan, setPlannerConfig, setConfigUrl, navigateWeek } from '../core/state.js';
import { fetchAndParseConfig } from '../api/configService.js';
import { showNotification } from './notifications.js';
import { openDayEditorModal } from './renderer.js';

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
  const dayCell = e.target.closest('.day-cell');
  if (!dayCell) return;
  openDayEditorModal(dayCell.dataset.date);
}

export function initializeEventListeners() {
  document.getElementById('reset-btn').addEventListener('click', () => { if(confirm('Sei sicuro?')) resetWeeklyPlan(); });
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
  
  // General close buttons, EXCLUDING the selection modal which has special logic
  document.querySelectorAll('.modal-close-btn:not([data-target=selection-modal])').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById(e.target.dataset.target).classList.add('modal-hidden');
    });
  });

  // Click-outside-to-close, EXCLUDING the selection modal
  document.querySelectorAll('.modal-overlay:not(#selection-modal)').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('modal-hidden');
      }
    });
  });

  document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);

  document.getElementById('prev-week-btn').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('next-week-btn').addEventListener('click', () => navigateWeek(1));
}
