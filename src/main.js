import { loadStateFromLocalStorage, getState, setPlannerConfig, setConfigUrl } from './core/state.js';
import { renderApp, populateInitialText, showConfirmModal } from './ui/renderer.js';
import { initializeEventListeners } from './ui/interactions.js';
import { DEFAULT_CONFIG_URL } from './utils/constants.js';
import { fetchAndParseConfig } from './api/configService.js';
import { showNotification } from './ui/notifications.js';
import { UI_TEXT } from './utils/constants.js';

async function loadConfig(url, isFromUrl) {
  if (!url) return;
  const state = getState();
  if (isFromUrl && url === state.configUrl) return;

  const performLoad = async () => {
    try {
      const config = await fetchAndParseConfig(url);
      setConfigUrl(url);
      setPlannerConfig(config);
      document.getElementById('config-url-input').value = url;
      showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  if (isFromUrl) {
    showConfirmModal(
      UI_TEXT.LOAD_SHARED_CONFIG_TITLE,
      UI_TEXT.LOAD_SHARED_CONFIG_MSG,
      performLoad
    );
  } else {
    await performLoad();
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

function init() {
  document.addEventListener('stateChange', renderApp);
  
  loadStateFromLocalStorage();
  const initialState = getState();
  document.getElementById('config-url-input').value = initialState.configUrl || DEFAULT_CONFIG_URL;

  populateInitialText();
  initializeEventListeners();

  const urlParams = new URLSearchParams(window.location.search);
  const configUrlFromParam = urlParams.get('configUrl');

  if (configUrlFromParam) {
    const decodedUrl = decodeURIComponent(configUrlFromParam);
    loadConfig(decodedUrl, true);
  } else {
    loadConfig(initialState.configUrl, false);
  }

  renderApp();
  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
