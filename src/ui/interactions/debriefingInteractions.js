import { getState, setView, updateWorkoutInHistory } from '../../core/state.js';
import { log } from '../../utils/logger.js';
import { showNotification } from '../notifications.js';
import { speak } from '../../utils/audioFeedback.js';
import { UI_TEXT } from '../../config/uiText.js';

function formatDurationForSpeech(ms) {
    if (typeof ms !== 'number' || ms < 0) return '0 secondi';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    let text = '';
    if (minutes > 0) text += `${minutes} minut${minutes > 1 ? 'i' : 'o'}`;
    if (seconds > 0) text += ` e ${seconds} second${seconds > 1 ? 'i' : 'o'}`;
    return text.trim();
}

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

function handlePlaySummaryAudio() {
  const { lastWorkoutSummary } = getState();
  if (!lastWorkoutSummary) return;

  log('Interactions', 'Play debriefing summary audio');

  const { totalTime, totalCaloriesBurned } = lastWorkoutSummary;
  const timeText = formatDurationForSpeech(totalTime);
  const caloriesText = totalCaloriesBurned > 0 ? `e hai bruciato ${totalCaloriesBurned} calorie.` : '';

  const summaryText = `
    Riepilogo allenamento.
    Tempo totale: ${timeText}.
    ${caloriesText}
    Ottimo lavoro!
  `;
  speak(summaryText);
}

export function initializeDebriefingListeners() {
  const debriefingPage = document.getElementById('debriefing-page');
  debriefingPage.addEventListener('click', (e) => {
    if (e.target.id === 'back-to-planner-btn') {
      handleBackToPlanner();
    } else if (e.target.id === 'save-rpe-btn') {
      handleSaveRPE();
    } else if (e.target.closest('#speak-summary-btn')) {
      handlePlaySummaryAudio();
    }
  });
}
