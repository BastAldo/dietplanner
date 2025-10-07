import { getState, updateExerciseInstanceInWorkout, updateExerciseSetsInHistory } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { openWorkoutEditorModal } from './workoutEditorModal.js';
import { showNotification } from '../notifications.js';

function renderPlannerForm(body, exercise) {
  body.innerHTML = `
    <form id="exercise-editor-form">
      <div class="form-group sets-group">
        <label for="ex-edit-sets">Serie</label>
        <input type="number" id="ex-edit-sets" name="sets" min="1" value="${exercise.defaultSets}">
      </div>
      <div class="form-group reps-group" style="display: ${exercise.type === 'reps' ? 'flex' : 'none'};">
        <label for="ex-edit-reps">Ripetizioni</label>
        <input type="number" id="ex-edit-reps" name="reps" min="1" value="${exercise.defaultReps || ''}">
      </div>
      <div class="form-group duration-group" style="display: ${exercise.type === 'time' ? 'flex' : 'none'};">
        <label for="ex-edit-duration">Durata (s)</label>
        <input type="number" id="ex-edit-duration" name="duration" min="1" value="${exercise.defaultDuration || ''}">
      </div>
      <div class="form-group rest-group">
        <label for="ex-edit-rest">Riposo (s)</label>
        <input type="number" id="ex-edit-rest" name="rest" min="0" value="${exercise.defaultRest}">
      </div>
      <div class="form-group weight-group">
        <label for="ex-edit-weight" id="ex-edit-weight-label">${UI_TEXT.EXERCISE_WEIGHT_LABEL}</label>
        <input type="number" id="ex-edit-weight" name="weight" min="0" step="0.5" value="${exercise.defaultWeight || 0}">
      </div>
      <div class="tempo-group" style="display: ${exercise.defaultTempo ? 'grid' : 'none'};">
        <div class="form-group">
          <label for="ex-edit-tempo-up">Salita (s)</label>
          <input type="number" id="ex-edit-tempo-up" name="tempo_up" min="0" step="0.5" value="${exercise.defaultTempo?.up || 0}">
        </div>
        <div class="form-group">
          <label for="ex-edit-tempo-hold" id="ex-edit-tempo-hold-label">${UI_TEXT.EXERCISE_TEMPO_HOLD_LABEL}</label>
          <input type="number" id="ex-edit-tempo-hold" name="tempo_hold" min="0" step="0.5" value="${exercise.defaultTempo?.hold || 0}">
        </div>
        <div class="form-group">
          <label for="ex-edit-tempo-down">Discesa (s)</label>
          <input type="number" id="ex-edit-tempo-down" name="tempo_down" min="0" step="0.5" value="${exercise.defaultTempo?.down || 0}">
        </div>
      </div>
    </form>
  `;
}

function renderLogForm(body, exercise) {
  const showWeight = exercise.defaultWeight || exercise.setsData.some(s => s.weight > 0);
  let formHTML = `<form id="logged-exercise-form" class="structured-form">`;
  formHTML += exercise.setsData.map((set, index) => {
      const weightInput = showWeight ? `
          <div class="form-group">
              <label for="set-weight-${index}">${UI_TEXT.LOGGED_EXERCISE_WEIGHT_LABEL}</label>
              <input type="number" id="set-weight-${index}" name="weight_${index}" value="${set.weight || 0}" min="0" step="0.1">
          </div>
      ` : '';
      return `
          <div class="set-editor-row">
              <span class="set-editor-label">${UI_TEXT.LOGGED_EXERCISE_SET_LABEL} ${index + 1}</span>
              <div class="form-group">
                  <label for="set-reps-${index}">${UI_TEXT.LOGGED_EXERCISE_REPS_LABEL}</label>
                  <input type="number" id="set-reps-${index}" name="reps_${index}" value="${set.reps || 0}" min="0">
              </div>
              ${weightInput}
          </div>
      `;
  }).join('');
  formHTML += '</form>';
  body.innerHTML = formHTML;
}

export function openExerciseEditorModal(slotId, instanceId, returnIsoDate, loggedContext = null) {
  log('Modals', 'Opening exercise editor modal', { slotId, instanceId, loggedContext });
  const state = getState();
  const modal = document.getElementById('exercise-editor-modal');
  const body = modal.querySelector('#exercise-editor-body');
  const saveBtn = modal.querySelector('#exercise-editor-save-btn');

  if (loggedContext) {
    // --- LOG EDITING MODE ---
    const { date, startTime, instanceId: loggedInstanceId } = loggedContext;
    const workout = state.workoutHistory[date]?.find(w => w.startTime === startTime);
    if (!workout) return;
    const exercise = workout.exercises.find(ex => ex.instanceId === loggedInstanceId);
    if (!exercise) return;

    modal.querySelector('#exercise-editor-title').textContent = `${UI_TEXT.LOGGED_EXERCISE_EDITOR_TITLE}: ${exercise.name}`;
    saveBtn.textContent = UI_TEXT.LOGGED_EXERCISE_SAVE_BTN;
    renderLogForm(body, exercise);

    const form = body.querySelector('#logged-exercise-form');
    const boundSaveHandler = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const newSetsData = [...exercise.setsData].map((set, index) => ({
        ...set,
        reps: parseInt(formData.get(`reps_${index}`), 10) || 0,
        weight: parseFloat(formData.get(`weight_${index}`)) || 0,
      }));

      updateExerciseSetsInHistory(date, startTime, loggedInstanceId, newSetsData);
      showNotification(UI_TEXT.WORKOUT_LOG_SAVE_SUCCESS, 'success');
      modal.classList.add('modal-hidden');
    };
    saveBtn.replaceWith(saveBtn.cloneNode(true));
    document.getElementById('exercise-editor-save-btn').addEventListener('click', boundSaveHandler, { once: true });

  } else {
    // --- PLANNER EDITING MODE ---
    const workoutList = state.weeklyWorkouts[slotId] || [];
    const exercise = workoutList.find(ex => ex.instanceId === parseFloat(instanceId));
    if (!exercise) return;

    modal.querySelector('#exercise-editor-title').textContent = `${UI_TEXT.EXERCISE_EDITOR_TITLE}: ${exercise.name}`;
    saveBtn.textContent = UI_TEXT.EXERCISE_SAVE_BTN;
    renderPlannerForm(body, exercise);

    const form = body.querySelector('#exercise-editor-form');
    const boundSaveHandler = (e) => {
      e.preventDefault();
      const newValues = {
          defaultSets: parseInt(form.elements.sets.value),
          defaultRest: parseInt(form.elements.rest.value),
          defaultWeight: parseFloat(form.elements.weight.value)
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
    saveBtn.replaceWith(saveBtn.cloneNode(true));
    document.getElementById('exercise-editor-save-btn').addEventListener('click', boundSaveHandler, { once: true });
  }

  modal.classList.remove('modal-hidden');
}