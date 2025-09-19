import { loadStateFromLocalStorage, getState } from './core/state.js';
import { renderCalendar } from './ui/calendar.js';
import { renderMealLibrary } from './ui/library.js';
import { initializeEventListeners } from './ui/interactions.js';
import { DEFAULT_CSV_URL } from './utils/constants.js';

const calendarGridElement = document.getElementById('calendar-grid');
const mealLibraryElement = document.getElementById('meal-library');
const csvUrlInputElement = document.getElementById('csv-url-input');

function renderApp() {
  const currentState = getState();
  renderCalendar(calendarGridElement, currentState);
  renderMealLibrary(mealLibraryElement, currentState);
  if (document.activeElement !== csvUrlInputElement) {
    csvUrlInputElement.value = currentState.csvUrl;
  }
}

function init() {
  document.addEventListener('stateChange', renderApp);
  loadStateFromLocalStorage();
  const initialState = getState();
  csvUrlInputElement.value = initialState.csvUrl || DEFAULT_CSV_URL;
  initializeEventListeners();
  renderApp();
}
document.addEventListener('DOMContentLoaded', init);
