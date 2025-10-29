import { loadStateFromLocalStorage, getState, setPlannerConfig, setConfigUrl, toggleDebugMode } from './core/state.js';
import { renderApp, populateInitialText } from './ui/renderer.js';
import { showConfirmModal } from './ui/modals.js';
import { initializeGlobalListeners } from './ui/interactions/globalInteractions.js';
import { initializePlannerListeners } from './ui/interactions/plannerInteractions.js';
import { initializeProgressListeners } from './ui/interactions/progressInteractions.js';
import { initializeProfileListeners } from './ui/interactions/profileInteractions.js';
import { initializeDebriefingListeners } from './ui/interactions/debriefingInteractions.js';
import { initializeGoalsListeners } from './ui/interactions/goalsInteractions.js';
import { initializeChartsListeners } from './ui/interactions/chartsInteractions.js';
import { initializeLibraryListeners } from './ui/interactions/libraryInteractions.js';
import { initializeExploreListeners } from './ui/interactions/exploreInteractions.js';
import { loadViews } from './ui/viewLoader.js';
import { DEFAULT_CONFIG_URL } from './utils/constants.js';
import { UI_TEXT } from './config/uiText.js';
import { fetchAndParseConfig } from './api/configService.js';
import { showNotification } from './ui/notifications.js';

async function loadConfig(url) {
  if (!url) {
    setPlannerConfig({}, url);
    return;
  };
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config, url);
    showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
  } catch (error) {
    showNotification(error.message, 'error');
    setPlannerConfig({}, url);
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

  initializeGlobalListeners();
  initializePlannerListeners();
  initializeProgressListeners();
  initializeProfileListeners();
  initializeDebriefingListeners();
  initializeGoalsListeners();
  initializeChartsListeners();
  initializeLibraryListeners();
  initializeExploreListeners();

  renderApp();

  window.toggleDebugMode = toggleDebugMode;

  const urlParams = new URLSearchParams(window.location.search);
  const configUrlFromParam = urlParams.get('configUrl');

  if (configUrlFromParam) {
    const decodedUrl = decodeURIComponent(configUrlFromParam);
    initialState = getState();
    if (decodedUrl !== initialState.configUrl) {
      showConfirmModal({
        title: UI_TEXT.LOAD_SHARED_CONFIG_TITLE,
        message: UI_TEXT.LOAD_SHARED_CONFIG_MSG,
        onConfirm: () => {
          setConfigUrl(decodedUrl);
          document.getElementById('config-url-input').value = decodedUrl;
          loadConfig(decodedUrl);
        },
        type: 'primary'
      });
    } else {
      await loadConfig(initialState.configUrl);
    }
  } else {
    await loadConfig(initialState.configUrl);
  }

  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
