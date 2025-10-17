import {
  resetCurrentWeek, setPlannerConfig, setConfigUrl, navigateWeek, setView,
  copyPreviousWeek, getState, deleteWorkoutFromHistory, getExerciseFromHistory
} from '../../core/state.js';
import { initializeWorkout } from '../../core/trainer.js';
import { fetchAndParseConfig } from '../../api/configService.js';
import { showNotification } from '../notifications.js';
import { openDayEditorModal, showConfirmModal, showRecipeModal, openExerciseEditorModal } from '../modals.js';
import { WORKOUT_SLOT_ID } from '../../utils/constants.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';

async function handleLoadConfig() {
  log('Interactions', 'Handling config load button click');
  const url = document.getElementById('config-url-input').value.trim();
  if (!url) { showNotification(UI_TEXT.CONFIG_URL_EMPTY_ERROR, 'error'); return; }
  setConfigUrl(url);
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config, url);
    showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
  } catch (error) { showNotification(error.message, 'error'); }
}

function handleCalendarClick(e) {
  const startBtn = e.target.closest('.btn-start-workout-day');
  if (startBtn) {
      const isoDate = startBtn.dataset.date;
      log('Interactions', 'Start workout button clicked from calendar', { date: isoDate });
      const globalState = getState();
      const workoutSlotId = `${isoDate}-${WORKOUT_SLOT_ID}`;
      const exercisesForWorkout = globalState.weeklyWorkouts[workoutSlotId];
      initializeWorkout(exercisesForWorkout, isoDate);
      setView('trainer');
      return;
  }

  const dayCell = e.target.closest('.day-cell');
  if (dayCell) {
    log('Interactions', 'Calendar cell clicked', { date: dayCell.dataset.date });
    openDayEditorModal(dayCell.dataset.date);
  }
}

function handleRecipeClick(e) {
  const recipeItem = e.target.closest('.recipe-list-item');
  if (recipeItem) {
    const state = getState();
    const meal = state.masterMealList.find(m => m.id === recipeItem.dataset.mealId);
    if (meal) {
      log('Interactions', 'Recipe list item clicked', { mealId: meal.id });
      showRecipeModal(meal);
    }
  }
}

function handleLogViewClick(e) {
  const btnRecipe = e.target.closest('.btn-view-recipe');
  if (btnRecipe) {
    const state = getState();
    const meal = state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
    if (meal) {
      log('Interactions', 'Recipe button in log view clicked', { mealId: meal.id });
      showRecipeModal(meal);
    }
    return;
  }

  const btnDeleteWorkout = e.target.closest('.btn-delete-workout');
  if (btnDeleteWorkout) {
    const { date, starttime } = btnDeleteWorkout.dataset;
    log('Interactions', 'Delete workout button clicked', { date, starttime });
    showConfirmModal({
      title: UI_TEXT.DELETE_WORKOUT_CONFIRM_TITLE,
      message: UI_TEXT.DELETE_WORKOUT_CONFIRM_MSG,
      onConfirm: () => {
        deleteWorkoutFromHistory(date, parseInt(starttime));
        showNotification(UI_TEXT.DELETE_WORKOUT_SUCCESS, 'info');
      },
      type: 'danger'
    });
    return;
  }

  const btnEditExercise = e.target.closest('.btn-edit-logged-exercise');
  if(btnEditExercise) {
    const { date, starttime, instanceid } = btnEditExercise.dataset;
    log('Interactions', 'Edit logged exercise button clicked', { date, starttime, instanceid });
    const exercise = getExerciseFromHistory(date, parseInt(starttime, 10), parseFloat(instanceid));
    if (exercise) {
      openExerciseEditorModal({
        context: 'history',
        exercise,
        date,
        startTime: parseInt(starttime, 10)
      });
    }
    return;
  }
}

function handleCopyWeek() {
  log('Interactions', 'Copy week button clicked');
  showConfirmModal({
    title: UI_TEXT.COPY_WEEK_CONFIRM_TITLE,
    message: UI_TEXT.COPY_WEEK_CONFIRM_MSG,
    onConfirm: () => { copyPreviousWeek(); showNotification(UI_TEXT.COPY_WEEK_SUCCESS, 'success'); },
    type: 'primary'
  });
}

function handleResetWeek() {
  log('Interactions', 'Reset week button clicked');
  showConfirmModal({
    title: UI_TEXT.RESET_WEEK_CONFIRM_TITLE,
    message: UI_TEXT.RESET_WEEK_CONFIRM_MSG,
    onConfirm: () => { resetCurrentWeek(); showNotification(UI_TEXT.RESET_WEEK_SUCCESS, 'info'); },
    type: 'danger'
  });
}

export function initializePlannerListeners() {
  document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
  document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);
  document.getElementById('log-view').addEventListener('click', handleLogViewClick);
  document.getElementById('recipes-page').addEventListener('click', handleRecipeClick);
  document.getElementById('prev-week-btn').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('next-week-btn').addEventListener('click', () => navigateWeek(1));
  document.getElementById('view-calendar-btn').addEventListener('click', () => setView('planner'));
  document.getElementById('view-log-btn').addEventListener('click', () => setView('log'));
  document.getElementById('copy-week-btn').addEventListener('click', handleCopyWeek);
  document.getElementById('reset-btn').addEventListener('click', handleResetWeek);
}
