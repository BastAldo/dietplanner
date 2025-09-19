import { fetchAndParseMeals } from './api/mealService.js';
import { setMasterMealList, loadStateFromLocalStorage, getState } from './core/state.js';
import { renderCalendar } from './ui/calendar.js';
import { renderMealLibrary } from './ui/library.js';
import { initializeEventListeners } from './ui/interactions.js';

// Elementi del DOM
const calendarGridElement = document.getElementById('calendar-grid');
const mealLibraryElement = document.getElementById('meal-library');

/**
 * Funzione principale di render, chiamata ogni volta che lo stato cambia.
 */
function renderApp() {
  const currentState = getState();
  renderCalendar(calendarGridElement, currentState);
  renderMealLibrary(mealLibraryElement, currentState);
}

/**
 * Funzione di inizializzazione dell'applicazione.
 */
async function init() {
  // Aggiunge un listener per l'evento custom 'stateChange'
  document.addEventListener('stateChange', renderApp);

  // Carica lo stato salvato (se presente)
  loadStateFromLocalStorage();

  // Carica i pasti dal CSV e aggiorna lo stato
  const meals = await fetchAndParseMeals();
  setMasterMealList(meals); // Questo triggererà il primo render tramite l'evento

  // Inizializza tutti gli event listener
  initializeEventListeners();
  
  // Render iniziale (potrebbe essere ridondante se setMasterMealList è sincrono, ma sicuro)
  renderApp();
}

// Avvia l'applicazione
document.addEventListener('DOMContentLoaded', init);
