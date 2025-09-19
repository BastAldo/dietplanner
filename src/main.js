import { loadStateFromLocalStorage, getState } from './core/state.js';
import { renderCalendar } from './ui/calendar.js';
import { renderMealLibrary } from './ui/library.js';
import { initializeEventListeners } from './ui/interactions.js';
import { DEFAULT_CSV_URL } from './utils/constants.js';

function renderApp() {
  const currentState = getState();
  renderCalendar(document.getElementById('calendar-grid'), currentState);
  renderMealLibrary(document.getElementById('meal-library'), currentState);
  const urlInput = document.getElementById('csv-url-input');
  if (document.activeElement !== urlInput) {
    urlInput.value = currentState.csvUrl;
  }
}

function init() {
  document.addEventListener('stateChange', renderApp);
  loadStateFromLocalStorage();
  const initialState = getState();
  document.getElementById('csv-url-input').value = initialState.csvUrl || DEFAULT_CSV_URL;
  initializeEventListeners();
  renderApp();
}
document.addEventListener('DOMContentLoaded', init);
