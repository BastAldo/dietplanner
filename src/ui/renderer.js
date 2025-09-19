import { getState, updateWeeklyPlan } from '../core/state.js';
import { DAYS, MEAL_TYPES } from '../utils/constants.js';

const selectionModal = document.getElementById('selection-modal');
const selectionModalTitle = document.getElementById('selection-modal-title');
const selectionModalList = document.getElementById('selection-modal-list');

function renderDesktopCalendar(element, state) {
  element.innerHTML = '';
  element.insertAdjacentHTML('beforeend', '<div class="meal-type-label"></div>' + DAYS.map(day => `<div class="grid-header">${day}</div>`).join(''));
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

function renderMobileCalendar(element, state) {
  element.innerHTML = '';
  DAYS.forEach(day => {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.innerHTML = `<div class="day-header">${day}</div><div class="day-slots"></div>`;
    const slotsContainer = dayCard.querySelector('.day-slots');
    MEAL_TYPES.forEach(mealType => {
      const slotId = `${day}-${mealType}`;
      const mealId = state.weeklyPlan[slotId];
      const meal = mealId ? state.masterMealList.find(m => m.id === mealId) : null;
      let mealCardHTML = '';
      if (meal) {
        mealCardHTML = `<div class="meal-card">
            <button class="delete-meal-btn" data-slot-id="${slotId}">&times;</button>
            <h4>${meal.nomePasto}</h4>
            <p>${meal.ingredienti || ''}</p>
          </div>`;
      }
      slotsContainer.innerHTML += `
        <div class="meal-type-label-mobile">${mealType}</div>
        <div class="calendar-slot" data-slot-id="${slotId}">${mealCardHTML}</div>
      `;
    });
    element.appendChild(dayCard);
  });
}

export function openSelectionModal(slotId) {
  const state = getState();
  const [day, mealType] = slotId.split('-');
  selectionModalTitle.textContent = `Scegli ${mealType} per ${day}`;
  const relevantMeals = state.masterMealList.filter(m => m.tipoPasto === mealType);
  selectionModalList.innerHTML = relevantMeals.map(meal => 
    `<div class="selection-item" data-meal-id="${meal.id}">
       <h4>${meal.nomePasto}</h4>
       <p>${meal.ingredienti || ''}</p>
     </div>`
  ).join('');
  selectionModalList.onclick = (e) => {
    const item = e.target.closest('.selection-item');
    if(item) {
      updateWeeklyPlan(slotId, item.dataset.mealId);
      selectionModal.classList.add('modal-hidden');
    }
  };
  selectionModal.classList.remove('modal-hidden');
}

function renderMealLibrary(element, state) {
  const filteredMeals = state.masterMealList.filter(meal => state.activeFilter === 'all' || meal.tipoPasto === state.activeFilter);
  if (state.masterMealList.length > 0 && filteredMeals.length === 0) {
     element.innerHTML = `<p>Nessun pasto per il filtro '${state.activeFilter}'.</p>`; return;
  }
  if (state.masterMealList.length === 0) {
      element.innerHTML = '<p>Carica una configurazione per iniziare.</p>'; return;
  }
  element.innerHTML = filteredMeals.map(meal => `<div class="meal-card" draggable="${window.matchMedia('(min-width: 768px)').matches}" data-meal-id="${meal.id}">
      <h4>${meal.nomePasto}</h4><p>(${meal.tipoPasto})</p>
    </div>`).join('');
}

function renderFilters(element, state) {
    element.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.filter === state.activeFilter);
    });
}

export function renderApp() {
  const state = getState();
  if (window.matchMedia('(min-width: 768px)').matches) {
    renderDesktopCalendar(document.getElementById('calendar-grid'), state);
  } else {
    renderMobileCalendar(document.getElementById('calendar-grid'), state);
  }
  renderMealLibrary(document.getElementById('meal-library'), state);
  renderFilters(document.getElementById('filter-container'), state);
  const urlInput = document.getElementById('config-url-input');
  if (document.activeElement !== urlInput) { urlInput.value = state.configUrl; }
}
