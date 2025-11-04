import { updateExerciseInstanceInWorkout, updateExerciseSetsInHistory } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { openWorkoutEditorModal } from './workoutEditorModal.js';
import { showNotification } from '../notifications.js';

const EXECUTION_MODES = {
  GUIDED_TEMPO: 'guided_tempo',
  GUIDED_STATIC: 'guided_static',
  LOGGING: 'logging'
};

// Funzione helper per gestire la visibilità dei campi
function toggleFormFields(form, mode) {
  form.querySelector('.reps-group').style.display = 'none';
  form.querySelector('.duration-group').style.display = 'none';
  form.querySelector('.tempo-group').style.display = 'none';
  form.querySelector('.reps-range-group').style.display = 'none';

  if (mode === EXECUTION_MODES.GUIDED_TEMPO) {
    form.querySelector('.reps-group').style.display = 'flex';
    form.querySelector('.tempo-group').style.display = 'grid';
  } else if (mode === EXECUTION_MODES.GUIDED_STATIC) {
    form.querySelector('.duration-group').style.display = 'flex';
  } else if (mode === EXECUTION_MODES.LOGGING) {
    form.querySelector('.reps-range-group').style.display = 'grid';
  }
}

function renderPlannerForm(body, exercise) {
  // Normalizza i dati dell'esercizio per la prima apertura
  let currentMode = exercise.execution_mode || EXECUTION_MODES.GUIDED_TEMPO;
  if (exercise.type === 'time' && !exercise.execution_mode) {
    currentMode = EXECUTION_MODES.GUIDED_STATIC;
  }
  
  body.innerHTML = `
    <form id="exercise-editor-form">
      <div class="form-group" style="grid-column: 1 / -1;">
        <label for="ex-edit-mode">Modalità Esecuzione</label>
        <select id="ex-edit-mode" name="execution_mode">
          <option value="${EXECUTION_MODES.GUIDED_TEMPO}" ${currentMode === EXECUTION_MODES.GUIDED_TEMPO ? 'selected' : ''}>Guidato (Tempo)</option>
          <option value="${EXECUTION_MODES.GUIDED_STATIC}" ${currentMode === EXECUTION_MODES.GUIDED_STATIC ? 'selected' : ''}>Guidato (Durata)</option>
          <option value="${EXECUTION_MODES.LOGGING}" ${currentMode === EXECUTION_MODES.LOGGING ? 'selected' : ''}>Logging (Manuale)</option>
        </select>
      </div>

      <div class="form-group sets-group">
        <label for="ex-edit-sets">Serie</label>
        <input type="number" id="ex-edit-sets" name="sets" min="1" value="${exercise.defaultSets}">
      </div>

      <div class="form-group reps-group">
        <label for="ex-edit-reps">Ripetizioni</label>
        <input type="number" id="ex-edit-reps" name="reps" min="1" value="${exercise.defaultReps || ''}">
      </div>

      <div class="form-group duration-group">
        <label for="ex-edit-duration">Durata (s)</label>
        <input type="number" id="ex-edit-duration" name="duration" min="1" value="${exercise.defaultDuration || ''}">
      </div>

      <div class="reps-range-group" style="grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label for="ex-edit-reps-min">Rep Min</label>
          <input type="number" id="ex-edit-reps-min" name="reps_min" min="1" value="${exercise.defaultRepsMin || ''}">
        </div>
        <div class="form-group">
          <label for="ex-edit-reps-max">Rep Max</label>
          <input type="number" id="ex-edit-reps-max" name="reps_max" min="1" value="${exercise.defaultRepsMax || ''}">
        </div>
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
  
  // Imposta la visibilità iniziale
  const form = body.querySelector('#exercise-editor-form');
  toggleFormFields(form, currentMode);
  
  // Aggiungi listener per il cambio di modalità
  form.querySelector('#ex-edit-mode').addEventListener('change', (e) => {
    toggleFormFields(form, e.target.value);
  });
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

export function openExerciseEditorModal(config) {
  const { context, exercise, date, startTime, slotId, returnIsoDate } = config;
  log('Modals', 'Opening exercise editor modal', { config });

  const modal = document.getElementById('exercise-editor-modal');
  const body = modal.querySelector('#exercise-editor-body');
  const saveBtn = modal.querySelector('#exercise-editor-save-btn');
  let form;
  let saveHandler;

  if (context === 'history') {
      modal.querySelector('#exercise-editor-title').textContent = `${UI_TEXT.LOGGED_EXERCISE_EDITOR_TITLE}: ${exercise.name}`;
      saveBtn.textContent = UI_TEXT.LOGGED_EXERCISE_SAVE_BTN;
      renderLogForm(body, exercise);
      form = body.querySelector('#logged-exercise-form');

      saveHandler = (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const newSetsData = [...exercise.setsData].map((set, index) => ({
              ...set,
              reps: parseInt(formData.get(`reps_${index}`), 10) || 0,
              weight: parseFloat(formData.get(`weight_${index}`)) || 0,
          }));

          updateExerciseSetsInHistory(date, startTime, exercise.instanceId, newSetsData);
          showNotification(UI_TEXT.WORKOUT_LOG_SAVE_SUCCESS, 'success');
          modal.classList.add('modal-hidden');
      };

  } else if (context === 'planner') {
      modal.querySelector('#exercise-editor-title').textContent = `${UI_TEXT.EXERCISE_EDITOR_TITLE}: ${exercise.name}`;
      saveBtn.textContent = UI_TEXT.EXERCISE_SAVE_BTN;
      renderPlannerForm(body, exercise);
      form = body.querySelector('#exercise-editor-form');

      saveHandler = (e) => {
          e.preventDefault();
          const newValues = {
              execution_mode: form.elements.execution_mode.value,
              defaultSets: parseInt(form.elements.sets.value),
              defaultRest: parseInt(form.elements.rest.value),
              defaultWeight: parseFloat(form.elements.weight.value),
              // Resetta tutti i valori specifici della modalità
              defaultReps: null,
              defaultDuration: null,
              defaultRepsMin: null,
              defaultRepsMax: null,
              defaultTempo: exercise.defaultTempo // Preserva l'oggetto tempo se esiste
          };

          if (newValues.execution_mode === EXECUTION_MODES.GUIDED_TEMPO) {
              newValues.defaultReps = parseInt(form.elements.reps.value);
              // BUG FIX: Salva i dati del tempo se la modalità è GUIDED_TEMPO
              newValues.defaultTempo = {
                  up: parseInt(form.elements.tempo_up.value),
                  hold: parseInt(form.elements.tempo_hold.value),
                  down: parseInt(form.elements.tempo_down.value)
              };
          } else if (newValues.execution_mode === EXECUTION_MODES.GUIDED_STATIC) {
              newValues.defaultDuration = parseInt(form.elements.duration.value);
          } else if (newValues.execution_mode === EXECUTION_MODES.LOGGING) {
              newValues.defaultRepsMin = parseInt(form.elements.reps_min.value);
              newValues.defaultRepsMax = parseInt(form.elements.reps_max.value);
          }
          
          updateExerciseInstanceInWorkout(slotId, exercise.instanceId, newValues);
          modal.classList.add('modal-hidden');
          openWorkoutEditorModal(returnIsoDate);
      };
  }

  saveBtn.replaceWith(saveBtn.cloneNode(true));
  document.getElementById('exercise-editor-save-btn').addEventListener('click', saveHandler, { once: true });
  modal.classList.remove('modal-hidden');
}
