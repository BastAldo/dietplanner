import { getState, updateWeeklyPlan, getMealsForType } from '../../core/state.js';
import { MEAL_TYPES, WORKOUT_SLOT_ID, OPTIONAL_MEAL_TYPES } from '../../utils/constants.js';
import { UI_TEXT } from '../../config/uiText.js';
import { renderIcon } from '../icons.js';
import { log } from '../../utils/logger.js';
import { showRecipeModal } from './recipeModal.js';
import { openSelectionModal, openWorkoutTemplateSelectionModal } from './selectionModal.js';
import { openWorkoutEditorModal } from './workoutEditorModal.js';
import { openManualWorkoutModal } from './manualWorkoutModal.js';
import { formatIngredients } from '../../utils/formatters.js';

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
  const { userProfile } = state;
  const dayEditorModal = document.getElementById('day-editor-modal');
  dayEditorModal.querySelector('#day-editor-title').textContent = `${UI_TEXT.EDITOR_MODAL_TITLE_PREFIX} ${formatFullDate(isoDate)}`;
  const body = dayEditorModal.querySelector('#day-editor-body');

  // Build dynamic list of meal slots to show
  const activeMealSlots = [...MEAL_TYPES];
  Object.keys(OPTIONAL_MEAL_TYPES).forEach(key => {
    if (userProfile[key]) {
      activeMealSlots.push(OPTIONAL_MEAL_TYPES[key]);
    }
  });

  const mealSlotsHTML = activeMealSlots.map(mealType => {
    const slotId = `${isoDate}-${mealType}`;
    const plannedMeal = state.weeklyPlan[slotId];
    const meal = plannedMeal ? state.masterMealList.find(m => m.id === plannedMeal.id) : null;

    let mealContentHTML = `<button class="btn-add-meal" data-slot-id="${slotId}" data-meal-type="${mealType}">${UI_TEXT.ADD_MEAL_BTN}</button>`;
    if (meal) {
      mealContentHTML = `
          <div class="meal-details">
            <div class="meal-info">
              <span class="meal-details__name">${meal.nomePasto}</span>
              ${formatIngredients(meal)}
            </div>
            <div class="meal-actions">
              ${getRecipeButtonHTML(meal, state)}
              <button class="btn-remove-meal" data-slot-id="${slotId}">${renderIcon('TRASH', { width: 16, height: 16 })}</button>
            </div>
          </div>`;
    }
    return `<div class="editor-section">
              <div class="editor-section-header">${mealType}</div>
              <div class="editor-section-body">${mealContentHTML}</div>
            </div>`;
  }).join('');

  const workoutSlotId = `${isoDate}-${WORKOUT_SLOT_ID}`;
  const plannedWorkoutList = state.weeklyWorkouts[workoutSlotId] || [];

  let workoutDetailsHTML;
  if (plannedWorkoutList.length > 0) {
      const plural = plannedWorkoutList.length > 1 ? 'Esercizi' : 'Esercizio';
      workoutDetailsHTML = `<div class="workout-summary">
                              <span>${plannedWorkoutList.length} ${plural}</span>
                              <div class="workout-summary-actions">
                                <button class="btn-log-activity btn btn-secondary">${UI_TEXT.LOG_ACTIVITY_BTN}</button>
                                <button class="btn-add-from-template btn btn-secondary">${UI_TEXT.ADD_FROM_TEMPLATE_BTN}</button>
                                <button class="btn-manage-workout btn btn-secondary">${UI_TEXT.MANAGE_WORKOUT_BTN}</button>
                              </div>
                            </div>`;
  } else {
      workoutDetailsHTML = `<div class="workout-summary-actions">
                              <button class="btn-log-activity btn btn-secondary">${UI_TEXT.LOG_ACTIVITY_BTN}</button>
                              <button class="btn-add-from-template btn btn-secondary">${UI_TEXT.ADD_FROM_TEMPLATE_BTN}</button>
                              <button class="btn-add-exercise" data-slot-id="${workoutSlotId}">${UI_TEXT.ADD_EXERCISE_BTN}</button>
                            </div>`;
  }

  const workoutSlotHTML = `<div class="editor-section">
                            <div class="editor-section-header">${WORKOUT_SLOT_ID}</div>
                            <div class="editor-section-body">${workoutDetailsHTML}</div>
                          </div>`;

  body.innerHTML = mealSlotsHTML + workoutSlotHTML;

  body.onclick = e => {
    const btnAddMeal = e.target.closest('.btn-add-meal');
    const btnRemoveMeal = e.target.closest('.btn-remove-meal');
    const btnRecipe = e.target.closest('.btn-view-recipe');
    const btnAddExercise = e.target.closest('.btn-add-exercise');
    const btnAddFromTemplate = e.target.closest('.btn-add-from-template');
    const btnManageWorkout = e.target.closest('.btn-manage-workout');
    const btnLogActivity = e.target.closest('.btn-log-activity');

    if (btnAddMeal) {
      const mealType = btnAddMeal.dataset.mealType;
      const relevantMeals = getMealsForType(mealType);
      dayEditorModal.classList.add('modal-hidden');
      openSelectionModal(btnAddMeal.dataset.slotId, isoDate, relevantMeals);
    }
    else if (btnRemoveMeal) { updateWeeklyPlan(btnRemoveMeal.dataset.slotId, null); openDayEditorModal(isoDate); }
    else if (btnRecipe) {
      const meal = state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
      if (meal) showRecipeModal(meal);
    }
    else if (btnAddExercise) {
      dayEditorModal.classList.add('modal-hidden');
      openWorkoutEditorModal(isoDate);
    }
    else if (btnAddFromTemplate) {
      dayEditorModal.classList.add('modal-hidden');
      openWorkoutTemplateSelectionModal(workoutSlotId, isoDate);
    }
    else if (btnManageWorkout) {
      dayEditorModal.classList.add('modal-hidden');
      openWorkoutEditorModal(isoDate);
    }
    else if (btnLogActivity) {
      dayEditorModal.classList.add('modal-hidden');
      openManualWorkoutModal(isoDate);
    }
  };
  dayEditorModal.classList.remove('modal-hidden');
}
