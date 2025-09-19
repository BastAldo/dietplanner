import { DAYS, MEAL_TYPES } from '../utils/constants.js';

function renderCalendar(element, state) {
  element.innerHTML = '';
  element.insertAdjacentHTML('beforeend', '<div class="grid-header"></div>' + DAYS.map(day => `<div class="grid-header">${day.substring(0,3)}</div>`).join(''));
  MEAL_TYPES.forEach(mealType => {
    element.insertAdjacentHTML('beforeend', `<div class="meal-type-label">${mealType}</div>`);
    DAYS.forEach(day => {
      const slotId = `${day}-${mealType}`;
      const mealId = state.weeklyPlan[slotId];
      const meal = mealId ? state.masterMealList.find(m => m.id === mealId) : null;
      let mealCardHTML = '';
      if (meal) {
        const isMismatched = meal.tipoPasto !== mealType ? 'is-mismatched' : '';
        mealCardHTML = `<div class="meal-card ${isMismatched}" draggable="true" data-meal-id="${meal.id}">
            <button class="delete-meal-btn" data-slot-id="${slotId}">&times;</button>
            <h4>${meal.nomePasto}</h4>
            <p>${meal.ingredienti || ''}</p>
          </div>`;
      }
      element.insertAdjacentHTML('beforeend', `<div class="calendar-slot" data-slot-id="${slotId}">${mealCardHTML}</div>`);
    });
  });
}

function renderMealLibrary(element, state) {
  const filteredMeals = state.masterMealList.filter(meal => 
    state.activeFilter === 'all' || meal.tipoPasto === state.activeFilter
  );
  if (filteredMeals.length === 0 && state.masterMealList.length > 0) {
     element.innerHTML = `<p>Nessun pasto per il filtro '${state.activeFilter}'.</p>`;
     return;
  }
  element.innerHTML = filteredMeals.map(meal => `
    <div class="meal-card" draggable="true" data-meal-id="${meal.id}">
      <h4>${meal.nomePasto}</h4><p>(${meal.tipoPasto})</p>
    </div>`).join('');
}

function renderFilters(element, state) {
    element.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.filter === state.activeFilter);
    });
}

export function renderApp() {
  const state = window.getState(); // Assuming getState is globally available or passed
  renderCalendar(document.getElementById('calendar-grid'), state);
  renderMealLibrary(document.getElementById('meal-library'), state);
  renderFilters(document.getElementById('filter-container'), state);
  const urlInput = document.getElementById('config-url-input');
  if (document.activeElement !== urlInput) {
    urlInput.value = state.configUrl;
  }
}
