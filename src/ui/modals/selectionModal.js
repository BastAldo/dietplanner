import { getState, updateWeeklyPlan, updateWeeklyWorkout } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { formatIngredients } from '../../utils/formatters.js';
import { openDayEditorModal } from './dayEditorModal.js';
import { openWorkoutEditorModal } from './workoutEditorModal.js';

export function openSelectionModal(slotId, returnIsoDate, relevantMeals) {
  log('Modals', 'Opening meal selection modal', { slotId });
  const mealType = slotId.substring(11);
  const selectionModal = document.getElementById('selection-modal');
  selectionModal.querySelector('#selection-modal-title').textContent = `${UI_TEXT.SELECT_MEAL_TITLE} ${mealType}`;
  const list = selectionModal.querySelector('#selection-modal-list');
  list.innerHTML = relevantMeals.length > 0 ? relevantMeals.map(meal => `<div class="selection-item" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4>${formatIngredients(meal)}</div>`).join('') : `<p>${UI_TEXT.NO_MEALS_AVAILABLE}</p>`;
  
  const closeAndReturn = () => {
    selectionModal.classList.add('modal-hidden');
    if (returnIsoDate) openDayEditorModal(returnIsoDate);
  };

  list.onclick = e => {
    const item = e.target.closest('.selection-item');
    if(item) { 
      updateWeeklyPlan(slotId, item.dataset.mealId); 
      closeAndReturn(); 
    }
  };
  selectionModal.classList.remove('modal-hidden');
}

export function openWorkoutSelectionModal(slotId, returnIsoDate) {
  log('Modals', 'Opening workout selection modal', { slotId });
  const state = getState();
  const workoutSelectionModal = document.getElementById('workout-selection-modal');
  workoutSelectionModal.querySelector('#workout-selection-modal-title').textContent = UI_TEXT.SELECT_EXERCISE_TITLE;
  const list = workoutSelectionModal.querySelector('#workout-selection-modal-list');
  const relevantWorkouts = state.masterWorkoutList;
  list.innerHTML = relevantWorkouts.length > 0 ? relevantWorkouts.map(ex => `<div class="selection-item" data-exercise-id="${ex.id}"><h4>${ex.name}</h4><p>${ex.description}</p></div>`).join('') : `<p>${UI_TEXT.NO_WORKOUTS_AVAILABLE}</p>`;
  
  const closeAndReturn = () => {
    workoutSelectionModal.classList.add('modal-hidden');
    if (returnIsoDate) openWorkoutEditorModal(returnIsoDate);
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
