import { loadStateFromLocalStorage, getState, setPlannerConfig } from './core/state.js';
import { renderApp } from './ui/renderer.js';
import { initializeEventListeners } from './ui/interactions.js';
import { DEFAULT_CONFIG_URL } from './utils/constants.js';
import { fetchAndParseConfig } from './api/configService.js';
import { showNotification } from './ui/notifications.js';

async function loadInitialConfig(url) { /* ... (invariato) ... */ }

function init() {
  document.addEventListener('stateChange', renderApp);
  loadStateFromLocalStorage();
  const initialState = getState();
  document.getElementById('config-url-input').value = initialState.configUrl || DEFAULT_CONFIG_URL;
  initializeEventListeners(); // Ora gestisce la logica desktop/mobile
  renderApp();
  loadInitialConfig(initialState.configUrl);
}
document.addEventListener('DOMContentLoaded', init);
