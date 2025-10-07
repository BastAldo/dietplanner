import { getState, updateWorkoutInHistory } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { showNotification } from '../notifications.js';

let currentWorkout = null;

function renderLogEditorForm(workout) {
    const body = document.getElementById('workout-log-editor-body');
    let formHTML = '<form id="workout-log-editor-form">';

    workout.exercises.forEach((exercise, exIndex) => {
        formHTML += `
            <fieldset class="log-editor-fieldset">
                <legend>${exercise.name}</legend>
                ${exercise.setsData.map((set, setIndex) => `
                    <div class="log-editor-set-row">
                        <span>${UI_TEXT.WORKOUT_LOG_SET_LABEL} ${setIndex + 1}</span>
                        <div class="form-group">
                            <label>${UI_TEXT.WORKOUT_LOG_REPS_LABEL}</label>
                            <input type="number" name="reps_${exIndex}_${setIndex}" value="${set.reps || ''}" min="0">
                        </div>
                        <div class="form-group">
                            <label>${UI_TEXT.WORKOUT_LOG_WEIGHT_LABEL}</label>
                            <input type="number" name="weight_${exIndex}_${setIndex}" value="${set.weight || ''}" min="0" step="0.1">
                        </div>
                    </div>
                `).join('')}
            </fieldset>
        `;
    });
    formHTML += '</form>';
    body.innerHTML = formHTML;
}


function handleSaveChanges() {
    const form = document.getElementById('workout-log-editor-form');
    const formData = new FormData(form);
    const updatedWorkout = JSON.parse(JSON.stringify(currentWorkout)); // Deep copy

    updatedWorkout.exercises.forEach((exercise, exIndex) => {
        exercise.setsData.forEach((set, setIndex) => {
            const reps = formData.get(`reps_${exIndex}_${setIndex}`);
            const weight = formData.get(`weight_${exIndex}_${setIndex}`);
            set.reps = reps ? parseInt(reps, 10) : 0;
            set.weight = weight ? parseFloat(weight) : 0;
        });
    });

    // Recalculate totalTonnage
    updatedWorkout.totalTonnage = updatedWorkout.exercises.reduce((total, exercise) => {
      const exerciseTonnage = exercise.setsData.reduce((acc, set) => acc + (set.reps * set.weight), 0);
      exercise.tonnage = exerciseTonnage;
      return total + exerciseTonnage;
    }, 0);

    updateWorkoutInHistory(updatedWorkout.date, updatedWorkout.startTime, updatedWorkout);
    showNotification(UI_TEXT.WORKOUT_LOG_SAVE_SUCCESS, 'success');
    document.getElementById('workout-log-editor-modal').classList.add('modal-hidden');
}

export function openWorkoutLogEditorModal(date, startTime) {
    log('Modals', 'Opening workout log editor modal', { date, startTime });
    const state = getState();
    const workout = state.workoutHistory[date]?.find(w => w.startTime === startTime);

    if (!workout || workout.type !== 'structured') return;
    currentWorkout = workout;

    const modal = document.getElementById('workout-log-editor-modal');
    modal.querySelector('#workout-log-editor-title').textContent = UI_TEXT.WORKOUT_LOG_EDITOR_TITLE;
    modal.querySelector('#workout-log-editor-save-btn').textContent = UI_TEXT.EXERCISE_SAVE_BTN;

    renderLogEditorForm(workout);

    const saveBtn = document.getElementById('workout-log-editor-save-btn');
    // Rimuovi vecchi listener prima di aggiungerne di nuovi
    saveBtn.replaceWith(saveBtn.cloneNode(true));
    document.getElementById('workout-log-editor-save-btn').addEventListener('click', handleSaveChanges);


    modal.classList.remove('modal-hidden');
}
