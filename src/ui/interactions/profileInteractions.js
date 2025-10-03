import { saveUserProfile } from '../../core/state.js';
import { showNotification } from '../notifications.js';
import { UI_TEXT } from '../../utils/constants.js';
import { log } from '../../utils/logger.js';

function handleProfileForm(e) {
  e.preventDefault();
  log('Interactions', 'Profile form submitted');
  const formData = new FormData(e.target);
  const profile = {};
  for (let [key, value] of formData.entries()) { profile[key] = value; }
  saveUserProfile(profile);
  showNotification(UI_TEXT.PROFILE_SAVE_SUCCESS, 'success');
}

export function initializeProfileListeners() {
  document.getElementById('profile-form').addEventListener('submit', handleProfileForm);
}
