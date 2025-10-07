import { getState, updateExerciseSetsInHistory } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { showNotification } from '../notifications.js';

let currentData = null;

function renderForm(exercise) {
    const body = document.getElementById('logged-exercise-editor-body');
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

function handleSaveChanges() {
    const form = document.getElementById('logged-exercise-form');
    const formData = new FormData(form);
    const newSetsData = [...currentData.exercise.setsData].map((set, index) => {
        const reps = formData.get(`reps_${index}`);
        const weight = formData.get(`weight_${index}`);
        return {
            ...set,
            reps: reps ? parseInt(reps, 10) : 0,
            weight: weight ? parseFloat(weight) : 0,
        };
    });

    updateExerciseSetsInHistory(currentData.date, currentData.startTime, currentData.exercise.instanceId, newSetsData);
    showNotification(UI_TEXT.WORKOUT_LOG_SAVE_SUCCESS, 'success');
    document.getElementById('logged-exercise-editor-modal').classList.add('modal-hidden');
}

export function openLoggedExerciseEditorModal(date, startTime, exerciseInstanceId) {
    log('Modals', 'Opening logged exercise editor modal', { date, startTime, exerciseInstanceId });
    const state = getState();
    const workout = state.workoutHistory[date]?.find(w => w.startTime === startTime);
    if (!workout) return;

    const exercise = workout.exercises.find(ex => ex.instanceId === exerciseInstanceId);
    if (!exercise) return;

    currentData = { date, startTime, exercise };

    const modal = document.getElementById('logged-exercise-editor-modal');
    modal.querySelector('#logged-exercise-editor-title').textContent = `${UI_TEXT.LOGGED_EXERCISE_EDITOR_TITLE}: ${exercise.name}`;
    modal.querySelector('#logged-exercise-editor-save-btn').textContent = UI_TEXT.LOGGED_EXERCISE_SAVE_BTN;

    renderForm(exercise);

    const saveBtn = document.getElementById('logged-exercise-editor-save-btn');
    saveBtn.replaceWith(saveBtn.cloneNode(true));
    document.getElementById('logged-exercise-editor-save-btn').addEventListener('click', handleSaveChanges);

    modal.classList.remove('modal-hidden');
}
