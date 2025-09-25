import { loadStateFromLocalStorage, getState, setPlannerConfig, setConfigUrl } from './core/state.js';
import { renderApp, populateInitialText } from './ui/renderer.js';
import { initializeEventListeners } from './ui/interactions.js';
import { DEFAULT_CONFIG_URL } from './utils/constants.js';
import { fetchAndParseConfig } from './api/configService.js';
import { showNotification } from './ui/notifications.js';

async function loadInitialConfig(url) {
  if (!url) return;
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config);
  } catch (error) {
    showNotification(error.message, 'error');
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
  populateInitialText();
  document.addEventListener('stateChange', renderApp);

  const urlParams = new URLSearchParams(window.location.search);
  const configUrlFromParam = urlParams.get('configUrl');

  if (configUrlFromParam) {
    const decodedUrl = decodeURIComponent(configUrlFromParam);
    setConfigUrl(decodedUrl);
    loadInitialConfig(decodedUrl);
  } else {
    loadStateFromLocalStorage();
    const initialState = getState();
    loadInitialConfig(initialState.configUrl || DEFAULT_CONFIG_URL);
  }
  
  const initialState = getState();
  document.getElementById('config-url-input').value = initialState.configUrl;

  initializeEventListeners();
  renderApp();
  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
