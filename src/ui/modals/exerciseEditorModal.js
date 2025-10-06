import { getState, updateExerciseInstanceInWorkout } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { openWorkoutEditorModal } from './workoutEditorModal.js';

export function openExerciseEditorModal(slotId, instanceId, returnIsoDate) {
  log('Modals', 'Opening exercise editor modal', { slotId, instanceId });
  const state = getState();
  const modal = document.getElementById('exercise-editor-modal');
  const form = modal.querySelector('form');
  const workoutList = state.weeklyWorkouts[slotId] || [];
  const exercise = workoutList.find(ex => ex.instanceId === parseFloat(instanceId));

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
      updateExerciseInstanceInWorkout(slotId, parseFloat(instanceId), newValues);
      modal.classList.add('modal-hidden');
      openWorkoutEditorModal(returnIsoDate);
  };
  
  modal.classList.remove('modal-hidden');
}
