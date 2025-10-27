import { saveUserProfile, setConfigUrl, setAppState } from '../../core/state.js';
import { showNotification } from '../notifications.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { PROFILE_FIELDS } from '../../config/forms.js';
import { fetchAndParseConfig } from '../../api/configService.js';
import { showConfirmModal } from '../modals.js';
import { getState } from '../../core/state.js';

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

async function handleLoadConfig() {
  log('Interactions', 'Handling config load button click from profile');
  const url = document.getElementById('config-url-input').value.trim();
  if (!url) { showNotification(UI_TEXT.CONFIG_URL_EMPTY_ERROR, 'error'); return; }
  setConfigUrl(url);
  try {
    const config = await fetchAndParseConfig(url);
    // Note: setPlannerConfig now intelligently merges data
    setPlannerConfig(config, url);
    showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
  } catch (error) { showNotification(error.message, 'error'); }
}

function handleShareConfig() {
  log('Interactions', 'Share config button clicked');
  const state = getState();
  if (!state.configUrl) { showNotification(UI_TEXT.SHARE_NO_URL_INFO, 'info'); return; }
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?configUrl=${encodeURIComponent(state.configUrl)}`;
  navigator.clipboard.writeText(shareUrl).then(() => {
    showNotification(UI_TEXT.SHARE_SUCCESS, 'success');
  }).catch(() => { showNotification(UI_TEXT.SHARE_ERROR, 'error'); });
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification(UI_TEXT.BACKUP_SUCCESS, 'success');
}

async function handleSaveBackup() {
  log('Interactions', 'Save backup button clicked');
  const state = getState();
  const backupData = {
    configUrl: state.configUrl,
    weeklyPlan: state.weeklyPlan,
    weeklyWorkouts: state.weeklyWorkouts,
    workoutHistory: state.workoutHistory,
    biometricData: state.biometricData,
    userProfile: state.userProfile,
    userGoals: state.userGoals,
    masterIngredientList: state.masterIngredientList,
    masterMealList: state.masterMealList
  };
  const fileName = 'healtypro_backup.txt';
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'text/plain' });
  const file = new File([blob], fileName, { type: 'text/plain' });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ title: UI_TEXT.BACKUP_SHARE_TITLE, files: [file] });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Web Share API failed, falling back to download:', error);
        triggerDownload(blob, fileName);
      }
    }
  } else { triggerDownload(blob, fileName); }
}

function handleRestoreBackup() {
    log('Interactions', 'Restore backup button clicked');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.txt,application/json,text/plain';
    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = readerEvent => {
            try {
                const content = readerEvent.target.result;
                const backupData = JSON.parse(content);
                if (typeof backupData.configUrl === 'string' && typeof backupData.weeklyPlan === 'object') {
                    showConfirmModal({
                        title: UI_TEXT.RESTORE_CONFIRM_TITLE,
                        message: UI_TEXT.RESTORE_CONFIRM_MSG,
                        onConfirm: () => { setAppState(backupData); showNotification(UI_TEXT.RESTORE_SUCCESS, 'success'); },
                        type: 'danger'
                    });
                } else { throw new Error('Invalid structure'); }
            } catch (err) { showNotification(UI_TEXT.RESTORE_INVALID_FILE, 'error'); }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

export function initializeProfileListeners() {
  const profilePage = document.getElementById('profile-page');
  profilePage.addEventListener('submit', e => {
    if (e.target.id === 'profile-form') {
      handleProfileForm(e);
    }
  });

  profilePage.addEventListener('click', e => {
    if (e.target.id === 'load-config-btn') handleLoadConfig();
    if (e.target.closest('#share-config-btn')) handleShareConfig();
    if (e.target.id === 'backup-btn') handleSaveBackup();
    if (e.target.id === 'restore-btn') handleRestoreBackup();
    if (e.target.closest('#info-icon')) document.getElementById('info-modal').classList.remove('hidden');
  });
}