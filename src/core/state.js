import { LOCAL_STORAGE_KEY_PLAN, LOCAL_STORAGE_KEY_URL, MEAL_TYPES, LOCAL_STORAGE_KEY_BIOMETRICS, LOCAL_STORAGE_KEY_PROFILE, LOCAL_STORAGE_KEY_WORKOUTS, WORKOUT_SLOT_ID, LOCAL_STORAGE_KEY_WORKOUT_HISTORY, LOCAL_STORAGE_KEY_GOALS } from '../utils/constants.js';
import { processMealsWithCalories } from './calorieCalculator.js';
import { resetWorkoutState } from './trainer.js';
import { log } from '../utils/logger.js';

let state = {
  rules: [],
  masterMealList: [],
  masterWorkoutList: [],
  weeklyPlan: {},
  weeklyWorkouts: {},
  workoutHistory: {},
  biometricData: [],
  userProfile: {},
  userGoals: {},
  configUrl: '',
  recipeBaseUrl: '',
  focusedDate: new Date(),
  currentView: 'planner', // 'planner', 'log', 'progress', 'charts', 'recipes', 'profile', 'trainer', 'debriefing', 'goals'
  debugMode: false,
  lastWorkoutSummary: null,
};

const notify = () => document.dispatchEvent(new CustomEvent('stateChange'));
const toISODateString = (date) => date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

const getWeekStartDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getState = () => ({ ...state });

export function toggleDebugMode() {
  state.debugMode = !state.debugMode;
  console.log(`%cDebug mode is now ${state.debugMode ? 'ON' : 'OFF'}`, 'color: white; background-color: #ef5350; padding: 4px; border-radius: 4px;');
}

export function setPlannerConfig(config, url) {
  log('State', 'Setting new planner config', { url });
  state.rules = config.rules || [];
  const ingredients = config.ingredienti || [];
  const meals = config.meals || [];
  state.masterWorkoutList = config.esercizi || [];

  // Calcola calorie e popola la master list
  state.masterMealList = processMealsWithCalories(meals, ingredients);

  // Deriva e imposta la recipeBaseUrl
  if (url) {
      const baseUrl = new URL(url);
      const recipePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/')) + '/ricette/';
      state.recipeBaseUrl = `${baseUrl.origin}${recipePath}`;
  } else {
      state.recipeBaseUrl = '';
  }

  notify();
}

export function setConfigUrl(url) {
  log('State', 'Setting new config URL', { url });
  state.configUrl = url;
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, url);
  notify();
}

export function saveStateToLocalStorage() {
  log('State', 'Saving all application state to localStorage');
  localStorage.setItem(LOCAL_STORAGE_KEY_PLAN, JSON.stringify(state.weeklyPlan));
  localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUTS, JSON.stringify(state.weeklyWorkouts));
  localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUT_HISTORY, JSON.stringify(state.workoutHistory));
  localStorage.setItem(LOCAL_STORAGE_KEY_BIOMETRICS, JSON.stringify(state.biometricData));
  localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(state.userProfile));
  localStorage.setItem(LOCAL_STORAGE_KEY_GOALS, JSON.stringify(state.userGoals));
}

export function loadStateFromLocalStorage() {
  log('State', 'Loading all application state from localStorage');
  const plan = localStorage.getItem(LOCAL_STORAGE_KEY_PLAN);
  const workouts = localStorage.getItem(LOCAL_STORAGE_KEY_WORKOUTS);
  const history = localStorage.getItem(LOCAL_STORAGE_KEY_WORKOUT_HISTORY);
  const url = localStorage.getItem(LOCAL_STORAGE_KEY_URL);
  const biometrics = localStorage.getItem(LOCAL_STORAGE_KEY_BIOMETRICS);
  const profile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
  const goals = localStorage.getItem(LOCAL_STORAGE_KEY_GOALS);

  if (plan) { try { state.weeklyPlan = JSON.parse(plan); } catch (e) { console.error("Error parsing weeklyPlan", e); state.weeklyPlan = {}; } }
  if (workouts) { try { state.weeklyWorkouts = JSON.parse(workouts); } catch (e) { console.error("Error parsing weeklyWorkouts", e); state.weeklyWorkouts = {}; } }
  if (history) { try { state.workoutHistory = JSON.parse(history); } catch (e) { console.error("Error parsing workoutHistory", e); state.workoutHistory = {}; } }
  if (url) { state.configUrl = url; }
  if (biometrics) { try { state.biometricData = JSON.parse(biometrics); } catch (e) { console.error("Error parsing biometricData", e); state.biometricData = []; } }
  if (profile) { try { state.userProfile = JSON.parse(profile); } catch (e) { console.error("Error parsing userProfile", e); state.userProfile = {}; } }
  if (goals) { try { state.userGoals = JSON.parse(goals); } catch (e) { console.error("Error parsing userGoals", e); state.userGoals = {}; } }
}

