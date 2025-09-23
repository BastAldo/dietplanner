import { updateWeeklyPlan, resetWeeklyPlan, setPlannerConfig, setConfigUrl, navigateWeek } from '../core/state.js';
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
  const dayCell = e.target.closest('.day-cell');
  if (!dayCell) return;

  // In the next step, this will open the "Day Editor" modal.
  // For now, it does nothing to avoid errors.
  console.log(`Day cell clicked: ${dayCell.dataset.date}`);
}

export function initializeEventListeners() {
  document.getElementById('reset-btn').addEventListener('click', () => { if(confirm('Sei sicuro?')) resetWeeklyPlan(); });
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
  
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => document.getElementById(e.target.dataset.target).classList.add('modal-hidden'));
  });

  document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);

  // Event listeners for the new navigation buttons
  document.getElementById('prev-week-btn').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('next-week-btn').addEventListener('click', () => navigateWeek(1));
}
