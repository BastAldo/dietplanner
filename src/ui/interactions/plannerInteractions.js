import {
  resetCurrentWeek, setPlannerConfig, setConfigUrl, navigateWeek, setView,
  copyPreviousWeek, getState, deleteWorkoutFromHistory
} from '../../core/state.js';
import { initializeWorkout } from '../../core/trainer.js';
import { fetchAndParseConfig } from '../../api/configService.js';
import { showNotification } from '../notifications.js';
import { openDayEditorModal, showConfirmModal, showRecipeModal, openWorkoutLogEditorModal } from '../modals.js';
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
    showConfirmModal(
      UI_TEXT.DELETE_WORKOUT_CONFIRM_TITLE,
      UI_TEXT.DELETE_WORKOUT_CONFIRM_MSG,
      () => {
        deleteWorkoutFromHistory(date, parseInt(starttime));
        showNotification(UI_TEXT.DELETE_WORKOUT_SUCCESS, 'info');
      },
      'danger'
    );
    return;
  }

  const btnEditWorkout = e.target.closest('.btn-edit-workout');
  if (btnEditWorkout) {
    const { date, starttime } = btnEditWorkout.dataset;
    log('Interactions', 'Edit workout button clicked', { date, starttime });
    openWorkoutLogEditorModal(date, parseInt(starttime, 10));
    return;
  }
}

function handleCopyWeek() {
  log('Interactions', 'Copy week button clicked');
  showConfirmModal(
    UI_TEXT.COPY_WEEK_CONFIRM_TITLE, UI_TEXT.COPY_WEEK_CONFIRM_MSG,
    () => { copyPreviousWeek(); showNotification(UI_TEXT.COPY_WEEK_SUCCESS, 'success'); }, 'primary'
  );
}

function handleResetWeek() {
  log('Interactions', 'Reset week button clicked');
  showConfirmModal(
    UI_TEXT.RESET_WEEK_CONFIRM_TITLE, UI_TEXT.RESET_WEEK_CONFIRM_MSG,
    () => { resetCurrentWeek(); showNotification(UI_TEXT.RESET_WEEK_SUCCESS, 'info'); }, 'danger'
  );
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
