import { loadStateFromLocalStorage, getState, setPlannerConfig, setConfigUrl } from './core/state.js';
import { renderApp, populateInitialText } from './ui/renderer.js';
import { showConfirmModal } from './ui/modals.js';
import { initializeEventListeners } from './ui/interactions.js';
import { loadViews } from './ui/viewLoader.js';
import { DEFAULT_CONFIG_URL } from './utils/constants.js';
import { fetchAndParseConfig } from './api/configService.js';
import { showNotification } from './ui/notifications.js';
import { UI_TEXT } from './utils/constants.js';

async function loadConfig(url) {
  if (!url) {
    setPlannerConfig({}); // Clear master list if no URL
    return;
  };
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config);
    showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
  } catch (error) {
    showNotification(error.message, 'error');
    setPlannerConfig({}); // Clear master list on error
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/dietplanner/sw.js')
        .then(registration => console.log('ServiceWorker registration successful'))
        .catch(err => console.log('ServiceWorker registration failed: ', err));
    });
  }
}

async function init() {
  await loadViews();
  document.addEventListener('stateChange', renderApp);
  
  loadStateFromLocalStorage();
  let initialState = getState();
  document.getElementById('config-url-input').value = initialState.configUrl || DEFAULT_CONFIG_URL;

  populateInitialText();
  initializeEventListeners();
  renderApp(); // Initial render with local data

  const urlParams = new URLSearchParams(window.location.search);
  const configUrlFromParam = urlParams.get('configUrl');

  if (configUrlFromParam) {
    const decodedUrl = decodeURIComponent(configUrlFromParam);
    initialState = getState(); // Get fresh state
    if (decodedUrl !== initialState.configUrl) {
      showConfirmModal(
        UI_TEXT.LOAD_SHARED_CONFIG_TITLE,
        UI_TEXT.LOAD_SHARED_CONFIG_MSG,
        () => {
          setConfigUrl(decodedUrl);
          loadConfig(decodedUrl);
        },
        'primary'
      );
    } else {
      await loadConfig(initialState.configUrl);
    }
  } else {
    await loadConfig(initialState.configUrl);
  }
  
  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
console.log("test refactor js")