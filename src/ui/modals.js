import { getState, updateWeeklyPlan } from '../core/state.js';
import { showNotification } from './notifications.js';
import { UI_TEXT, MEAL_TYPES } from '../utils/constants.js';

let currentEditingDayISO = null;

function formatFullDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
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
  const recipeModal = document.getElementById('recipe-modal');
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
  const confirmModal = document.getElementById('confirm-modal');
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
  const selectionModal = document.getElementById('selection-modal');
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
  const dayEditorModal = document.getElementById('day-editor-modal');
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
