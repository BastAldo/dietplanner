import { saveUserGoals } from '../../core/state.js';
import { showNotification } from '../notifications.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';

function handleGoalsForm(e) {
  e.preventDefault();
  log('Interactions', 'Goals form submitted');
  const formData = new FormData(e.target);
  const goals = {
    avg_calories: parseInt(formData.get('avg_calories'), 10) || 0,
    num_workouts: parseInt(formData.get('num_workouts'), 10) || 0,
  };
  saveUserGoals(goals);
  showNotification(UI_TEXT.GOALS_SAVE_SUCCESS, 'success');
}

export function initializeGoalsListeners() {
  document.getElementById('goals-form').addEventListener('submit', handleGoalsForm);
}
