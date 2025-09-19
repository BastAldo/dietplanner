import { getState, updateWeeklyPlan } from '../core/state.js';
import { DAYS, MEAL_TYPES, UI_TEXT } from '../utils/constants.js';

const selectionModal = document.getElementById('selection-modal');
const selectionModalTitle = document.getElementById('selection-modal-title');
const selectionModalList = document.getElementById('selection-modal-list');

function calculateDailyCalories(day, state) {
  let min = 0, max = 0;
  MEAL_TYPES.forEach(type => {
    const mealId = state.weeklyPlan[`${day}-${type}`];
    if (mealId) {
      const meal = state.masterMealList.find(m => m.id === mealId);
      if (meal && meal.calories_min && meal.calories_max) {
        min += Number(meal.calories_min);
        max += Number(meal.calories_max);
      }
    }
  });
  return (min === 0 && max === 0) ? '' : `${UI_TEXT.KCAL_LABEL}: ${min} - ${max}`;
}

function createMealCardHTML(meal, slotId, mealType) {
    const isMismatched = meal.tipoPasto !== mealType ? 'is-mismatched' : '';
    return `<div class="meal-card ${isMismatched}">
        <button class="delete-meal-btn" data-slot-id="${slotId}">&times;</button>
        <h4>${meal.nomePasto}</h4>
        <p>${meal.ingredienti || ''}</p>
      </div>`;
}

function renderDesktopCalendar(element, state) {
  element.innerHTML = '';
  const dayHeaders = DAYS.map(day => `<div class="grid-header">${day}<div class="daily-calories">${calculateDailyCalories(day, state)}</div></div>`).join('');
  element.insertAdjacentHTML('beforeend', '<div class="meal-type-label"></div>' + dayHeaders);
  MEAL_TYPES.forEach(mealType => {
    element.insertAdjacentHTML('beforeend', `<div class="meal-type-label">${mealType}</div>`);
    DAYS.forEach(day => {
      const slotId = `${day}-${mealType}`;
      const mealId = state.weeklyPlan[slotId];
      const meal = mealId ? state.masterMealList.find(m => m.id === mealId) : null;
      const mealCardHTML = meal ? createMealCardHTML(meal, slotId, mealType) : '';
      element.insertAdjacentHTML('beforeend', `<div class="calendar-slot" data-slot-id="${slotId}">${mealCardHTML}</div>`);
    });
  });
}

function renderMobileCalendar(element, state) {
  element.innerHTML = '';
  DAYS.forEach(day => {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.innerHTML = `
      <div class="day-header">${day}</div>
      <div class="daily-calories">${calculateDailyCalories(day, state)}</div>
      <div class="day-slots"></div>`;
    const slotsContainer = dayCard.querySelector('.day-slots');
    MEAL_TYPES.forEach(mealType => {
      const slotId = `${day}-${mealType}`;
      const mealId = state.weeklyPlan[slotId];
      const meal = mealId ? state.masterMealList.find(m => m.id === mealId) : null;
      const mealCardHTML = meal ? createMealCardHTML(meal, slotId, mealType) : '';
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
  selectionModalTitle.textContent = `${UI_TEXT.SELECT_MEAL_TITLE} ${mealType} ${UI_TEXT.FOR_DAY_PREFIX} ${day}`;
  const relevantMeals = state.masterMealList.filter(m => m.tipoPasto === mealType || m.tipoPasto === 'Tutti');
  if(relevantMeals.length > 0) {
      selectionModalList.innerHTML = relevantMeals.map(meal => 
      `<div class="selection-item" data-meal-id="${meal.id}">
          <h4>${meal.nomePasto}</h4>
          <p>${meal.ingredienti || ''}</p>
      </div>`
      ).join('');
  } else {
      selectionModalList.innerHTML = `<p>${UI_TEXT.NO_MEALS_AVAILABLE}</p>`;
  }
  
  selectionModalList.onclick = (e) => {
    const item = e.target.closest('.selection-item');
    if(item) {
      updateWeeklyPlan(slotId, item.dataset.mealId);
      selectionModal.classList.add('modal-hidden');
    }
  };
  selectionModal.classList.remove('modal-hidden');
}

export function populateInitialText() {
  document.getElementById('main-title').textContent = UI_TEXT.MAIN_TITLE;
  document.getElementById('subtitle').textContent = UI_TEXT.SUBTITLE;
  document.getElementById('load-config-btn').textContent = UI_TEXT.LOAD_BUTTON;
  document.getElementById('weekly-plan-title').textContent = UI_TEXT.WEEKLY_PLAN_TITLE;
  document.getElementById('calendar-placeholder').textContent = UI_TEXT.CALENDAR_PLACEHOLDER;
  document.getElementById('reset-btn').textContent = UI_TEXT.RESET_BUTTON;
  document.getElementById('info-modal-title').textContent = UI_TEXT.INFO_MODAL_TITLE;
  document.getElementById('info-modal-desc').textContent = UI_TEXT.INFO_MODAL_DESC;
}

export function renderApp() {
  const state = getState();
  const calendarGrid = document.getElementById('calendar-grid');
  if (state.masterMealList.length === 0 && Object.keys(state.weeklyPlan).length === 0) {
      calendarGrid.innerHTML = `<p>${UI_TEXT.CALENDAR_PLACEHOLDER}</p>`; return;
  }
  if (window.matchMedia('(min-width: 992px)').matches) {
    renderDesktopCalendar(calendarGrid, state);
  } else {
    renderMobileCalendar(calendarGrid, state);
  }
  const urlInput = document.getElementById('config-url-input');
  if (document.activeElement !== urlInput) { urlInput.value = state.configUrl; }
}
