import { addManualWorkoutToHistory } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { openDayEditorModal } from './dayEditorModal.js';

export function openManualWorkoutModal(isoDate) {
  log('Modals', 'Opening manual workout modal', { isoDate });
  const modal = document.getElementById('manual-workout-modal');
  const form = modal.querySelector('#manual-workout-form');

  // Imposta i testi dall'UI_TEXT
  modal.querySelector('#manual-workout-modal-title').textContent = UI_TEXT.MANUAL_WORKOUT_MODAL_TITLE;
  modal.querySelector('#manual-workout-name-label').textContent = UI_TEXT.MANUAL_WORKOUT_NAME_LABEL;
  modal.querySelector('#manual-workout-duration-label').textContent = UI_TEXT.MANUAL_WORKOUT_DURATION_LABEL;
  modal.querySelector('#manual-workout-details-label').textContent = UI_TEXT.MANUAL_WORKOUT_DETAILS_LABEL;
  modal.querySelector('#manual-workout-save-btn').textContent = UI_TEXT.MANUAL_WORKOUT_SAVE_BTN;

  form.reset();

  form.onsubmit = e => {
    e.preventDefault();
    const formData = new FormData(form);
    const activityData = {
      name: formData.get('name'),
      duration: formData.get('duration'),
      details: formData.get('details')
    };
    addManualWorkoutToHistory(isoDate, activityData);
    modal.classList.add('modal-hidden');
    openDayEditorModal(isoDate); // Riapri l'editor del giorno per vedere il risultato
  };

  modal.classList.remove('modal-hidden');
}
