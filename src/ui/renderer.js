import { getState, updateWeeklyPlan } from '../core/state.js';
import { DAYS, MEAL_TYPES, UI_TEXT, WEEK_STARTS_ON_MONDAY, BIOMETRIC_FIELDS, PROFILE_FIELDS } from '../utils/constants.js';
import { showNotification } from './notifications.js';

// Page containers
const plannerPage = document.getElementById('planner-page');
const progressPage = document.getElementById('progress-page');
const profilePage = document.getElementById('profile-page');

// Planner elements
const calendarGrid = document.getElementById('calendar-grid');
const logView = document.getElementById('log-view');
const weekTitleEl = document.getElementById('week-title');
const viewCalendarBtn = document.getElementById('view-calendar-btn');
const viewLogBtn = document.getElementById('view-log-btn');

// Biometrics elements
const biometricsView = document.getElementById('biometrics-view');

// Global elements
const globalAlert = document.getElementById('global-alert');
const globalAlertMessage = document.getElementById('global-alert-message');
const navPlannerBtn = document.getElementById('nav-planner');
const navProgressBtn = document.getElementById('nav-progress');
const navProfileBtn = document.getElementById('nav-profile');

// Modals
const selectionModal = document.getElementById('selection-modal');
const dayEditorModal = document.getElementById('day-editor-modal');
const confirmModal = document.getElementById('confirm-modal');
const recipeModal = document.getElementById('recipe-modal');

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
  let min = 0, max = 0;
  MEAL_TYPES.forEach(type => {
    const meal = weeklyPlan[`${isoDate}-${type}`];
    if (meal && meal.calories_min) {
      const minCals = Number(meal.calories_min) || 0;
      const maxCals = Number(meal.calories_max) || minCals;
      min += minCals;
      max += maxCals;
    }
  });
  if (min === 0 && max === 0) return '';
  return min === max ? `${UI_TEXT.KCAL_LABEL}: ${min}` : `${UI_TEXT.KCAL_LABEL}: ${min} - ${max}`;
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
  if (!meal) return;
  const state = getState();
  const url = `${state.recipeBaseUrl}${meal.recipeId}.md`;
  recipeModal.querySelector('#recipe-modal-title').textContent = meal.nomePasto;
  const body = recipeModal.querySelector('#recipe-modal-body');
  body.innerHTML = `<p>${UI_TEXT.RECIPE_MODAL_LOADING}</p>`;
  recipeModal.classList.remove('modal-hidden');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Errore di rete: ${response.status}`);
    body.innerHTML = DOMPurify.sanitize(marked.parse(await response.text()));
  } catch (error) {
    body.innerHTML = `<p>${UI_TEXT.RECIPE_MODAL_LOAD_ERROR}</p>`;
    showNotification(UI_TEXT.RECIPE_LOAD_FAIL_MSG, 'error');
  }
}

export function showConfirmModal(title, message, onConfirm, type = 'secondary') {
  confirmModal.querySelector('#confirm-modal-title').textContent = title;
  confirmModal.querySelector('#confirm-modal-message').textContent = message;
  const confirmBtn = confirmModal.querySelector('#confirm-modal-confirm-btn');
  const cancelBtn = confirmModal.querySelector('#confirm-modal-cancel-btn');
  confirmBtn.className = `btn btn-${type}`;
  confirmBtn.textContent = UI_TEXT.CONFIRM_MODAL_CONFIRM_BTN;
  cancelBtn.textContent = UI_TEXT.CONFIRM_MODAL_CANCEL_BTN;
  const cleanup = () => {
    confirmModal.classList.add('modal-hidden');
    cancelBtn.removeEventListener('click', cancelHandler);
    confirmBtn.removeEventListener('click', confirmHandler);
  };
  const cancelHandler = () => cleanup();
  const confirmHandler = () => { onConfirm(); cleanup(); };
  cancelBtn.addEventListener('click', cancelHandler, { once: true });
  confirmBtn.addEventListener('click', confirmHandler, { once: true });
  confirmModal.classList.remove('modal-hidden');
}

export function openSelectionModal(slotId) {
  const state = getState();
  const mealType = slotId.substring(11);
  selectionModal.querySelector('#selection-modal-title').textContent = `${UI_TEXT.SELECT_MEAL_TITLE} ${mealType}`;
  const list = selectionModal.querySelector('#selection-modal-list');
  const relevantMeals = state.masterMealList.filter(m => m.tipoPasto === mealType || m.tipoPasto === 'Tutti');
  list.innerHTML = relevantMeals.length > 0 ? relevantMeals.map(meal => `<div class="selection-item" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4><p>${meal.ingredienti || ''}</p></div>`).join('') : `<p>${UI_TEXT.NO_MEALS_AVAILABLE}</p>`;
  const closeAndReturn = () => {
    selectionModal.classList.add('modal-hidden');
    if (currentEditingDayISO) openDayEditorModal(currentEditingDayISO);
  };
  list.onclick = e => {
    const item = e.target.closest('.selection-item');
    if(item) { updateWeeklyPlan(slotId, item.dataset.mealId); closeAndReturn(); }
  };
  selectionModal.classList.remove('modal-hidden');
}

export function openDayEditorModal(isoDate) {
  currentEditingDayISO = isoDate;
  const state = getState();
  dayEditorModal.querySelector('#day-editor-title').textContent = `${UI_TEXT.EDITOR_MODAL_TITLE_PREFIX} ${formatFullDate(isoDate)}`;
  const body = dayEditorModal.querySelector('#day-editor-body');
  body.innerHTML = MEAL_TYPES.map(mealType => {
    const slotId = `${isoDate}-${mealType}`;
    const meal = state.weeklyPlan[slotId];
    let mealDetailsHTML = `<button class="btn-add-meal" data-slot-id="${slotId}">${UI_TEXT.ADD_MEAL_BTN}</button>`;
    if (meal) {
      mealDetailsHTML = `<div class="meal-details"><span class="meal-details__name">${meal.nomePasto}</span><div class="meal-actions">${getRecipeButtonHTML(meal, state)}<button class="btn-remove-meal" data-slot-id="${slotId}">&times;</button></div></div>`;
    }
    return `<div class="day-editor-slot"><span class="meal-type-label">${mealType}</span><div class="meal-details-container">${mealDetailsHTML}</div></div>`;
  }).join('');
  body.onclick = e => {
    const btnAdd = e.target.closest('.btn-add-meal');
    const btnRemove = e.target.closest('.btn-remove-meal');
    const btnRecipe = e.target.closest('.btn-view-recipe');
    if (btnAdd) { dayEditorModal.classList.add('modal-hidden'); openSelectionModal(btnAdd.dataset.slotId); }
    else if (btnRemove) { updateWeeklyPlan(btnRemove.dataset.slotId, null); openDayEditorModal(isoDate); }
    else if (btnRecipe) {
      const meal = Object.values(state.weeklyPlan).find(m => m && m.id === btnRecipe.dataset.mealId) || state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
      if (meal) showRecipeModal(meal);
    }
  };
  dayEditorModal.classList.remove('modal-hidden');
}

export function populateInitialText() {
  document.title = UI_TEXT.MAIN_TITLE;
  document.getElementById('main-title').textContent = UI_TEXT.MAIN_TITLE;
  document.getElementById('nav-planner').textContent = UI_TEXT.NAV_PLANNER;
  document.getElementById('nav-progress').textContent = UI_TEXT.NAV_PROGRESS;
  document.getElementById('nav-profile').textContent = UI_TEXT.NAV_PROFILE;
  document.getElementById('load-config-btn').textContent = UI_TEXT.LOAD_BUTTON;
  document.getElementById('reset-btn').textContent = UI_TEXT.RESET_BUTTON;
  document.getElementById('copy-week-btn').textContent = UI_TEXT.COPY_WEEK_BTN;
  document.getElementById('backup-btn').textContent = UI_TEXT.BACKUP_BTN;
  document.getElementById('restore-btn').textContent = UI_TEXT.RESTORE_BTN;
  document.getElementById('info-modal-title').textContent = UI_TEXT.INFO_MODAL_TITLE;
  document.getElementById('info-modal-desc').textContent = UI_TEXT.INFO_MODAL_DESC;
  document.getElementById('info-modal-json-example').textContent = UI_TEXT.INFO_MODAL_EXAMPLE_JSON;
  document.getElementById('biometrics-title').textContent = UI_TEXT.BIOMETRICS_FORM_TITLE;
  document.getElementById('biometrics-history-title').textContent = UI_TEXT.BIOMETRICS_HISTORY_TITLE;
  document.getElementById('profile-title').textContent = UI_TEXT.PROFILE_FORM_TITLE;
}

function renderPlannerPage(state) {
  const weekStart = getWeekStartDate(state.focusedDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekTitleEl.textContent = `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;
  renderCalendarView(state, weekStart);
  renderLogView(state, weekStart);
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
    const dayMeals = MEAL_TYPES.map(type => ({ type, meal: state.weeklyPlan[`${isoDate}-${type}`] })).filter(item => item.meal);
    if (dayMeals.length > 0) {
      const dayLog = document.createElement('div');
      dayLog.className = 'log-day';
      dayLog.innerHTML = `<h3><span>${formatFullDate(isoDate)}</span><span class="log-day__total-calories">${calculateDailyCalories(isoDate, state.weeklyPlan)}</span></h3>` 
        + dayMeals.map(item => `<div class="log-item"><div class="log-item__name"><strong>${item.type}:</strong><span>${item.meal.nomePasto}</span>${getRecipeButtonHTML(item.meal, state)}</div><span class="log-item__calories">${formatMealCalories(item.meal)}</span></div>`).join('');
      logView.appendChild(dayLog);
    }
  }
  if (logView.innerHTML === '') logView.innerHTML = `<p class="placeholder-text">${UI_TEXT.LOG_VIEW_EMPTY}</p>`;
}

