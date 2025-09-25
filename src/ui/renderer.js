import { getState, updateWeeklyPlan } from '../core/state.js';
import { DAYS, MEAL_TYPES, UI_TEXT, WEEK_STARTS_ON_MONDAY } from '../utils/constants.js';
import { showNotification } from './notifications.js';

const calendarGrid = document.getElementById('calendar-grid');
const logView = document.getElementById('log-view');
const weekTitleEl = document.getElementById('week-title');
const viewCalendarBtn = document.getElementById('view-calendar-btn');
const viewLogBtn = document.getElementById('view-log-btn');
const globalAlert = document.getElementById('global-alert');
const globalAlertMessage = document.getElementById('global-alert-message');

const selectionModal = document.getElementById('selection-modal');
const selectionModalTitle = document.getElementById('selection-modal-title');
const selectionModalList = document.getElementById('selection-modal-list');
const dayEditorModal = document.getElementById('day-editor-modal');
const dayEditorTitle = document.getElementById('day-editor-title');
const dayEditorBody = document.getElementById('day-editor-body');

const confirmModal = document.getElementById('confirm-modal');
const confirmModalTitle = document.getElementById('confirm-modal-title');
const confirmModalMessage = document.getElementById('confirm-modal-message');
const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel-btn');
const confirmModalConfirmBtn = document.getElementById('confirm-modal-confirm-btn');

const recipeModal = document.getElementById('recipe-modal');
const recipeModalTitle = document.getElementById('recipe-modal-title');
const recipeModalBody = document.getElementById('recipe-modal-body');

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

function formatMealCalories(meal) {
  if (!meal || !meal.calories_min) return '';
  const minCals = Number(meal.calories_min) || 0;
  const maxCals = Number(meal.calories_max) || minCals;
  if (minCals === 0) return '';
  const kcalLabel = UI_TEXT.KCAL_LABEL || 'Kcal';
  if (minCals === maxCals) return `${minCals} ${kcalLabel}`;
  return `${minCals} - ${maxCals} ${kcalLabel}`;
}

function calculateDailyCalories(isoDate, weeklyPlan) {
  let min = 0;
  let max = 0;
  MEAL_TYPES.forEach(type => {
    const slotId = `${isoDate}-${type}`;
    const meal = weeklyPlan[slotId]; // Meal is now the full object
    if (meal && meal.calories_min) {
      const minCals = Number(meal.calories_min) || 0;
      const maxCals = Number(meal.calories_max) || minCals;
      min += minCals;
      max += maxCals;
    }
  });
  if (min === 0 && max === 0) return '';
  if (min === max) return `${UI_TEXT.KCAL_LABEL}: ${min}`;
  return `${UI_TEXT.KCAL_LABEL}: ${min} - ${max}`;
}

function getRecipeButtonHTML(meal, state) {
  if (state.recipeBaseUrl && meal && meal.recipeId) {
    return `<button class="btn-view-recipe" data-meal-id="${meal.id}" title="${UI_TEXT.RECIPE_BUTTON_TITLE}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h7v14H4zm9 0V5h7l.001 14H13z"></path><path d="M9 7h2v2H9z"></path></svg>
            </button>`;
  }
  return '';
}