export function setAppState(backupData) {
  log('State', 'Restoring application state from backup');
  state.weeklyPlan = backupData.weeklyPlan || {};
  state.weeklyWorkouts = backupData.weeklyWorkouts || {};
  state.workoutHistory = backupData.workoutHistory || {};
  state.configUrl = backupData.configUrl || '';
  state.biometricData = backupData.biometricData || [];
  state.userProfile = backupData.userProfile || {};
  state.userGoals = backupData.userGoals || {};
  saveStateToLocalStorage();
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, state.configUrl);
  notify();
}

export function saveUserProfile(profile) {
  log('State', 'Saving user profile', { profile });
  state.userProfile = profile;
  saveStateToLocalStorage();
  notify();
}

export function saveUserGoals(goals) {
    log('State', 'Saving user goals', { goals });
    state.userGoals = goals;
    saveStateToLocalStorage();
    notify();
}

export function addOrUpdateBiometricEntry(entry) {
  log('State', 'Adding or updating biometric entry', { entry });
  const index = state.biometricData.findIndex(e => e.date === entry.date);
  if (index > -1) {
    state.biometricData[index] = entry;
  } else {
    state.biometricData.push(entry);
  }
  state.biometricData.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveStateToLocalStorage();
  notify();
}

export function deleteBiometricEntry(date) {
  log('State', 'Deleting biometric entry', { date });
  state.biometricData = state.biometricData.filter(e => e.date !== date);
  saveStateToLocalStorage();
  notify();
}

export function updateWeeklyPlan(slotId, mealId) {
  log('State', 'Updating weekly plan', { slotId, mealId });
  if (mealId) {
    const meal = state.masterMealList.find(m => m.id === mealId);
    if (meal) {
      state.weeklyPlan[slotId] = { ...meal };
    }
  } else {
    delete state.weeklyPlan[slotId];
  }
  saveStateToLocalStorage();
  notify();
}

export function updateWeeklyWorkout(slotId, exerciseId, instanceId = null) {
  log('State', 'Updating weekly workout', { slotId, exerciseId, instanceId });
    if (!state.weeklyWorkouts[slotId]) {
        state.weeklyWorkouts[slotId] = [];
    }

    if (exerciseId) { // Add an exercise
        const exercise = state.masterWorkoutList.find(ex => ex.id === exerciseId);
        if (exercise) {
            const newExerciseInstance = {
                ...exercise,
                instanceId: Date.now() + Math.random()
            };
            state.weeklyWorkouts[slotId].push(newExerciseInstance);
        }
    } else if (instanceId) { // Remove an exercise
        state.weeklyWorkouts[slotId] = state.weeklyWorkouts[slotId].filter(ex => ex.instanceId !== instanceId);
        if (state.weeklyWorkouts[slotId].length === 0) {
            delete state.weeklyWorkouts[slotId];
        }
    }
    saveStateToLocalStorage();
    notify();
}

export function updateExerciseInstanceInWorkout(slotId, instanceId, newValues) {
  log('State', 'Updating exercise instance in workout', { slotId, instanceId, newValues });
    if (!state.weeklyWorkouts[slotId]) return;

    const workoutList = state.weeklyWorkouts[slotId];
    const exerciseIndex = workoutList.findIndex(ex => ex.instanceId === instanceId);

    if (exerciseIndex > -1) {
        const updatedExercise = { ...workoutList[exerciseIndex], ...newValues };
        if (newValues.defaultTempo) {
            updatedExercise.defaultTempo = { ...workoutList[exerciseIndex].defaultTempo, ...newValues.defaultTempo };
        }
        workoutList[exerciseIndex] = updatedExercise;
        saveStateToLocalStorage();
        notify();
    }
}

export function reorderWorkoutExercises(slotId, oldIndex, newIndex) {
  log('State', 'Reordering workout exercises', { slotId, oldIndex, newIndex });
    if (!state.weeklyWorkouts[slotId] || oldIndex === newIndex) return;
    const workoutList = state.weeklyWorkouts[slotId];
    const [movedItem] = workoutList.splice(oldIndex, 1);
    workoutList.splice(newIndex, 0, movedItem);
    saveStateToLocalStorage();
    notify();
}

