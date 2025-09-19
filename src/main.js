import { loadStateFromLocalStorage, getState, setPlannerConfig } from './core/state.js';
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
function init() {
  populateInitialText();
  document.addEventListener('stateChange', renderApp);
  loadStateFromLocalStorage();
  const initialState = getState();
  document.getElementById('config-url-input').value = initialState.configUrl || DEFAULT_CONFIG_URL;
  initializeEventListeners();
  renderApp();
  loadInitialConfig(initialState.configUrl);
}
document.addEventListener('DOMContentLoaded', init);
