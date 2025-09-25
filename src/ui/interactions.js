import {
  resetCurrentWeek, setPlannerConfig, setConfigUrl, navigateWeek, setView,
  copyPreviousWeek, getState, setAppState, addOrUpdateBiometricEntry,
  deleteBiometricEntry, saveUserProfile
} from '../core/state.js';
import { fetchAndParseConfig } from '../api/configService.js';
import { showNotification } from './notifications.js';
import { openDayEditorModal, showConfirmModal, showRecipeModal } from './renderer.js';
import { UI_TEXT } from '../utils/constants.js';

async function handleLoadConfig() {
  const url = document.getElementById('config-url-input').value.trim();
  if (!url) {
    showNotification(UI_TEXT.CONFIG_URL_EMPTY_ERROR, 'error');
    return;
  }
  setConfigUrl(url);
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config);
    showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

function handleCalendarClick(e) {
  const dayCell = e.target.closest('.day-cell');
  if (dayCell) {
      openDayEditorModal(dayCell.dataset.date);
  }
}

function handleLogViewClick(e) {
  const btnRecipe = e.target.closest('.btn-view-recipe');
  if (btnRecipe) {
    const state = getState();
    const meal = state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
    if (meal) {
      showRecipeModal(meal);
    }
  }
}

function handleShareConfig() {
  const state = getState();
  if (!state.configUrl) {
    showNotification(UI_TEXT.SHARE_NO_URL_INFO, 'info');
    return;
  }
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?configUrl=${encodeURIComponent(state.configUrl)}`;
  
  navigator.clipboard.writeText(shareUrl).then(() => {
    showNotification(UI_TEXT.SHARE_SUCCESS, 'success');
  }).catch(() => {
    showNotification(UI_TEXT.SHARE_ERROR, 'error');
  });
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
  const state = getState();
  const backupData = {
    configUrl: state.configUrl,
    weeklyPlan: state.weeklyPlan,
    biometricData: state.biometricData,
    userProfile: state.userProfile
  };
  const fileName = 'healtypro_backup.txt';
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'text/plain' });
  const file = new File([blob], fileName, { type: 'text/plain' });
  
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: UI_TEXT.BACKUP_SHARE_TITLE,
        files: [file],
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Web Share API failed, falling back to download:', error);
        triggerDownload(blob, fileName);
      }
    }
  } else {
    triggerDownload(blob, fileName);
  }
}

function handleRestoreBackup() {
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
                    showConfirmModal(
                        UI_TEXT.RESTORE_CONFIRM_TITLE,
                        UI_TEXT.RESTORE_CONFIRM_MSG,
                        () => {
                            setAppState(backupData);
                            showNotification(UI_TEXT.RESTORE_SUCCESS, 'success');
                        },
                        'danger'
                    );
                } else { throw new Error('Invalid structure'); }
            } catch (err) { showNotification(UI_TEXT.RESTORE_INVALID_FILE, 'error'); }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

function handleCopyWeek() {
  showConfirmModal(
    UI_TEXT.COPY_WEEK_CONFIRM_TITLE,
    UI_TEXT.COPY_WEEK_CONFIRM_MSG,
    () => { copyPreviousWeek(); showNotification(UI_TEXT.COPY_WEEK_SUCCESS, 'success'); },
    'primary'
  );
}

function handleResetWeek() {
  showConfirmModal(
    UI_TEXT.RESET_WEEK_CONFIRM_TITLE,
    UI_TEXT.RESET_WEEK_CONFIRM_MSG,
    () => { resetCurrentWeek(); showNotification(UI_TEXT.RESET_WEEK_SUCCESS, 'info'); },
    'danger'
  );
}

function handleBiometricsForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const entry = {};
  for (let [key, value] of formData.entries()) { entry[key] = value; }
  addOrUpdateBiometricEntry(entry);
  showNotification(UI_TEXT.BIOMETRICS_SAVE_SUCCESS, 'success');
}

function handleBiometricsTableClick(e) {
  const btnEdit = e.target.closest('.btn-edit-biometrics');
  const btnDelete = e.target.closest('.btn-delete-biometrics');

  if (btnEdit) {
      const date = btnEdit.dataset.date;
      const entry = getState().biometricData.find(e => e.date === date);
      if (entry) {
          const form = document.getElementById('biometrics-form');
          for (const key in entry) {
              if (form.elements[key]) { form.elements[key].value = entry[key]; }
          }
          form.scrollIntoView({ behavior: 'smooth' });
      }
  } else if (btnDelete) {
      const date = btnDelete.dataset.date;
      showConfirmModal(
          UI_TEXT.BIOMETRICS_DELETE_CONFIRM_TITLE,
          UI_TEXT.BIOMETRICS_DELETE_CONFIRM_MSG,
          () => { deleteBiometricEntry(date); showNotification(UI_TEXT.BIOMETRICS_DELETE_SUCCESS, 'info'); },
          'danger'
      );
  }
}

function handleProfileForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const profile = {};
  for (let [key, value] of formData.entries()) { profile[key] = value; }
  saveUserProfile(profile);
  showNotification(UI_TEXT.PROFILE_SAVE_SUCCESS, 'success');
}

export function initializeEventListeners() {
  // Global
  document.getElementById('backup-btn').addEventListener('click', handleSaveBackup);
  document.getElementById('restore-btn').addEventListener('click', handleRestoreBackup);
  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
  
  // Navigation
  document.getElementById('nav-planner').addEventListener('click', () => setView('planner'));
  document.getElementById('nav-progress').addEventListener('click', () => setView('progress'));
  document.getElementById('nav-profile').addEventListener('click', () => setView('profile'));

  // Planner Page
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('share-config-btn').addEventListener('click', handleShareConfig);
  document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);
  document.getElementById('log-view').addEventListener('click', handleLogViewClick);
  document.getElementById('prev-week-btn').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('next-week-btn').addEventListener('click', () => navigateWeek(1));
  document.getElementById('view-calendar-btn').addEventListener('click', () => setView('planner')); // Sub-view
  document.getElementById('view-log-btn').addEventListener('click', () => setView('log')); // Sub-view
  document.getElementById('copy-week-btn').addEventListener('click', handleCopyWeek);
  document.getElementById('reset-btn').addEventListener('click', handleResetWeek);

  // Progress Page
  document.getElementById('biometrics-form').addEventListener('submit', handleBiometricsForm);
  document.getElementById('biometrics-table').addEventListener('click', handleBiometricsTableClick);

  // Profile Page
  document.getElementById('profile-form').addEventListener('submit', handleProfileForm);

  // Modals & Alerts
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const modalId = e.target.dataset.target;
      if (modalId) { document.getElementById(modalId).classList.add('modal-hidden'); }
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) { overlay.classList.add('modal-hidden'); }
    });
  });
  document.getElementById('global-alert-close').addEventListener('click', () => {
      document.getElementById('global-alert').classList.add('hidden');
  });
}
