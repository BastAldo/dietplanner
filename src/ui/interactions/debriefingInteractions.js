import { setView } from '../../core/state.js';
import { log } from '../../utils/logger.js';

function handleBackToPlanner() {
  log('Interactions', 'Back to planner button clicked from debriefing');
  setView('planner');
}

export function initializeDebriefingListeners() {
  const debriefingPage = document.getElementById('debriefing-page');
  debriefingPage.addEventListener('click', (e) => {
    if (e.target.id === 'back-to-planner-btn') {
      handleBackToPlanner();
    }
  });
}
