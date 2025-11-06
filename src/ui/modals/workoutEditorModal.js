import { getState, updateWeeklyWorkout, reorderWorkoutExercises, getExerciseForPlanner, addWorkoutTemplate, clearWeeklyWorkout, getTemplateById, setWeeklyWorkout, updateWorkoutTemplate } from '../../core/state.js';
import { WORKOUT_SLOT_ID } from '../../utils/constants.js';
import { UI_TEXT } from '../../config/uiText.js';
import { renderIcon } from '../icons.js';
import { log } from '../../utils/logger.js';
import { openWorkoutSelectionModal } from './selectionModal.js';
import { openExerciseEditorModal } from './exerciseEditorModal.js';
import { showNotification } from '../notifications.js';
import { showConfirmModal } from './confirmModal.js';

let sortableInstance = null;
let localExercises = [];
let currentConfig = {};

function formatFullDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatExerciseDetails(exercise) {
  const sets = exercise.defaultSets || '?';
  const rest = exercise.defaultRest || 0;
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
      details += `${exercise.defaultDuration || '?'}s`;
  } else {
      // Default a 'guided_tempo' o vecchio formato 'reps'
      details += `${exercise.defaultReps || '?'} reps`;
  }
  
  details += ` | Riposo: ${rest}s`;

  if (exercise.defaultTempo && exercise.execution_mode === 'guided_tempo') {
      const { up, hold, down } = exercise.defaultTempo;
      details += ` | Tempo: ${up}-${hold}-${down}`;
  }
  return details;
}

function renderList() {
  const body = document.getElementById('workout-editor-body');
  let exercisesHTML = localExercises.map((exercise, index) => {
      const exerciseDetails = formatExerciseDetails(exercise);
      return `<div class="meal-details draggable-item" data-index="${index}" data-instance-id="${exercise.instanceId}">
                  <div class="drag-handle">${renderIcon('DRAG_HANDLE', { width: 18, height: 18 })}</div>
                  <div class="exercise-info">
                      <span class="meal-details__name">${exercise.name}</span>
                      <span class="exercise-details-summary">${exerciseDetails}</span>
                  </div>
                  <div class="meal-actions">
                      <button class="btn-edit-exercise" title="Modifica" data-index="${index}">${renderIcon('EDIT', { width: 16, height: 16 })}</button>
                      <button class="btn-remove-exercise" title="Rimuovi" data-index="${index}">${renderIcon('TRASH', { width: 16, height: 16 })}</button>
                  </div>
              </div>`;
  }).join('');

  const addExerciseButton = `<button class="btn-add-exercise">${UI_TEXT.ADD_EXERCISE_BTN}</button>`;
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
          const [movedItem] = localExercises.splice(evt.oldIndex, 1);
          localExercises.splice(evt.newIndex, 0, movedItem);
          renderList(); // Rerender per aggiornare gli indici
      }
  });
}

function handleModalClick(e) {
    const btnAddExercise = e.target.closest('.btn-add-exercise');
    const btnRemoveExercise = e.target.closest('.btn-remove-exercise');
    const btnEditExercise = e.target.closest('.btn-edit-exercise');

    if (btnAddExercise) {
        // NON chiudere questo modal, apri l'altro sopra
        openWorkoutSelectionModal((exercise) => {
          if (exercise) {
            const newExerciseInstance = { ...exercise, instanceId: Date.now() + Math.random() };
            localExercises.push(newExerciseInstance);
            renderList(); // <-- FIX: Aggiorna la lista localmente
          }
          // NON richiamare openWorkoutEditorModal(currentConfig)
        });
    } else if (btnRemoveExercise) {
        const index = parseInt(btnRemoveExercise.dataset.index, 10);
        localExercises.splice(index, 1);
        renderList(); // Rerender
    } else if (btnEditExercise) {
        const index = parseInt(btnEditExercise.dataset.index, 10);
        const exercise = localExercises[index];
        if (exercise) {
          // Chiudi questo modal PRIMA di aprirne un altro
          document.getElementById('workout-editor-modal').classList.add('modal-hidden');
          
          openExerciseEditorModal({
            context: 'planner', // Usa lo stesso editor del planner
            exercise,
            slotId: null, // Non serve
            returnIsoDate: null, // Non serve
            onSaveCallback: (updatedExercise) => { // Usa il nuovo callback
              localExercises[index] = updatedExercise;
              openWorkoutEditorModal(currentConfig); // Riapre il modal aggiornato
            }
          });
        }
    }
}

