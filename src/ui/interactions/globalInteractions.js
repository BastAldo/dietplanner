import { setView, getState, setAppState } from '../../core/state.js';
import { showConfirmModal } from '../modals.js';
import { showNotification } from '../notifications.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';

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
    userGoals: state.userGoals
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

export function initializeGlobalListeners() {
  document.getElementById('backup-btn').addEventListener('click', handleSaveBackup);
  document.getElementById('restore-btn').addEventListener('click', handleRestoreBackup);
  document.getElementById('share-config-btn').addEventListener('click', handleShareConfig);

  document.getElementById('nav-planner').addEventListener('click', () => setView('planner'));
  document.getElementById('nav-progress').addEventListener('click', () => setView('progress'));
  document.getElementById('nav-charts').addEventListener('click', () => setView('charts'));
  document.getElementById('nav-recipes').addEventListener('click', () => setView('recipes'));
  document.getElementById('nav-goals').addEventListener('click', () => setView('goals'));
  document.getElementById('nav-profile').addEventListener('click', () => setView('profile'));

  document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));

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
