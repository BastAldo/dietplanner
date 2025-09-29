import { getState, updateWeeklyPlan, updateWeeklyWorkout } from '../core/state.js';
import { showNotification } from './notifications.js';
import { UI_TEXT, MEAL_TYPES, WORKOUT_SLOT_ID } from '../utils/constants.js';
import { renderIcon } from './icons.js';

let currentEditingDayISO = null;

function formatFullDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getRecipeButtonHTML(meal, state) {
  if (state.recipeBaseUrl && meal && meal.recipeId) {
    return `<button class="btn-view-recipe" data-meal-id="${meal.id}" title="${UI_TEXT.RECIPE_BUTTON_TITLE}">
              ${renderIcon('RECIPE', { width: 20, height: 20 })}
            </button>`;
  }
  return '';
}

function formatIngredients(meal) {
    if (!meal.ingredienti || !Array.isArray(meal.ingredienti)) return '';
    
    const ingredientsList = meal.ingredienti.map(item => {
        let quantity = '';
        if (item.quantita_g) quantity = `${item.quantita_g}g`;
        else if (item.quantita_g_min && item.quantita_g_max) quantity = `${item.quantita_g_min}-${item.quantita_g_max}g`;
        else if (item.quantita_g_min) quantity = `${item.quantita_g_min}g`;
        else if (item.quantita_pezzi) quantity = `x${item.quantita_pezzi}`;
        
        return `${item.id.replace(/_/g, ' ')} ${quantity}`.trim();
    }).join(', ');
    
    return `<p>${ingredientsList}</p>`;
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
  list.innerHTML = relevantMeals.length > 0 ? relevantMeals.map(meal => `<div class="selection-item" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4>${formatIngredients(meal)}</div>`).join('') : `<p>${UI_TEXT.NO_MEALS_AVAILABLE}</p>`;
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

export function openWorkoutSelectionModal(slotId) {
  const state = getState();
  const workoutSelectionModal = document.getElementById('workout-selection-modal');
  workoutSelectionModal.querySelector('#workout-selection-modal-title').textContent = UI_TEXT.SELECT_EXERCISE_TITLE;
  const list = workoutSelectionModal.querySelector('#workout-selection-modal-list');
  const relevantWorkouts = state.masterWorkoutList;
  list.innerHTML = relevantWorkouts.length > 0 ? relevantWorkouts.map(ex => `<div class="selection-item" data-exercise-id="${ex.id}"><h4>${ex.name}</h4><p>${ex.description}</p></div>`).join('') : `<p>${UI_TEXT.NO_WORKOUTS_AVAILABLE}</p>`;
  
  const closeAndReturn = () => {
    workoutSelectionModal.classList.add('modal-hidden');
    if (currentEditingDayISO) openDayEditorModal(currentEditingDayISO);
  };

  list.onclick = e => {
    const item = e.target.closest('.selection-item');
    if (item) {
      updateWeeklyWorkout(slotId, item.dataset.exerciseId);
      closeAndReturn();
    }
  };
  workoutSelectionModal.classList.remove('modal-hidden');
}

export function openDayEditorModal(isoDate) {
  currentEditingDayISO = isoDate;
  const state = getState();
  const dayEditorModal = document.getElementById('day-editor-modal');
  dayEditorModal.querySelector('#day-editor-title').textContent = `${UI_TEXT.EDITOR_MODAL_TITLE_PREFIX} ${formatFullDate(isoDate)}`;
  const body = dayEditorModal.querySelector('#day-editor-body');
  
  const mealSlotsHTML = MEAL_TYPES.map(mealType => {
    const slotId = `${isoDate}-${mealType}`;
    const plannedMeal = state.weeklyPlan[slotId];
    const meal = plannedMeal ? state.masterMealList.find(m => m.id === plannedMeal.id) : null;
    
    let mealDetailsHTML = `<button class="btn-add-meal" data-slot-id="${slotId}">${UI_TEXT.ADD_MEAL_BTN}</button>`;
    if (meal) {
      mealDetailsHTML = `<div class="meal-details"><span class="meal-details__name">${meal.nomePasto}</span><div class="meal-actions">${getRecipeButtonHTML(meal, state)}<button class="btn-remove-meal" data-slot-id="${slotId}">${renderIcon('TRASH', { width: 16, height: 16 })}</button></div></div>`;
    }
    return `<div class="day-editor-slot"><span class="meal-type-label">${mealType}</span><div class="meal-details-container">${mealDetailsHTML}</div></div>`;
  }).join('');

  const workoutSlotId = `${isoDate}-${WORKOUT_SLOT_ID}`;
  const plannedWorkoutList = state.weeklyWorkouts[workoutSlotId] || [];
  
  let workoutDetailsHTML = plannedWorkoutList.map(exercise => {
      return `<div class="meal-details" data-instance-id="${exercise.instanceId}"><span class="meal-details__name">${exercise.name}</span><div class="meal-actions"><button class="btn-remove-exercise" data-slot-id="${workoutSlotId}" data-instance-id="${exercise.instanceId}">${renderIcon('TRASH', { width: 16, height: 16 })}</button></div></div>`;
  }).join('');

  const addExerciseButton = `<button class="btn-add-exercise" data-slot-id="${workoutSlotId}">${UI_TEXT.ADD_EXERCISE_BTN}</button>`;

  const workoutSlotHTML = `<div class="day-editor-slot workout-slot"><span class="meal-type-label">${WORKOUT_SLOT_ID}</span><div class="meal-details-container">${workoutDetailsHTML}${addExerciseButton}</div></div>`;

  body.innerHTML = mealSlotsHTML + workoutSlotHTML;

  body.onclick = e => {
    const btnAddMeal = e.target.closest('.btn-add-meal');
    const btnRemoveMeal = e.target.closest('.btn-remove-meal');
    const btnRecipe = e.target.closest('.btn-view-recipe');
    const btnAddExercise = e.target.closest('.btn-add-exercise');
    const btnRemoveExercise = e.target.closest('.btn-remove-exercise');

    if (btnAddMeal) { dayEditorModal.classList.add('modal-hidden'); openSelectionModal(btnAddMeal.dataset.slotId); }
    else if (btnRemoveMeal) { updateWeeklyPlan(btnRemoveMeal.dataset.slotId, null); openDayEditorModal(isoDate); }
    else if (btnRecipe) {
      const meal = state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
      if (meal) showRecipeModal(meal);
    }
    else if (btnAddExercise) {
      dayEditorModal.classList.add('modal-hidden');
      openWorkoutSelectionModal(btnAddExercise.dataset.slotId);
    }
    else if (btnRemoveExercise) {
      updateWeeklyWorkout(btnRemoveExercise.dataset.slotId, null, parseInt(btnRemoveExercise.dataset.instanceId));
      openDayEditorModal(isoDate);
    }
  };
  dayEditorModal.classList.remove('modal-hidden');
}