export async function showRecipeModal(meal) {
  const state = getState();
  if (!meal) return;
  const url = `${state.recipeBaseUrl}${meal.recipeId}.md`;
  recipeModalTitle.textContent = meal.nomePasto;
  recipeModalBody.innerHTML = `<p>${UI_TEXT.RECIPE_MODAL_LOADING}</p>`;
  recipeModal.classList.remove('modal-hidden');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Errore di rete: ${response.status}`);
    const markdown = await response.text();
    recipeModalBody.innerHTML = DOMPurify.sanitize(marked.parse(markdown));
  } catch (error) {
    recipeModalBody.innerHTML = `<p>${UI_TEXT.RECIPE_MODAL_LOAD_ERROR}</p>`;
    showNotification(UI_TEXT.RECIPE_LOAD_FAIL_MSG, 'error');
  }
}

export function showConfirmModal(title, message, onConfirm, type = 'secondary') {
  confirmModalTitle.textContent = title;
  confirmModalMessage.textContent = message;
  confirmModalConfirmBtn.className = `btn btn-${type}`;
  confirmModalConfirmBtn.textContent = UI_TEXT.CONFIRM_MODAL_CONFIRM_BTN;
  confirmModalCancelBtn.textContent = UI_TEXT.CONFIRM_MODAL_CANCEL_BTN;

  const cleanup = () => {
    confirmModal.classList.add('modal-hidden');
    confirmModalCancelBtn.removeEventListener('click', cancelHandler);
    confirmModalConfirmBtn.removeEventListener('click', confirmHandler);
  };

  const cancelHandler = () => cleanup();
  const confirmHandler = () => {
    onConfirm();
    cleanup();
  };
  
  confirmModalCancelBtn.addEventListener('click', cancelHandler, { once: true });
  confirmModalConfirmBtn.addEventListener('click', confirmHandler, { once: true });
  
  confirmModal.classList.remove('modal-hidden');
}

export function openSelectionModal(slotId) {
  const state = getState();
  const mealType = slotId.substring(11);
  selectionModalTitle.textContent = `${UI_TEXT.SELECT_MEAL_TITLE} ${mealType}`;
  const relevantMeals = state.masterMealList.filter(m => m.tipoPasto === mealType || m.tipoPasto === 'Tutti');
  selectionModalList.innerHTML = relevantMeals.length > 0 ? relevantMeals.map(meal => `<div class="selection-item" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4><p>${meal.ingredienti || ''}</p></div>`).join('') : `<p>${UI_TEXT.NO_MEALS_AVAILABLE}</p>`;
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
  dayEditorTitle.textContent = `${UI_TEXT.EDITOR_MODAL_TITLE_PREFIX} ${formatFullDate(isoDate)}`;
  dayEditorBody.innerHTML = MEAL_TYPES.map(mealType => {
    const slotId = `${isoDate}-${mealType}`;
    const meal = state.weeklyPlan[slotId]; // Get the full meal object directly
    
    let mealDetailsHTML = `<button class="btn-add-meal" data-slot-id="${slotId}">${UI_TEXT.ADD_MEAL_BTN}</button>`;
    if (meal) {
      const recipeButtonHTML = getRecipeButtonHTML(meal, state);
      mealDetailsHTML = `
        <div class="meal-details">
          <span class="meal-details__name">${meal.nomePasto}</span>
          <div class="meal-actions">
            ${recipeButtonHTML}
            <button class="btn-remove-meal" data-slot-id="${slotId}">&times;</button>
          </div>
        </div>`;
    }

    return `<div class="day-editor-slot"><span class="meal-type-label">${mealType}</span><div class="meal-details-container">${mealDetailsHTML}</div></div>`;
  }).join('');

  dayEditorBody.onclick = (e) => {
    const btnAdd = e.target.closest('.btn-add-meal');
    const btnRemove = e.target.closest('.btn-remove-meal');
    const btnRecipe = e.target.closest('.btn-view-recipe');

    if (btnAdd) {
      dayEditorModal.classList.add('modal-hidden');
      openSelectionModal(btnAdd.dataset.slotId);
    } else if (btnRemove) {
      updateWeeklyPlan(btnRemove.dataset.slotId, null);
      openDayEditorModal(isoDate);
    } else if (btnRecipe) {
      const mealId = btnRecipe.dataset.mealId;
      const meal = Object.values(state.weeklyPlan).find(m => m && m.id === mealId) || state.masterMealList.find(m => m.id === mealId);
      if (meal) showRecipeModal(meal);
    }
  };
  dayEditorModal.classList.remove('modal-hidden');
}

export function populateInitialText() {
  document.title = UI_TEXT.MAIN_TITLE;
  document.getElementById('main-title').textContent = UI_TEXT.MAIN_TITLE;
  document.getElementById('load-config-btn').textContent = UI_TEXT.LOAD_BUTTON;
  document.getElementById('reset-btn').textContent = UI_TEXT.RESET_BUTTON;
  document.getElementById('copy-week-btn').textContent = UI_TEXT.COPY_WEEK_BTN;
  document.getElementById('backup-btn').textContent = UI_TEXT.BACKUP_BTN;
  document.getElementById('restore-btn').textContent = UI_TEXT.RESTORE_BTN;
  document.getElementById('info-modal-title').textContent = UI_TEXT.INFO_MODAL_TITLE;
  document.getElementById('info-modal-desc').textContent = UI_TEXT.INFO_MODAL_DESC;
  document.getElementById('info-modal-json-example').textContent = UI_TEXT.INFO_MODAL_EXAMPLE_JSON;
}

function renderCalendarView(state, weekStart) {
  calendarGrid.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const dayName = DAYS[i];
    const isoDate = toISODateString(dayDate);
    const dailyCalories = calculateDailyCalories(isoDate, state.weeklyPlan);
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    dayCell.dataset.date = isoDate;
    dayCell.innerHTML = `<div class="day-cell__header"><span>${dayName}</span><span>${dayDate.getDate()}</span></div><div class="day-cell__body"><div class="daily-calories">${dailyCalories}</div></div>`;
    calendarGrid.appendChild(dayCell);
  }
}

function renderLogView(state, weekStart) {
  logView.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const isoDate = toISODateString(dayDate);
    const dayMeals = MEAL_TYPES.map(type => {
      const slotId = `${isoDate}-${type}`;
      return { type, meal: state.weeklyPlan[slotId] };
    }).filter(item => item.meal);
    
    if (dayMeals.length > 0) {
      const dailyCalories = calculateDailyCalories(isoDate, state.weeklyPlan);
      const dayLog = document.createElement('div');
      dayLog.className = 'log-day';
      dayLog.innerHTML = `<h3><span>${formatFullDate(isoDate)}</span><span class="log-day__total-calories">${dailyCalories}</span></h3>` 
        + dayMeals.map(item => {
          const recipeButtonHTML = getRecipeButtonHTML(item.meal, state);
          return `
            <div class="log-item">
              <div class="log-item__name">
                <strong>${item.type}:</strong>
                <span>${item.meal.nomePasto}</span>
                ${recipeButtonHTML}
              </div>
              <span class="log-item__calories">${formatMealCalories(item.meal)}</span>
            </div>
          `;
        }).join('');
      logView.appendChild(dayLog);
    }
  }
  if (logView.innerHTML === '') {
    logView.innerHTML = `<p class="placeholder-text">${UI_TEXT.LOG_VIEW_EMPTY}</p>`;
  }
}

export function renderApp() {
  const state = getState();
  if (Object.keys(state.weeklyPlan).length === 0 && state.masterMealList.length === 0) {
      globalAlertMessage.textContent = UI_TEXT.CALENDAR_PLACEHOLDER;
      globalAlert.classList.remove('hidden');
  } else {
      globalAlert.classList.add('hidden');
  }
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