export function resetCurrentWeek() {
  log('State', 'Resetting current week');
  const weekStart = getWeekStartDate(state.focusedDate);
  for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const isoDate = toISODateString(date);
      MEAL_TYPES.forEach(mealType => {
          const slotId = `${isoDate}-${mealType}`;
          if (state.weeklyPlan[slotId]) {
              delete state.weeklyPlan[slotId];
          }
      });
      const workoutSlotId = `${isoDate}-${WORKOUT_SLOT_ID}`;
      if (state.weeklyWorkouts[workoutSlotId]) {
          delete state.weeklyWorkouts[workoutSlotId];
      }
  }
  state.workoutHistory = {};
  saveStateToLocalStorage();
  notify();
}

export function navigateWeek(direction) {
  log('State', 'Navigating week', { direction });
  const newDate = new Date(state.focusedDate);
  newDate.setDate(newDate.getDate() + (direction * 7));
  state.focusedDate = newDate;
  notify();
}

export function setView(view) {
  log('State', 'Setting new view', { newView: view, oldView: state.currentView });
  if (['planner', 'log', 'progress', 'profile', 'charts', 'recipes', 'trainer', 'debriefing', 'goals'].includes(view)) {
    state.currentView = view;
    notify();
  }
}

export function setLastWorkoutSummary(summary) {
  log('State', 'Setting last workout summary');
  state.lastWorkoutSummary = summary;
  notify();
}

export function addWorkoutToHistory(summary) {
  log('State', 'Adding structured workout to history', { date: summary.date });
  if (summary && summary.date) {
      if (!state.workoutHistory[summary.date]) {
          state.workoutHistory[summary.date] = [];
      }
      state.workoutHistory[summary.date].push({ ...summary, type: 'structured' });
      saveStateToLocalStorage();
      notify();
  }
}

export function addManualWorkoutToHistory(date, activityData) {
    log('State', 'Adding manual workout to history', { date, activityData });
    if (!state.workoutHistory[date]) {
        state.workoutHistory[date] = [];
    }
    const manualWorkout = {
        type: 'manual',
        date: date,
        startTime: Date.now(),
        ...activityData
    };
    state.workoutHistory[date].push(manualWorkout);
    saveStateToLocalStorage();
    notify();
}

export function deleteWorkoutFromHistory(date, startTime) {
    log('State', 'Deleting workout from history', { date, startTime });
    if (state.workoutHistory[date]) {
        state.workoutHistory[date] = state.workoutHistory[date].filter(workout => workout.startTime !== startTime);
        if (state.workoutHistory[date].length === 0) {
            delete state.workoutHistory[date];
        }
        saveStateToLocalStorage();
        notify();
    }
}

export function updateWorkoutInHistory(date, startTime, updates) {
    log('State', 'Updating workout in history', { date, startTime, updates });
    if (state.workoutHistory[date]) {
        const workoutIndex = state.workoutHistory[date].findIndex(w => w.startTime === startTime);
        if (workoutIndex > -1) {
            state.workoutHistory[date][workoutIndex] = {
                ...state.workoutHistory[date][workoutIndex],
                ...updates
            };
            saveStateToLocalStorage();
            notify();
        }
    }
}

export function copyPreviousWeek() {
  log('State', 'Copying previous week');
  const currentWeekStart = getWeekStartDate(state.focusedDate);
  const prevWeekStart = new Date(currentWeekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  for (let i = 0; i < 7; i++) {
    const sourceDate = new Date(prevWeekStart);
    sourceDate.setDate(sourceDate.getDate() + i);
    const sourceISO = toISODateString(sourceDate);

    const destDate = new Date(currentWeekStart);
    destDate.setDate(destDate.getDate() + i);
    const destISO = toISODateString(destDate);

    MEAL_TYPES.forEach(mealType => {
      const sourceSlotId = `${sourceISO}-${mealType}`;
      const destSlotId = `${destISO}-${mealType}`;
      const mealObject = state.weeklyPlan[sourceSlotId];

      if (mealObject) {
        state.weeklyPlan[destSlotId] = { ...mealObject };
      } else {
        delete state.weeklyPlan[destSlotId];
      }
    });

    const sourceWorkoutSlot = `${sourceISO}-${WORKOUT_SLOT_ID}`;
    const destWorkoutSlot = `${destISO}-${WORKOUT_SLOT_ID}`;
    const workoutList = state.weeklyWorkouts[sourceWorkoutSlot];
    if (workoutList && Array.isArray(workoutList)) {
        state.weeklyWorkouts[destWorkoutSlot] = JSON.parse(JSON.stringify(workoutList));
    } else {
        delete state.weeklyWorkouts[destWorkoutSlot];
    }
  }
  saveStateToLocalStorage();
  notify();
}
