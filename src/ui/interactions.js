import { resetCurrentWeek, setPlannerConfig, setConfigUrl, navigateWeek, setView, copyPreviousWeek, getState } from '../core/state.js';
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

function handleSaveBackup() {
  const state = getState();
  const backupData = {
    configUrl: state.configUrl,
    weeklyPlan: state.weeklyPlan
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nutriplan_backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification(UI_TEXT.BACKUP_SUCCESS, 'success');
}

function handleCopyWeek() {
  showConfirmModal(
    UI_TEXT.COPY_WEEK_CONFIRM_TITLE,
    UI_TEXT.COPY_WEEK_CONFIRM_MSG,
    () => {
      copyPreviousWeek();
      showNotification(UI_TEXT.COPY_WEEK_SUCCESS, 'success');
    },
    'primary'
  );
}

function handleResetWeek() {
  showConfirmModal(
    UI_TEXT.RESET_WEEK_CONFIRM_TITLE,
    UI_TEXT.RESET_WEEK_CONFIRM_MSG,
    () => {
      resetCurrentWeek();
      showNotification(UI_TEXT.RESET_WEEK_SUCCESS, 'info');
    },
    'danger'
  );
}

export function initializeEventListeners() {
  document.getElementById('reset-btn').addEventListener('click', handleResetWeek);
  document.getElementById('backup-btn').addEventListener('click', handleSaveBackup);
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
  
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalId = e.target.dataset.target;
      if (modalId) {
        document.getElementById(modalId).classList.add('modal-hidden');
      }
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('modal-hidden');
      }
    });
  });

  document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);
  document.getElementById('log-view').addEventListener('click', handleLogViewClick);
  document.getElementById('prev-week-btn').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('next-week-btn').addEventListener('click', () => navigateWeek(1));

  document.getElementById('view-calendar-btn').addEventListener('click', () => setView('calendar'));
  document.getElementById('view-log-btn').addEventListener('click', () => setView('log'));
  document.getElementById('copy-week-btn').addEventListener('click', handleCopyWeek);
  document.getElementById('share-config-btn').addEventListener('click', handleShareConfig);

  document.getElementById('global-alert-close').addEventListener('click', () => {
      document.getElementById('global-alert').classList.add('hidden');
  });
}
