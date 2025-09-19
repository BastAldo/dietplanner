import { DAYS, MEAL_TYPES } from '../utils/constants.js';
export function renderCalendar(element, state) {
  element.innerHTML = '';
  element.insertAdjacentHTML('beforeend', '<div class="grid-header"></div>' + DAYS.map(day => `<div class="grid-header">${day.substring(0,3)}</div>`).join(''));
  MEAL_TYPES.forEach(mealType => {
    element.insertAdjacentHTML('beforeend', `<div class="meal-type-label">${mealType}</div>`);
    DAYS.forEach(day => {
      const slotId = `${day}-${mealType}`;
      const mealId = state.weeklyPlan[slotId];
      const meal = mealId ? state.masterMealList.find(m => m.id === mealId) : null;
      const mealCardHTML = meal ? `<div class="meal-card" draggable="true" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4><p>${meal.ingredienti || ''}</p></div>` : '';
      element.insertAdjacentHTML('beforeend', `<div class="calendar-slot" data-slot-id="${slotId}">${mealCardHTML}</div>`);
    });
  });
}
