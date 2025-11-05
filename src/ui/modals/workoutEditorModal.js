import { getState, updateWeeklyWorkout, reorderWorkoutExercises, getExerciseForPlanner, addWorkoutTemplate } from '../../core/state.js';
import { WORKOUT_SLOT_ID } from '../../utils/constants.js';
import { UI_TEXT } from '../../config/uiText.js';
import { renderIcon } from '../icons.js';
import { log } from '../../utils/logger.js';
import { openWorkoutSelectionModal } from './selectionModal.js';
import { openExerciseEditorModal } from './exerciseEditorModal.js';
import { showNotification } from '../notifications.js';

let sortableInstance = null;

function formatFullDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatExerciseDetails(exercise) {
  const sets = exercise.defaultSets;
  const rest = exercise.defaultRest;
  let details = `${sets} x `;

  // Gestisce reps, rep-range, o durata in base alla modalità
  if (exercise.execution_mode === 'logging') {
      if (exercise.defaultRepsMin && exercise.defaultRepsMax) {
          details += `${exercise.defaultRepsMin}-${exercise.defaultRepsMax}`;
      } else if (exercise.defaultRepsMin) {
          details += `${exercise.defaultRepsMin}+`;
      } else {
          details += `Reps`; // Fallback
      }
  } else if (exercise.execution_mode === 'guided_static' || exercise.type === 'time') {
      details += `${exercise.defaultDuration}s`;
  } else {
      // Default a 'guided_tempo' o vecchio formato 'reps'
      details += `${exercise.defaultReps || 'Reps'}`;
  }
  
  details += ` | Riposo: ${rest}s`;

  if (exercise.defaultTempo && exercise.execution_mode === 'guided_tempo') {
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
  modal.querySelector('#workout-editor-save-template-btn').textContent = UI_TEXT.SAVE_TEMPLATE_BTN;
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

  // Rimuovi vecchi listener per evitare duplicati
  const footer = modal.querySelector('.modal-footer');
  const oldBtn = footer.querySelector('#workout-editor-save-template-btn');
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);

  newBtn.onclick = () => {
    const currentWorkoutList = getState().weeklyWorkouts[workoutSlotId] || [];
    if (currentWorkoutList.length === 0) {
      showNotification('Aggiungi almeno un esercizio prima di salvare la scheda.', 'error');
      return;
    }
    const templateName = prompt(UI_TEXT.SAVE_TEMPLATE_PROMPT);
    if (templateName && templateName.trim() !== '') {
      addWorkoutTemplate(templateName.trim(), currentWorkoutList);
      showNotification(UI_TEXT.TEMPLATE_SAVE_SUCCESS, 'success');
    }
  };

  body.onclick = e => {
      const btnAddExercise = e.target.closest('.btn-add-exercise');
      const btnRemoveExercise = e.target.closest('.btn-remove-exercise');
      const btnEditExercise = e.target.closest('.btn-edit-exercise');

      if (btnAddExercise) {
          modal.classList.add('modal-hidden');
          openWorkoutSelectionModal(btnAddExercise.dataset.slotId, isoDate);
      } else if (btnRemoveExercise) {
          updateWeeklyWorkout(btnRemoveExercise.dataset.slotId, null, parseFloat(btnRemoveExercise.dataset.instanceId));
          openWorkoutEditorModal(isoDate); // Refresh this modal
      } else if (btnEditExercise) {
          const slotId = btnEditExercise.dataset.slotId;
          const instanceId = btnEditExercise.dataset.instanceId;
          const exercise = getExerciseForPlanner(slotId, instanceId);
          if (exercise) {
            openExerciseEditorModal({
              context: 'planner',
              exercise,
              slotId,
              returnIsoDate: isoDate
            });
          }
      }
  };

  modal.classList.remove('modal-hidden');
}
