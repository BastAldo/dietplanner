import {
  resetCurrentWeek, setPlannerConfig, setConfigUrl, navigateWeek, setView,
  copyPreviousWeek, getState, setAppState, addOrUpdateBiometricEntry,
  deleteBiometricEntry, saveUserProfile
} from '../core/state.js';
import { calculateBMR } from '../core/calculations.js';
import { fetchAndParseConfig } from '../api/configService.js';
import { showNotification } from './notifications.js';
import { openDayEditorModal, showConfirmModal, showRecipeModal } from './modals.js';
import { UI_TEXT } from '../utils/constants.js';
import { log } from '../utils/logger.js';

async function handleLoadConfig() {
  log('Interactions', 'Handling config load button click');
  const url = document.getElementById('config-url-input').value.trim();
  if (!url) { showNotification(UI_TEXT.CONFIG_URL_EMPTY_ERROR, 'error'); return; }
  setConfigUrl(url);
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config);
    showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
  } catch (error) { showNotification(error.message, 'error'); }
}

function handleCalendarClick(e) {
  const dayCell = e.target.closest('.day-cell');
  if (dayCell) {
    log('Interactions', 'Calendar cell clicked', { date: dayCell.dataset.date });
    openDayEditorModal(dayCell.dataset.date);
  }
}

function handleRecipeClick(e) {
  const recipeItem = e.target.closest('.recipe-list-item');
  if (recipeItem) {
    const state = getState();
    const meal = state.masterMealList.find(m => m.id === recipeItem.dataset.mealId);
    if (meal) {
      log('Interactions', 'Recipe list item clicked', { mealId: meal.id });
      showRecipeModal(meal);
    }
  }
}

