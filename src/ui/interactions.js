import { resetCurrentWeek, setPlannerConfig, setConfigUrl, navigateWeek, setView, copyPreviousWeek, getState } from '../core/state.js';
import { fetchAndParseConfig } from '../api/configService.js';
import { showNotification } from './notifications.js';
import { openDayEditorModal, showConfirmModal, showRecipeModal } from './renderer.js';

async function handleLoadConfig() {
  const url = document.getElementById('config-url-input').value.trim();
  if (!url) {
    showNotification('Per favore, inserisci un URL.', 'error');
    return;
  }
  setConfigUrl(url);
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config);
    showNotification('Configurazione caricata!', 'success');
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
    showNotification('Nessun URL di configurazione da condividere.', 'info');
    return;
  }
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?configUrl=${encodeURIComponent(state.configUrl)}`;
  
  navigator.clipboard.writeText(shareUrl).then(() => {
    showNotification('Link di condivisione copiato!', 'success');
  }).catch(() => {
    showNotification('Impossibile copiare il link.', 'error');
  });
}

function handleCopyWeek() {
  showConfirmModal(
    'Copia Settimana',
    'Sei sicuro di voler sovrascrivere il piano di questa settimana con quello della settimana precedente?',
    () => {
      copyPreviousWeek();
      showNotification('Piano settimanale copiato!', 'success');
    },
    'primary'
  );
}

function handleResetWeek() {
  showConfirmModal(
    'Pulisci Settimana',
    'Sei sicuro di voler cancellare tutti i pasti da questa settimana? L\'azione è irreversibile.',
    () => {
      resetCurrentWeek();
      showNotification('Settimana pulita!', 'info');
    },
    'danger'
  );
}

export function initializeEventListeners() {
  document.getElementById('reset-btn').addEventListener('click', handleResetWeek);
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
