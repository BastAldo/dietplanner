import { getState, updateWeeklyPlan } from '../../core/state.js';
import { MEAL_TYPES, WORKOUT_SLOT_ID, UI_TEXT } from '../../utils/constants.js';
import { renderIcon } from '../icons.js';
import { log } from '../../utils/logger.js';
import { showRecipeModal } from './recipeModal.js';
import { openSelectionModal } from './selectionModal.js';
import { openWorkoutEditorModal } from './workoutEditorModal.js';

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

export function openDayEditorModal(isoDate) {
  log('Modals', 'Opening day editor modal', { isoDate });
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
  
  let workoutDetailsHTML;
  if (plannedWorkoutList.length > 0) {
      const plural = plannedWorkoutList.length > 1 ? 'Esercizi' : 'Esercizio';
      workoutDetailsHTML = `<div class="workout-summary"><span>${plannedWorkoutList.length} ${plural}</span><div class="workout-summary-actions"><button class="btn-manage-workout btn btn-secondary">${UI_TEXT.MANAGE_WORKOUT_BTN}</button></div></div>`;
  } else {
      workoutDetailsHTML = `<button class="btn-add-exercise" data-slot-id="${workoutSlotId}">${UI_TEXT.ADD_EXERCISE_BTN}</button>`;
  }
  
  const workoutSlotHTML = `<div class="day-editor-slot"><span class="meal-type-label">${WORKOUT_SLOT_ID}</span><div class="meal-details-container">${workoutDetailsHTML}</div></div>`;

  body.innerHTML = mealSlotsHTML + workoutSlotHTML;

  body.onclick = e => {
    const btnAddMeal = e.target.closest('.btn-add-meal');
    const btnRemoveMeal = e.target.closest('.btn-remove-meal');
    const btnRecipe = e.target.closest('.btn-view-recipe');
    const btnAddExercise = e.target.closest('.btn-add-exercise');
    const btnManageWorkout = e.target.closest('.btn-manage-workout');

    if (btnAddMeal) { dayEditorModal.classList.add('modal-hidden'); openSelectionModal(btnAddMeal.dataset.slotId, isoDate); }
    else if (btnRemoveMeal) { updateWeeklyPlan(btnRemoveMeal.dataset.slotId, null); openDayEditorModal(isoDate); }
    else if (btnRecipe) {
      const meal = state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
      if (meal) showRecipeModal(meal);
    }
    else if (btnAddExercise) {
      dayEditorModal.classList.add('modal-hidden');
      openWorkoutEditorModal(isoDate);
    }
    else if (btnManageWorkout) {
      dayEditorModal.classList.add('modal-hidden');
      openWorkoutEditorModal(isoDate);
    }
  };
  dayEditorModal.classList.remove('modal-hidden');
}
