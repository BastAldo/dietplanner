import { getState, updateWeeklyPlan, updateWeeklyWorkout, updateExerciseInstanceInWorkout, reorderWorkoutExercises } from '../core/state.js';
import { showNotification } from './notifications.js';
import { UI_TEXT, MEAL_TYPES, WORKOUT_SLOT_ID } from '../utils/constants.js';
import { renderIcon } from './icons.js';
import { log } from '../utils/logger.js';
import { formatIngredients } from '../utils/formatters.js';

let currentEditingDayISO = null;
let sortableInstance = null;

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

function formatExerciseDetails(exercise) {
  const sets = exercise.defaultSets;
  const rest = exercise.defaultRest;
  let details;

  if (exercise.type === 'reps') {
      const reps = exercise.defaultReps;
      details = `${sets} x ${reps} | Riposo: ${rest}s`;
  } else if (exercise.type === 'time') {
      const duration = exercise.defaultDuration;
      details = `${sets} x ${duration}s | Riposo: ${rest}s`;
  }

  if (exercise.defaultTempo) {
      const { up, hold, down } = exercise.defaultTempo;
      details += ` | Tempo: ${up}-${hold}-${down}`;
  }
  return details;
}

export async function showRecipeModal(meal) {
  if (!meal) return;
  log('Modals', 'Showing recipe modal', { mealId: meal.id });
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
  log('Modals', 'Showing confirm modal', { title });
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
  log('Modals', 'Opening meal selection modal', { slotId });
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
  log('Modals', 'Opening workout selection modal', { slotId });
  const state = getState();
  const workoutSelectionModal = document.getElementById('workout-selection-modal');
  workoutSelectionModal.querySelector('#workout-selection-modal-title').textContent = UI_TEXT.SELECT_EXERCISE_TITLE;
  const list = workoutSelectionModal.querySelector('#workout-selection-modal-list');
  const relevantWorkouts = state.masterWorkoutList;
  list.innerHTML = relevantWorkouts.length > 0 ? relevantWorkouts.map(ex => `<div class="selection-item" data-exercise-id="${ex.id}"><h4>${ex.name}</h4><p>${ex.description}</p></div>`).join('') : `<p>${UI_TEXT.NO_WORKOUTS_AVAILABLE}</p>`;
  
  const closeAndReturn = () => {
    workoutSelectionModal.classList.add('modal-hidden');
    if (currentEditingDayISO) openWorkoutEditorModal(currentEditingDayISO);
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

export function openExerciseEditorModal(slotId, instanceId) {
  log('Modals', 'Opening exercise editor modal', { slotId, instanceId });
  const state = getState();
  const modal = document.getElementById('exercise-editor-modal');
  const form = modal.querySelector('form');
  const workoutList = state.weeklyWorkouts[slotId] || [];
  const exercise = workoutList.find(ex => ex.instanceId === instanceId);

  if (!exercise) return;

  modal.querySelector('#exercise-editor-title').textContent = `${UI_TEXT.EXERCISE_EDITOR_TITLE}: ${exercise.name}`;
  modal.querySelector('#exercise-editor-save-btn').textContent = UI_TEXT.EXERCISE_SAVE_BTN;
  document.getElementById('ex-edit-tempo-hold-label').textContent = UI_TEXT.EXERCISE_TEMPO_HOLD_LABEL;
  
  form.elements.sets.value = exercise.defaultSets;
  form.elements.rest.value = exercise.defaultRest;

  const repsContainer = form.querySelector('.reps-group');
  const durationContainer = form.querySelector('.duration-group');

  if (exercise.type === 'reps') {
      repsContainer.style.display = 'block';
      durationContainer.style.display = 'none';
      form.elements.reps.value = exercise.defaultReps;
  } else {
      repsContainer.style.display = 'none';
      durationContainer.style.display = 'block';
      form.elements.duration.value = exercise.defaultDuration;
  }

  const tempoContainer = form.querySelector('.tempo-group');
  if (exercise.defaultTempo) {
      tempoContainer.style.display = 'grid';
      form.elements.tempo_up.value = exercise.defaultTempo.up;
      form.elements.tempo_hold.value = exercise.defaultTempo.hold;
      form.elements.tempo_down.value = exercise.defaultTempo.down;
  } else {
      tempoContainer.style.display = 'none';
  }

  form.onsubmit = e => {
      e.preventDefault();
      const newValues = {
          defaultSets: parseInt(form.elements.sets.value),
          defaultRest: parseInt(form.elements.rest.value)
      };
      if (exercise.type === 'reps') {
          newValues.defaultReps = parseInt(form.elements.reps.value);
      } else {
          newValues.defaultDuration = parseInt(form.elements.duration.value);
      }
      if (exercise.defaultTempo) {
          newValues.defaultTempo = {
              up: parseInt(form.elements.tempo_up.value),
              hold: parseInt(form.elements.tempo_hold.value),
              down: parseInt(form.elements.tempo_down.value)
          };
      }
      updateExerciseInstanceInWorkout(slotId, instanceId, newValues);
      modal.classList.add('modal-hidden');
      openWorkoutEditorModal(currentEditingDayISO);
  };
  
  modal.classList.remove('modal-hidden');
}

export function openWorkoutEditorModal(isoDate) {
  log('Modals', 'Opening workout editor modal', { isoDate });
  currentEditingDayISO = isoDate;
  const state = getState();
  const modal = document.getElementById('workout-editor-modal');
  modal.querySelector('#workout-editor-title').textContent = `${UI_TEXT.WORKOUT_EDITOR_TITLE} - ${formatFullDate(isoDate)}`;
  const body = modal.querySelector('#workout-editor-body');
  const workoutSlotId = `${isoDate}-${WORKOUT_SLOT_ID}`;
  const plannedWorkoutList = state.weeklyWorkouts[workoutSlotId] || [];

  let exercisesHTML = plannedWorkoutList.map(exercise => {
      const exerciseDetails = formatExerciseDetails(exercise);
      return `<div class="meal-details draggable-item" data-instance-id="${exercise.instanceId}">
                  <div class="drag-handle">${renderIcon('DRAG_HANDLE', { width: 18, height: 18 })}</div>
                  <div class="exercise-info">
                      <span class="meal-details__name">${exercise.name}</span>
                      <span class="exercise-details-summary">${exerciseDetails}</span>
                  </div>
                  <div class="meal-actions">
                      <button class="btn-edit-exercise" title="Modifica" data-slot-id="${workoutSlotId}" data-instance-id="${exercise.instanceId}">${renderIcon('EDIT', { width: 16, height: 16 })}</button>
                      <button class="btn-remove-exercise" title="Rimuovi" data-slot-id="${workoutSlotId}" data-instance-id="${exercise.instanceId}">${renderIcon('TRASH', { width: 16, height: 16 })}</button>
                  </div>
              </div>`;
  }).join('');

  const addExerciseButton = `<button class="btn-add-exercise" data-slot-id="${workoutSlotId}">${UI_TEXT.ADD_EXERCISE_BTN}</button>`;
  body.innerHTML = `<div class="day-editor-list workout-editor-list">${exercisesHTML}</div>${addExerciseButton}`;

  const listContainer = body.querySelector('.workout-editor-list');

  if (sortableInstance) {
      sortableInstance.destroy();
  }
  sortableInstance = new Sortable(listContainer, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      onEnd: function(evt) {
          reorderWorkoutExercises(workoutSlotId, evt.oldIndex, evt.newIndex);
      }
  });

  body.onclick = e => {
      const btnAddExercise = e.target.closest('.btn-add-exercise');
      const btnRemoveExercise = e.target.closest('.btn-remove-exercise');
      const btnEditExercise = e.target.closest('.btn-edit-exercise');

      if (btnAddExercise) {
          modal.classList.add('modal-hidden');
          openWorkoutSelectionModal(btnAddExercise.dataset.slotId);
      } else if (btnRemoveExercise) {
          updateWeeklyWorkout(btnRemoveExercise.dataset.slotId, null, parseInt(btnRemoveExercise.dataset.instanceId));
          openWorkoutEditorModal(isoDate); // Refresh this modal
      } else if (btnEditExercise) {
          modal.classList.add('modal-hidden');
          openExerciseEditorModal(btnEditExercise.dataset.slotId, parseInt(btnEditExercise.dataset.instanceId));
      }
  };

  modal.classList.remove('modal-hidden');
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

    if (btnAddMeal) { dayEditorModal.classList.add('modal-hidden'); openSelectionModal(btnAddMeal.dataset.slotId); }
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