function handleLogViewClick(e) {
  const btnRecipe = e.target.closest('.btn-view-recipe');
  if (btnRecipe) {
    const state = getState();
    const meal = state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
    if (meal) {
      log('Interactions', 'Recipe button in log view clicked', { mealId: meal.id });
      showRecipeModal(meal);
    }
  }
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
    biometricData: state.biometricData,
    userProfile: state.userProfile
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
                    showConfirmModal(
                        UI_TEXT.RESTORE_CONFIRM_TITLE,
                        UI_TEXT.RESTORE_CONFIRM_MSG,
                        () => { setAppState(backupData); showNotification(UI_TEXT.RESTORE_SUCCESS, 'success'); },
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
  log('Interactions', 'Copy week button clicked');
  showConfirmModal(
    UI_TEXT.COPY_WEEK_CONFIRM_TITLE, UI_TEXT.COPY_WEEK_CONFIRM_MSG,
    () => { copyPreviousWeek(); showNotification(UI_TEXT.COPY_WEEK_SUCCESS, 'success'); }, 'primary'
  );
}

function handleResetWeek() {
  log('Interactions', 'Reset week button clicked');
  showConfirmModal(
    UI_TEXT.RESET_WEEK_CONFIRM_TITLE, UI_TEXT.RESET_WEEK_CONFIRM_MSG,
    () => { resetCurrentWeek(); showNotification(UI_TEXT.RESET_WEEK_SUCCESS, 'info'); }, 'danger'
  );
}

function handleBiometricsForm(e) {
  e.preventDefault();
  log('Interactions', 'Biometrics form submitted');
  const formData = new FormData(e.target);
  const entry = {};
  for (let [key, value] of formData.entries()) { entry[key] = value; }
  addOrUpdateBiometricEntry(entry);
  showNotification(UI_TEXT.BIOMETRICS_SAVE_SUCCESS, 'success');
  e.target.reset();
  document.getElementById('bio-date').value = new Date().toISOString().slice(0, 10);
}

function handleBiometricsListClick(e) {
  const btnMenu = e.target.closest('.btn-actions-menu');
  if (btnMenu) {
      log('Interactions', 'Biometrics actions menu toggled');
      const dropdown = btnMenu.nextElementSibling;
      const allDropdowns = document.querySelectorAll('.actions-dropdown');
      allDropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
      dropdown.classList.toggle('show');
      return;
  }

  const btnEdit = e.target.closest('.btn-edit-biometrics');
  if (btnEdit) {
      const date = btnEdit.dataset.date;
      log('Interactions', 'Edit biometrics button clicked', { date });
      const entry = getState().biometricData.find(e => e.date === date);
      if (entry) {
          const form = document.getElementById('biometrics-form');
          for (const key in entry) {
              if (form.elements[key]) { form.elements[key].value = entry[key]; }
          }
          form.scrollIntoView({ behavior: 'smooth' });
      }
      const dropdown = btnEdit.closest('.actions-dropdown');
      if (dropdown) dropdown.classList.remove('show');
      return;
  }

  const btnDelete = e.target.closest('.btn-delete-biometrics');
  if (btnDelete) {
      const date = btnDelete.dataset.date;
      log('Interactions', 'Delete biometrics button clicked', { date });
      showConfirmModal(
          UI_TEXT.BIOMETRICS_DELETE_CONFIRM_TITLE, UI_TEXT.BIOMETRICS_DELETE_CONFIRM_MSG,
          () => { deleteBiometricEntry(date); showNotification(UI_TEXT.BIOMETRICS_DELETE_SUCCESS, 'info'); }, 'danger'
      );
      const dropdown = btnDelete.closest('.actions-dropdown');
      if (dropdown) dropdown.classList.remove('show');
      return;
  }

  // Close dropdown if clicking outside
  if (!e.target.closest('.biometrics-actions')) {
      document.querySelectorAll('.actions-dropdown').forEach(d => d.classList.remove('show'));
  }
}

function handleProfileForm(e) {
  e.preventDefault();
  log('Interactions', 'Profile form submitted');
  const formData = new FormData(e.target);
  const profile = {};
  for (let [key, value] of formData.entries()) { profile[key] = value; }
  saveUserProfile(profile);
  showNotification(UI_TEXT.PROFILE_SAVE_SUCCESS, 'success');
}

function handleWeightInputChange(e) {
  const weight = e.target.value;
  const { userProfile } = getState();
  const bmrField = document.getElementById('bio-basalMetabolism');
  const bmr = calculateBMR(userProfile, weight);
  if (bmr !== null) {
    bmrField.value = bmr;
  } else {
    bmrField.value = '';
    bmrField.placeholder = UI_TEXT.BIOMETRICS_BMR_PLACEHOLDER;
  }
}

export function initializeEventListeners() {
  document.addEventListener('click', (e) => {
      if (!e.target.closest('.biometrics-actions')) {
          document.querySelectorAll('.actions-dropdown').forEach(d => d.classList.remove('show'));
      }
  });
  document.getElementById('backup-btn').addEventListener('click', handleSaveBackup);
  document.getElementById('restore-btn').addEventListener('click', handleRestoreBackup);
  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
  document.getElementById('nav-planner').addEventListener('click', () => setView('planner'));
  document.getElementById('nav-progress').addEventListener('click', () => setView('progress'));
  document.getElementById('nav-charts').addEventListener('click', () => setView('charts'));
  document.getElementById('nav-recipes').addEventListener('click', () => setView('recipes'));
  document.getElementById('nav-profile').addEventListener('click', () => setView('profile'));
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('share-config-btn').addEventListener('click', handleShareConfig);
  document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);
  document.getElementById('log-view').addEventListener('click', handleLogViewClick);
  document.getElementById('recipes-page').addEventListener('click', handleRecipeClick);
  document.getElementById('prev-week-btn').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('next-week-btn').addEventListener('click', () => navigateWeek(1));
  document.getElementById('view-calendar-btn').addEventListener('click', () => setView('planner'));
  document.getElementById('view-log-btn').addEventListener('click', () => setView('log'));
  document.getElementById('copy-week-btn').addEventListener('click', handleCopyWeek);
  document.getElementById('reset-btn').addEventListener('click', handleResetWeek);
  document.getElementById('biometrics-form').addEventListener('submit', handleBiometricsForm);
  document.getElementById('progress-page').addEventListener('click', handleBiometricsListClick);
  document.getElementById('profile-form').addEventListener('submit', handleProfileForm);

  document.getElementById('progress-page').addEventListener('input', e => {
    if (e.target.id === 'bio-weight') { handleWeightInputChange(e); }
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const modalId = e.currentTarget.dataset.target;
      if (modalId) { document.getElementById(modalId).classList.add('modal-hidden'); }
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.classList.add('modal-hidden'); } });
  });
  document.getElementById('global-alert-close').addEventListener('click', () => { document.getElementById('global-alert').classList.add('hidden'); });
}
console.log("debug grafici1")
