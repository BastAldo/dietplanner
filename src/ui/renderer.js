import { getState, updateWeeklyPlan } from '../core/state.js';
import { DAYS, MEAL_TYPES, UI_TEXT, WEEK_STARTS_ON_MONDAY } from '../utils/constants.js';

const calendarGrid = document.getElementById('calendar-grid');
const logView = document.getElementById('log-view');
const weekTitleEl = document.getElementById('week-title');
const viewCalendarBtn = document.getElementById('view-calendar-btn');
const viewLogBtn = document.getElementById('view-log-btn');

const selectionModal = document.getElementById('selection-modal');
const selectionModalTitle = document.getElementById('selection-modal-title');
const selectionModalList = document.getElementById('selection-modal-list');
const dayEditorModal = document.getElementById('day-editor-modal');
const dayEditorTitle = document.getElementById('day-editor-title');
const dayEditorBody = document.getElementById('day-editor-body');

let currentEditingDayISO = null;

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

function calculateDailyCalories(isoDate, state) {
  let min = 0;
  let max = 0;
  MEAL_TYPES.forEach(type => {
    const slotId = `${isoDate}-${type}`;
    const mealId = state.weeklyPlan[slotId];
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
  const mealType = slotId.substring(11);
  selectionModalTitle.textContent = `${UI_TEXT.SELECT_MEAL_TITLE} ${mealType}`;
  const relevantMeals = state.masterMealList.filter(m => m.tipoPasto === mealType || m.tipoPasto === 'Tutti');
  
  selectionModalList.innerHTML = relevantMeals.length > 0
    ? relevantMeals.map(meal => `<div class="selection-item" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4><p>${meal.ingredienti || ''}</p></div>`).join('')
    : `<p>${UI_TEXT.NO_MEALS_AVAILABLE}</p>`;
  
  const closeButton = selectionModal.querySelector('.modal-close-btn');

  const closeAndReturn = () => {
    selectionModal.classList.add('modal-hidden');
    if (currentEditingDayISO) openDayEditorModal(currentEditingDayISO);
    closeButton.removeEventListener('click', closeAndReturn);
    selectionModal.removeEventListener('click', overlayClickHandler);
  };

  const overlayClickHandler = (e) => { if (e.target === selectionModal) closeAndReturn(); };

  selectionModalList.onclick = (e) => {
    const item = e.target.closest('.selection-item');
    if(item) {
      updateWeeklyPlan(slotId, item.dataset.mealId);
      closeAndReturn();
    }
  };

  closeButton.addEventListener('click', closeAndReturn, { once: true });
  selectionModal.addEventListener('click', overlayClickHandler);
  selectionModal.classList.remove('modal-hidden');
}

export function openDayEditorModal(isoDate) {
  currentEditingDayISO = isoDate;
  const state = getState();
  dayEditorTitle.textContent = `Editor: ${formatFullDate(isoDate)}`;

  dayEditorBody.innerHTML = MEAL_TYPES.map(mealType => {
    const slotId = `${isoDate}-${mealType}`;
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
      openDayEditorModal(isoDate);
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
}

function renderCalendarView(state, weekStart) {
  calendarGrid.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const dayName = DAYS[i];
    const isoDate = toISODateString(dayDate);
    const dailyCalories = calculateDailyCalories(isoDate, state);
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    dayCell.dataset.date = isoDate;
    dayCell.innerHTML = `
      <div class="day-cell__header"><span>${dayName}</span><span>${dayDate.getDate()}</span></div>
      <div class="day-cell__body"><div class="daily-calories">${dailyCalories}</div></div>
    `;
    calendarGrid.appendChild(dayCell);
  }
}

function renderLogView(state, weekStart) {
  logView.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const isoDate = toISODateString(dayDate);
    
    const dayMeals = MEAL_TYPES
      .map(type => ({ type, meal: state.masterMealList.find(m => m.id === state.weeklyPlan[`${isoDate}-${type}`]) }))
      .filter(item => item.meal);
      
    if (dayMeals.length > 0) {
      const dayLog = document.createElement('div');
      dayLog.className = 'log-day';
      dayLog.innerHTML = `<h3>${formatFullDate(isoDate)}</h3>` + dayMeals.map(item =>
        `<div class="log-item"><strong>${item.type}:</strong> ${item.meal.nomePasto}</div>`
      ).join('');
      logView.appendChild(dayLog);
    }
  }
  if (logView.innerHTML === '') {
    logView.innerHTML = `<p class="placeholder-text">Nessun pasto pianificato per questa settimana.</p>`;
  }
}

export function renderApp() {
  const state = getState();
  const weekStart = getWeekStartDate(state.focusedDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekTitleEl.textContent = `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;

  if (state.currentView === 'calendar') {
    calendarGrid.classList.remove('hidden');
    logView.classList.add('hidden');
    viewCalendarBtn.classList.add('active');
    viewLogBtn.classList.remove('active');
    renderCalendarView(state, weekStart);
  } else {
    calendarGrid.classList.add('hidden');
    logView.classList.remove('hidden');
    viewCalendarBtn.classList.remove('active');
    viewLogBtn.classList.add('active');
    renderLogView(state, weekStart);
  }
  
  const urlInput = document.getElementById('config-url-input');
  if (document.activeElement !== urlInput) urlInput.value = state.configUrl;
}
