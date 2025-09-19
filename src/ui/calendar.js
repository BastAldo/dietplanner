import { DAYS, MEAL_TYPES } from '../utils/constants.js';

/**
 * Renderizza l'intera griglia del calendario.
 * @param {HTMLElement} element - L'elemento contenitore della griglia.
 * @param {Object} state - Lo stato corrente dell'applicazione.
 */
export function renderCalendar(element, state) {
  element.innerHTML = ''; // Pulisce la griglia prima di ridisegnare

  // Aggiunge gli header dei giorni
  element.innerHTML += '<div class="grid-header"></div>'; // Angolo vuoto
  DAYS.forEach(day => {
    element.innerHTML += `<div class="grid-header">${day}</div>`;
  });

  // Aggiunge le righe per tipo di pasto
  MEAL_TYPES.forEach(mealType => {
    element.innerHTML += `<div class="meal-type-label">${mealType}</div>`;
    DAYS.forEach(day => {
      const slotId = `${day}-${mealType}`;
      const mealId = state.weeklyPlan[slotId];
      const meal = mealId ? state.masterMealList.find(m => m.id === mealId) : null;
      
      element.innerHTML += `
        <div class="calendar-slot" data-slot-id="${slotId}">
          ${meal ? createMealCardHTML(meal) : ''}
        </div>
      `;
    });
  });
}

/**
 * Crea l'HTML per una singola card di un pasto.
 * @param {Object} meal - L'oggetto pasto.
 * @returns {string} La stringa HTML della card.
 */
function createMealCardHTML(meal) {
  return `
    <div class="meal-card" draggable="true" data-meal-id="${meal.id}">
      <h4>${meal.nomePasto}</h4>
      <p>${meal.ingredienti}</p>
    </div>
  `;
}
