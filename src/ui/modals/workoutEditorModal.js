import { getState, updateWeeklyWorkout, reorderWorkoutExercises } from '../../core/state.js';
import { WORKOUT_SLOT_ID } from '../../utils/constants.js';
import { UI_TEXT } from '../../config/uiText.js';
import { renderIcon } from '../icons.js';
import { log } from '../../utils/logger.js';
import { openWorkoutSelectionModal } from './selectionModal.js';
import { openExerciseEditorModal } from './exerciseEditorModal.js';

let sortableInstance = null;

function formatFullDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
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

export function openWorkoutEditorModal(isoDate) {
  log('Modals', 'Opening workout editor modal', { isoDate });
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
          openWorkoutSelectionModal(btnAddExercise.dataset.slotId, isoDate);
      } else if (btnRemoveExercise) {
          updateWeeklyWorkout(btnRemoveExercise.dataset.slotId, null, parseInt(btnRemoveExercise.dataset.instanceId));
          openWorkoutEditorModal(isoDate); // Refresh this modal
      } else if (btnEditExercise) {
          openExerciseEditorModal(btnEditExercise.dataset.slotId, parseInt(btnEditExercise.dataset.instanceId), isoDate);
      }
  };

  modal.classList.remove('modal-hidden');
}
