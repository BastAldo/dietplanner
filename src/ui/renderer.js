import { getState, updateWeeklyPlan } from '../core/state.js';
import { DAYS, MEAL_TYPES, UI_TEXT, WEEK_STARTS_ON_MONDAY } from '../utils/constants.js';

const selectionModal = document.getElementById('selection-modal');
const selectionModalTitle = document.getElementById('selection-modal-title');
const selectionModalList = document.getElementById('selection-modal-list');
const calendarGrid = document.getElementById('calendar-grid');
const weekTitleEl = document.getElementById('week-title');
const dayEditorModal = document.getElementById('day-editor-modal');
const dayEditorTitle = document.getElementById('day-editor-title');
const dayEditorBody = document.getElementById('day-editor-body');

let currentEditingDayISO = null; // Track the currently open day

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

function formatFullDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

function calculateDailyCalories(dayName, state) {
  let min = 0;
  let max = 0;
  MEAL_TYPES.forEach(type => {
    const mealId = state.weeklyPlan[`${dayName}-${type}`];
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
      if (currentEditingDayISO) {
        openDayEditorModal(currentEditingDayISO); // Re-open editor to show changes
      }
    }
  };
  selectionModal.classList.remove('modal-hidden');
}

export function openDayEditorModal(isoDate) {
  currentEditingDayISO = isoDate; // Keep track of the open day
  const state = getState();
  const dayName = DAYS[new Date(isoDate).getDay() === 0 ? 6 : new Date(isoDate).getDay() - 1];
  dayEditorTitle.textContent = `Editor: ${formatFullDate(isoDate)}`;

  dayEditorBody.innerHTML = MEAL_TYPES.map(mealType => {
    const slotId = `${dayName}-${mealType}`;
    const mealId = state.weeklyPlan[slotId];
    const meal = mealId ? state.masterMealList.find(m => m.id === mealId) : null;
    
    return `
      <div class="day-editor-slot">
        <span class="meal-type-label">${mealType}</span>
        <div class="meal-details-container">
          ${meal 
            ? `<div class="meal-details">
                 <span>${meal.nomePasto}</span>
                 <button class="btn-remove-meal" data-slot-id="${slotId}">&times;</button>
               </div>` 
            : `<button class="btn-add-meal" data-slot-id="${slotId}">Aggiungi</button>`
          }
        </div>
      </div>
    `;
  }).join('');

  dayEditorBody.onclick = (e) => {
    if (e.target.classList.contains('btn-add-meal')) {
      dayEditorModal.classList.add('modal-hidden');
      openSelectionModal(e.target.dataset.slotId);
    } else if (e.target.classList.contains('btn-remove-meal')) {
      updateWeeklyPlan(e.target.dataset.slotId, null);
      openDayEditorModal(isoDate); // Re-render the modal with fresh data
    }
  };

  dayEditorModal.classList.remove('modal-hidden');
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
        <div class.daily-calories">${dailyCalories}</div>
      </div>
    `;
    calendarGrid.appendChild(dayCell);
  }
  
  const urlInput = document.getElementById('config-url-input');
  if (document.activeElement !== urlInput) {
     urlInput.value = state.configUrl;
  }
}