export function openWorkoutEditorModal(config) {
  log('Modals', 'Opening workout editor modal (refactored)', { config });
  currentConfig = config; // Salva la configurazione corrente
  const state = getState();
  const modal = document.getElementById('workout-editor-modal');
  const body = modal.querySelector('#workout-editor-body');
  const footer = modal.querySelector('.modal-footer');
  
  // --- FIX START ---
  // Aggiungi il pulsante "Salva Modifiche" se non esiste, PRIMA di provare a selezionarlo.
  if (!footer.querySelector('#workout-editor-save-btn')) {
    const newSaveBtn = document.createElement('button');
    newSaveBtn.id = 'workout-editor-save-btn';
    newSaveBtn.className = 'btn btn-primary';
    footer.appendChild(newSaveBtn);
  }
  // --- FIX END ---
  
  const saveBtn = footer.querySelector('#workout-editor-save-btn');
  const saveTemplateBtn = footer.querySelector('#workout-editor-save-template-btn');

  let title = '';
  
  if (config.type === 'day') {
    const workoutSlotId = `${config.isoDate}-${WORKOUT_SLOT_ID}`;
    localExercises = JSON.parse(JSON.stringify(state.weeklyWorkouts[workoutSlotId] || []));
    title = `${UI_TEXT.WORKOUT_EDITOR_TITLE} - ${formatFullDate(config.isoDate)}`;
    saveBtn.style.display = 'block';
    saveTemplateBtn.style.display = 'block';
  } else if (config.type === 'template') {
    const isCreating = !config.templateId;
    const template = isCreating ? null : getTemplateById(config.templateId);
    localExercises = template ? JSON.parse(JSON.stringify(template.exercises)) : [];
    title = isCreating ? 'Crea Nuova Scheda' : `Modifica Scheda: ${template ? template.name : ''}`;
    
    saveBtn.style.display = isCreating ? 'none' : 'block';
    saveTemplateBtn.style.display = 'block';
  }

  modal.querySelector('#workout-editor-title').textContent = title;
  modal.querySelector('#workout-editor-save-template-btn').textContent = UI_TEXT.SAVE_TEMPLATE_BTN;
  modal.querySelector('#workout-editor-clear-btn').textContent = UI_TEXT.CLEAR_WORKOUT_BTN;
  footer.querySelector('#workout-editor-save-btn').textContent = UI_TEXT.WORKOUT_EDITOR_SAVE_CHANGES_BTN;

  renderList(); // Renderizza la lista locale

  // --- Gestione Listener (rimuovi e riaggiungi) ---
  body.onclick = handleModalClick; // Usa un handler dedicato

  const oldSaveTemplateBtn = footer.querySelector('#workout-editor-save-template-btn');
  const newSaveTemplateBtn = oldSaveTemplateBtn.cloneNode(true);
  oldSaveTemplateBtn.parentNode.replaceChild(newSaveTemplateBtn, oldSaveTemplateBtn);
  newSaveTemplateBtn.onclick = () => {
    if (localExercises.length === 0) {
      showNotification('Aggiungi almeno un esercizio prima di salvare la scheda.', 'error');
      return;
    }
    const templateName = prompt(UI_TEXT.SAVE_TEMPLATE_PROMPT);
    if (templateName && templateName.trim() !== '') {
      addWorkoutTemplate(templateName.trim(), localExercises);
      showNotification(UI_TEXT.TEMPLATE_SAVE_SUCCESS, 'success');
    }
  };

  const oldClearBtn = footer.querySelector('#workout-editor-clear-btn');
  const newClearBtn = oldClearBtn.cloneNode(true);
  oldClearBtn.parentNode.replaceChild(newClearBtn, oldClearBtn);
  newClearBtn.onclick = () => {
    if (localExercises.length === 0) {
      showNotification('L\'allenamento è già vuoto.', 'info');
      return;
    }
    showConfirmModal({
      title: UI_TEXT.CLEAR_WORKOUT_CONFIRM_TITLE,
      message: UI_TEXT.CLEAR_WORKOUT_CONFIRM_MSG,
      onConfirm: () => {
        localExercises = [];
        renderList();
        showNotification(UI_TEXT.CLEAR_WORKOUT_SUCCESS, 'success');
      },
      type: 'danger'
    });
  };

  const oldSaveBtn = footer.querySelector('#workout-editor-save-btn');
  const newSaveBtn = oldSaveBtn.cloneNode(true);
  oldSaveBtn.parentNode.replaceChild(newSaveBtn, oldSaveBtn);
  newSaveBtn.onclick = () => {
    if (config.type === 'day') {
      const workoutSlotId = `${config.isoDate}-${WORKOUT_SLOT_ID}`;
      setWeeklyWorkout(workoutSlotId, localExercises);
    } else if (config.type === 'template' && config.templateId) {
      updateWorkoutTemplate(config.templateId, localExercises);
    }
    showNotification(UI_TEXT.WORKOUT_EDITOR_UPDATE_SUCCESS, 'success');
    modal.classList.add('modal-hidden');
  };
  // --- Fine Gestione Listener ---

  modal.classList.remove('modal-hidden');
}
