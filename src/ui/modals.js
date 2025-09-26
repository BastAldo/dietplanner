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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="20" height="20"><path d="M256 32a224 224 0 1 0 0 448 224 224 0 1 0 0-448zM122.3 135.8c-1.3-4.3-5.2-7.2-9.8-7.2s-8.5 2.9-9.8 7.2l-1.4 4.5c-2.3 7.5-1.1 15.6 3.2 22.1s10.6 10.3 18 10.3h.2c7.4 0 13.8-3.8 18-10.3s5.5-14.6 3.2-22.1l-1.4-4.5zM158.4 397.7c-2.2-7.5-8.4-12.6-16.1-12.6s-13.9 5.1-16.1 12.6l-5.6 19.2c-3.2 11-2.6 22.8 1.8 33.2s11.2 18.2 20 18.2h.2c8.7 0 15.6-7.7 20-18.2s5-22.2 1.8-33.2l-5.6-19.2zM288 112a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM408 304a16 16 0 1 0 0-32 16 16 0 1 0 0 32z"/></svg>
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
      mealDetailsHTML = `<div class="meal-details"><span class="meal-details__name">${meal.nomePasto}</span><div class="meal-actions">${getRecipeButtonHTML(meal, state)}<button class="btn-remove-meal" data-slot-id="${slotId}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="1em" height="1em"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96h384c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32l21.2 339c1.6 25.3 22.6 45 47.9 45h245.8c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg></button></div></div>`;
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