function renderBiometricsPage(state) {
  const form = document.getElementById('biometrics-form');
  const tableBody = document.querySelector('#biometrics-table tbody');
  const tableHead = document.querySelector('#biometrics-table thead');
  form.innerHTML = `${BIOMETRIC_FIELDS.map(field => `<div class="form-group"><label for="bio-${field.id}">${field.label}</label>${field.type === 'textarea' ? `<textarea id="bio-${field.id}" name="${field.id}"></textarea>` : `<input type="${field.type}" id="bio-${field.id}" name="${field.id}" ${field.props || ''} ${field.id === 'date' ? `value="${toISODateString(new Date())}"` : ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.BIOMETRICS_SAVE_BTN}</button><button type="reset" class="btn btn-secondary">${UI_TEXT.BIOMETRICS_CLEAR_BTN}</button></div>`;
  tableHead.innerHTML = `<tr>${BIOMETRIC_FIELDS.map(f => `<th>${f.label}</th>`).join('')}<th>Azioni</th></tr>`;
  tableBody.innerHTML = state.biometricData.map(entry => `<tr data-date="${entry.date}">${BIOMETRIC_FIELDS.map(field => `<td>${entry[field.id] || ''}</td>`).join('')}<td class="biometrics-actions"><button class="btn-edit-biometrics" data-date="${entry.date}" title="Modifica">✏️</button><button class="btn-delete-biometrics" data-date="${entry.date}" title="Elimina">🗑️</button></td></tr>`).join('');
}

function renderProfilePage(state) {
  const form = document.getElementById('profile-form');
  form.innerHTML = `${PROFILE_FIELDS.map(field => `<div class="form-group">${field.type === 'radio' ? `<fieldset><legend>${field.label}</legend>${field.options.map(opt => `<label><input type="radio" name="${field.id}" value="${opt.value}" ${state.userProfile[field.id] === opt.value ? 'checked' : ''}> ${opt.label}</label>`).join('')}</fieldset>` : `<label for="prof-${field.id}">${field.label}</label><input type="${field.type}" id="prof-${field.id}" name="${field.id}" value="${state.userProfile[field.id] || ''}" ${field.props || ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.PROFILE_SAVE_BTN}</button></div>`;
}

export function renderApp() {
  const state = getState();
  [plannerPage, progressPage, profilePage].forEach(p => p.classList.add('hidden'));
  [navPlannerBtn, navProgressBtn, navProfileBtn].forEach(b => b.classList.remove('active'));

  if (state.currentView === 'planner' || state.currentView === 'log') {
    plannerPage.classList.remove('hidden');
    navPlannerBtn.classList.add('active');
    renderPlannerPage(state);
  } else if (state.currentView === 'progress') {
    progressPage.classList.remove('hidden');
    navProgressBtn.classList.add('active');
    renderBiometricsPage(state);
  } else if (state.currentView === 'profile') {
    profilePage.classList.remove('hidden');
    navProfileBtn.classList.add('active');
    renderProfilePage(state);
  }

  const urlInput = document.getElementById('config-url-input');
  if (document.activeElement !== urlInput) urlInput.value = state.configUrl;
}
