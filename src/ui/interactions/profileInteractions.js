import { saveUserProfile } from '../../core/state.js';
import { showNotification } from '../notifications.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { PROFILE_FIELDS } from '../../config/forms.js';

function handleProfileForm(e) {
  e.preventDefault();
  log('Interactions', 'Profile form submitted');
  const formData = new FormData(e.target);
  const profile = {};

  // Handle standard fields
  for (let [key, value] of formData.entries()) {
    if (!key.startsWith('planner-pref-')) {
      profile[key] = value;
    }
  }

  // Handle checkbox group for planner preferences
  const plannerPrefsField = PROFILE_FIELDS.find(f => f.id === 'plannerPrefs');
  if (plannerPrefsField) {
    plannerPrefsField.options.forEach(opt => {
      profile[opt.id] = formData.has(opt.id);
    });
  }

  saveUserProfile(profile);
  showNotification(UI_TEXT.PROFILE_SAVE_SUCCESS, 'success');
}

export function initializeProfileListeners() {
  document.getElementById('profile-form').addEventListener('submit', handleProfileForm);
}
