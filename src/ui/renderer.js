import { getState, updateWeeklyPlan } from '../core/state.js';
import { DAYS, MEAL_TYPES, UI_TEXT, WEEK_STARTS_ON_MONDAY } from '../utils/constants.js';

const selectionModal = document.getElementById('selection-modal');
const selectionModalTitle = document.getElementById('selection-modal-title');
const selectionModalList = document.getElementById('selection-modal-list');
const calendarGrid = document.getElementById('calendar-grid');
const weekTitleEl = document.getElementById('week-title'); // Hook for week title

// Utility to format a date as YYYY-MM-DD
function toISODateString(date) {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : WEEK_STARTS_ON_MONDAY);
  return new Date(d.setDate(diff));
}

function formatShortDate(date) {
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
}

function calculateDailyCalories(day, state) {
  let min = 0;
  let max = 0;
  MEAL_TYPES.forEach(type => {
    const mealId = state.weeklyPlan[`${day}-${type}`];
    if (mealId) {
      const meal = state.masterMealList.find(m => m.id === mealId);
      if (meal && meal.calories_min) {
        const minCals = Number(meal.calories_min) || 0;
        const maxCals = Number(meal.calories_max) || minCals;
        min += minCals;
        max += maxCals;
      }
    }
  });

  if (min === 0 && max === 0) return '';
  if (min === max) return `${UI_TEXT.KCAL_LABEL}: ${min}`;
  return `${UI_TEXT.KCAL_LABEL}: ${min} - ${max}`;
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
  document.title = UI_TEXT.MAIN_TITLE;
  document.getElementById('main-title').textContent = UI_TEXT.MAIN_TITLE;
  document.getElementById('load-config-btn').textContent = UI_TEXT.LOAD_BUTTON;
  document.getElementById('reset-btn').textContent = UI_TEXT.RESET_BUTTON;
  document.getElementById('info-modal-title').textContent = UI_TEXT.INFO_MODAL_TITLE;
  document.getElementById('info-modal-desc').textContent = UI_TEXT.INFO_MODAL_DESC;
}

export function renderApp() {
  const state = getState();
  
  if (state.masterMealList.length === 0 && Object.keys(state.weeklyPlan).length === 0) {
      calendarGrid.innerHTML = `<p id="calendar-placeholder">${UI_TEXT.CALENDAR_PLACEHOLDER}</p>`;
      weekTitleEl.textContent = '';
      return;
  }

  calendarGrid.innerHTML = ''; // Clear previous render

  const weekStart = getWeekStartDate(state.focusedDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekTitleEl.textContent = `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    
    const dayName = DAYS[i];
    const isoDate = toISODateString(dayDate);
    const dailyCalories = calculateDailyCalories(dayName, state);

    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    dayCell.dataset.date = isoDate;
    
    dayCell.innerHTML = `
      <div class="day-cell__header">
        <span>${dayName}</span>
        <span>${dayDate.getDate()}</span>
      </div>
      <div class="day-cell__body">
        <div class="daily-calories">${dailyCalories}</div>
      </div>
    `;
    calendarGrid.appendChild(dayCell);
  }
  
  const urlInput = document.getElementById('config-url-input');
  if (document.activeElement !== urlInput) {
     urlInput.value = state.configUrl;
  }
}
