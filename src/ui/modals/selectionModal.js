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
  const searchInput = selectionModal.querySelector('#selection-modal-search');

  function renderList(filterTerm = '') {
      const lowerCaseFilter = filterTerm.toLowerCase().trim();
      const filteredMeals = relevantMeals.filter(meal => {
          if (lowerCaseFilter === '') return true;
          const nameMatch = meal.nomePasto.toLowerCase().includes(lowerCaseFilter);
          const tagMatch = meal.etichette && meal.etichette.some(tag => tag.toLowerCase().includes(lowerCaseFilter));
          return nameMatch || tagMatch;
      });
      
      const noMealsText = filterTerm ? `Nessun pasto trovato per "${filterTerm}".` : UI_TEXT.NO_MEALS_AVAILABLE;
      list.innerHTML = filteredMeals.length > 0 
          ? filteredMeals.map(meal => `<div class="selection-item" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4>${formatIngredients(meal)}</div>`).join('') 
          : `<p class="placeholder-text">${noMealsText}</p>`;
  }

  searchInput.value = '';
  searchInput.oninput = (e) => {
      renderList(e.target.value);
  };
  
  renderList();
  
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
