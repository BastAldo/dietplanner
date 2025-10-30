import { loadStateFromLocalStorage, getState, setPlannerConfig, setContentHubUrl, toggleDebugMode } from './core/state.js';
import { renderApp, populateInitialText } from './ui/renderer.js';
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
  const initialState = getState();
  document.getElementById('content-hub-url-input').value = initialState.contentHubUrl;

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

  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
