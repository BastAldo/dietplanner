import { setView, updateWorkoutInHistory } from '../../core/state.js';
import { log } from '../../utils/logger.js';
import { showNotification } from '../notifications.js';

function handleBackToPlanner() {
  log('Interactions', 'Back to planner button clicked from debriefing');
  setView('planner');
}

function handleSaveRPE() {
  const rpeInput = document.getElementById('rpe-input');
  const rpeValue = parseInt(rpeInput.value, 10);
  if (rpeValue >= 1 && rpeValue <= 10) {
    const { lastWorkoutSummary } = getState();
    if (lastWorkoutSummary) {
      updateWorkoutInHistory(lastWorkoutSummary.date, lastWorkoutSummary.startTime, { rpe: rpeValue });
      showNotification('RPE salvato!', 'success');
      rpeInput.disabled = true;
      document.getElementById('save-rpe-btn').disabled = true;
    }
  } else {
    showNotification('Inserisci un valore RPE valido (1-10)', 'error');
  }
}

export function initializeDebriefingListeners() {
  const debriefingPage = document.getElementById('debriefing-page');
  debriefingPage.addEventListener('click', (e) => {
    if (e.target.id === 'back-to-planner-btn') {
      handleBackToPlanner();
    } else if (e.target.id === 'save-rpe-btn') {
      handleSaveRPE();
    }
  });
}
