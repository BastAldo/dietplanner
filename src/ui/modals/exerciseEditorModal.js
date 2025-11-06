import { updateExerciseInstanceInWorkout, updateExerciseSetsInHistory, getState, addExercise, updateExercise } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { EXERCISE_FIELDS } from '../../config/forms.js';
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
  form.querySelector('.form-group-guided_tempo').style.display = 'none';
  form.querySelector('.form-group-guided_static').style.display = 'none';
  form.querySelector('.form-group-logging').style.display = 'none';
  form.querySelector('.form-group-tempo').style.display = 'none';

  if (mode === EXECUTION_MODES.GUIDED_TEMPO) {
    form.querySelector('.form-group-guided_tempo').style.display = 'flex';
    form.querySelector('.form-group-tempo').style.display = 'grid';
  } else if (mode === EXECUTION_MODES.GUIDED_STATIC) {
    form.querySelector('.form-group-guided_static').style.display = 'flex';
  } else if (mode === EXECUTION_MODES.LOGGING) {
    form.querySelector('.form-group-logging').style.display = 'grid';
  }
}

function renderExerciseForm(body, exercise, context) {
  const isLibraryContext = context === 'library';
  const isEditing = exercise !== null;

  // Normalizza i dati dell'esercizio per la prima apertura
  let currentMode = exercise?.execution_mode || EXECUTION_MODES.GUIDED_TEMPO;
  if (exercise?.type === 'time' && !exercise?.execution_mode) {
    currentMode = EXECUTION_MODES.GUIDED_STATIC;
  }

  // Costruisci il form dinamicamente
  let formHTML = '<form id="exercise-editor-form" class="biometrics-form">';

  // Gruppi di campi
  let commonHTML = '';
  let guidedTempoHTML = '';
  let guidedStaticHTML = '';
  let loggingHTML = '';
  let tempoHTML = '';

  EXERCISE_FIELDS.forEach(field => {
    // Gestione campi nested (es. defaultTempo.up)
    const fieldIdParts = field.id.split('.');
    let currentValue = exercise;
    if (isEditing) {
      for (const part of fieldIdParts) {
        currentValue = currentValue ? currentValue[part] : null;
      }
    } else {
      currentValue = '';
    }

    const label = UI_TEXT[field.label] || field.label;
    const inputId = `ex-edit-${field.id.replace('.', '-')}`;
    const isReadonly = (isEditing && field.id === 'id') && isLibraryContext;

    let fieldInputHTML = '';
    if (field.type === 'select') {
      fieldInputHTML = `<select id="${inputId}" name="${field.id}" ${field.props || ''}>
        ${field.options.map(opt => `<option value="${opt.value}" ${currentValue === opt.value ? 'selected' : ''}>${UI_TEXT[opt.label] || opt.label}</option>`).join('')}
      </select>`;
    } else if (field.type === 'textarea') {
      fieldInputHTML = `<textarea id="${inputId}" name="${field.id}" ${field.props || ''}>${currentValue || ''}</textarea>`;
    } else {
      fieldInputHTML = `<input type="${field.type}" id="${inputId}" name="${field.id}" value="${currentValue || ''}" ${field.props || ''} ${isReadonly ? 'readonly' : ''}>`;
    }

    const fieldGroupHTML = `<div class="form-group" style="${field.grid ? `grid-column: ${field.grid};` : ''}">
                              <label for="${inputId}">${label}</label>
                              ${fieldInputHTML}
                            </div>`;

    // Smista i campi nei gruppi corretti
    if (!isLibraryContext) {
      // Logica per 'planner': solo campi specifici
      if (field.id === 'execution_mode') commonHTML += fieldGroupHTML;
      if (field.id === 'defaultSets') commonHTML += fieldGroupHTML;
      if (field.id === 'defaultRest') commonHTML += fieldGroupHTML;
      if (field.id === 'defaultWeight') commonHTML += fieldGroupHTML;
      if (field.id === 'defaultReps') guidedTempoHTML += fieldGroupHTML;
      if (field.id === 'defaultDuration') guidedStaticHTML += fieldGroupHTML;
      if (field.id === 'defaultRepsMin') loggingHTML += fieldGroupHTML;
      if (field.id === 'defaultRepsMax') loggingHTML += fieldGroupHTML;
      if (field.group === 'tempo') tempoHTML += fieldGroupHTML;

    } else {
      // Logica per 'library': tutti i campi
      if (field.group === 'guided_tempo') guidedTempoHTML += fieldGroupHTML;
      else if (field.group === 'guided_static') guidedStaticHTML += fieldGroupHTML;
      else if (field.group === 'logging') loggingHTML += fieldGroupHTML;
      else if (field.group === 'tempo') tempoHTML += fieldGroupHTML;
      else commonHTML += fieldGroupHTML;
    }
  });

  // Assembla il form finale
  formHTML += commonHTML;
  formHTML += `<div class="form-group-guided_tempo" style="display: none;">${guidedTempoHTML}</div>`;
  formHTML += `<div class="form-group-guided_static" style="display: none;">${guidedStaticHTML}</div>`;
  formHTML += `<div class="form-group-logging" style="grid-column: 1 / -1; display: none; grid-template-columns: 1fr 1fr; gap: 1rem;">${loggingHTML}</div>`;
  formHTML += `<div class="form-group-tempo" style="grid-column: 1 / -1; display: none; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">${tempoHTML}</div>`;
  formHTML += '</form>';

  body.innerHTML = formHTML;

  // Imposta la visibilità iniziale
  const form = body.querySelector('#exercise-editor-form');
  toggleFormFields(form, currentMode);

  // Aggiungi listener per il cambio di modalità
  const modeSelect = form.querySelector('select[name="execution_mode"]');
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      toggleFormFields(form, e.target.value);
    });
  }
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
  const { context, exercise, date, startTime, slotId, returnIsoDate, onSaveCallback } = config;
  const isEditing = exercise !== null;
  log('Modals', `Opening exercise editor modal (context: ${context}, editing: ${isEditing})`, { config });

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
      renderExerciseForm(body, exercise, 'planner');
      form = body.querySelector('#exercise-editor-form');

      saveHandler = (e) => {
          e.preventDefault();
          const newValues = {
              execution_mode: form.elements.execution_mode.value,
              defaultSets: parseInt(form.elements.defaultSets.value),
              defaultRest: parseInt(form.elements.defaultRest.value),
              defaultWeight: parseFloat(form.elements.defaultWeight.value),
              defaultReps: null,
              defaultDuration: null,
              defaultRepsMin: null,
              defaultRepsMax: null,
              defaultTempo: exercise.defaultTempo // Preserva l'oggetto tempo se esiste
          };

          if (newValues.execution_mode === EXECUTION_MODES.GUIDED_TEMPO) {
              newValues.defaultReps = parseInt(form.elements.defaultReps.value);
              newValues.defaultTempo = {
                  up: parseInt(form.elements['defaultTempo.up'].value),
                  hold: parseInt(form.elements['defaultTempo.hold'].value),
                  down: parseInt(form.elements['defaultTempo.down'].value)
              };
          } else if (newValues.execution_mode === EXECUTION_MODES.GUIDED_STATIC) {
              newValues.defaultDuration = parseInt(form.elements.defaultDuration.value);
          } else if (newValues.execution_mode === EXECUTION_MODES.LOGGING) {
              newValues.defaultRepsMin = parseInt(form.elements.defaultRepsMin.value);
              newValues.defaultRepsMax = parseInt(form.elements.defaultRepsMax.value);
          }
          
          const updatedExercise = { ...exercise, ...newValues };

          if (onSaveCallback) {
            // Nuovo flusso per workoutEditorModal
            onSaveCallback(updatedExercise);
            modal.classList.add('modal-hidden');
          } else {
            // Flusso vecchio per dayEditorModal
            updateExerciseInstanceInWorkout(slotId, exercise.instanceId, newValues);
            modal.classList.add('modal-hidden');
            openWorkoutEditorModal({ type: 'day', isoDate: returnIsoDate });
          }
      };

  } else if (context === 'library') {
      modal.querySelector('#exercise-editor-title').textContent = isEditing ? UI_TEXT.EXERCISE_EDIT_TITLE : UI_TEXT.EXERCISE_NEW_TITLE;
      saveBtn.textContent = UI_TEXT.EXERCISE_SAVE_BTN_LIB;
      renderExerciseForm(body, exercise, 'library');
      form = body.querySelector('#exercise-editor-form');

      saveHandler = (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const newExerciseData = {};
          let isValid = true;

          for (const field of EXERCISE_FIELDS) {
              let value = formData.get(field.id);
              if (field.type === 'number') {
                  value = value ? parseFloat(value) : null;
              }
              if (field.props && field.props.includes('required') && !value) {
                  isValid = false;
                  showNotification(`Il campo '${UI_TEXT[field.label] || field.label}' è obbligatorio.`, 'error');
                  break;
              }

              // Gestione campi nested (es. defaultTempo.up)
              if (field.id.includes('.')) {
                  const [parent, child] = field.id.split('.');
                  if (!newExerciseData[parent]) newExerciseData[parent] = {};
                  newExerciseData[parent][child] = value;
              } else {
                  newExerciseData[field.id] = value;
              }
          }

          if (!isValid) return;

          if (isEditing) {
              updateExercise(exercise.id, newExerciseData);
              showNotification(UI_TEXT.EXERCISE_UPDATE_SUCCESS, 'success');
          } else {
              const state = getState();
              if (state.masterWorkoutList.some(ex => ex.id === newExerciseData.id)) {
                  showNotification(UI_TEXT.EXERCISE_ID_CONFLICT, 'error');
                  return;
              }
              addExercise(newExerciseData);
              showNotification(UI_TEXT.EXERCISE_CREATE_SUCCESS, 'success');
          }

          modal.classList.add('modal-hidden');
      };
  }

  saveBtn.replaceWith(saveBtn.cloneNode(true));
  document.getElementById('exercise-editor-save-btn').addEventListener('click', saveHandler, { once: true });
  modal.classList.remove('modal-hidden');
}
