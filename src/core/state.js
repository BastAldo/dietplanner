import { LOCAL_STORAGE_KEY_PLAN, LOCAL_STORAGE_KEY_URL, MEAL_TYPES, LOCAL_STORAGE_KEY_BIOMETRICS, LOCAL_STORAGE_KEY_PROFILE, LOCAL_STORAGE_KEY_WORKOUTS, WORKOUT_SLOT_ID } from '../utils/constants.js';
import { processMealsWithCalories } from './calorieCalculator.js';

let state = {
  rules: [],
  masterMealList: [],
  masterWorkoutList: [],
  weeklyPlan: {},
  weeklyWorkouts: {},
  biometricData: [],
  userProfile: {},
  configUrl: '',
  recipeBaseUrl: '',
  focusedDate: new Date(),
  currentView: 'planner', // 'planner', 'log', 'progress', 'charts', 'recipes', or 'profile'
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

export function setPlannerConfig(config, url) {
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
  state.configUrl = url;
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, url);
  notify();
}

export function saveStateToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY_PLAN, JSON.stringify(state.weeklyPlan));
  localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUTS, JSON.stringify(state.weeklyWorkouts));
  localStorage.setItem(LOCAL_STORAGE_KEY_BIOMETRICS, JSON.stringify(state.biometricData));
  localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(state.userProfile));
}

export function loadStateFromLocalStorage() {
  const plan = localStorage.getItem(LOCAL_STORAGE_KEY_PLAN);
  const workouts = localStorage.getItem(LOCAL_STORAGE_KEY_WORKOUTS);
  const url = localStorage.getItem(LOCAL_STORAGE_KEY_URL);
  const biometrics = localStorage.getItem(LOCAL_STORAGE_KEY_BIOMETRICS);
  const profile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);

  if (plan) { try { state.weeklyPlan = JSON.parse(plan); } catch (e) { console.error("Error parsing weeklyPlan", e); state.weeklyPlan = {}; } }
  if (workouts) { try { state.weeklyWorkouts = JSON.parse(workouts); } catch (e) { console.error("Error parsing weeklyWorkouts", e); state.weeklyWorkouts = {}; } }
  if (url) { state.configUrl = url; }
  if (biometrics) { try { state.biometricData = JSON.parse(biometrics); } catch (e) { console.error("Error parsing biometricData", e); state.biometricData = []; } }
  if (profile) { try { state.userProfile = JSON.parse(profile); } catch (e) { console.error("Error parsing userProfile", e); state.userProfile = {}; } }
}

export function setAppState(backupData) {
  state.weeklyPlan = backupData.weeklyPlan || {};
  state.weeklyWorkouts = backupData.weeklyWorkouts || {};
  state.configUrl = backupData.configUrl || '';
  state.biometricData = backupData.biometricData || [];
  state.userProfile = backupData.userProfile || {};
  saveStateToLocalStorage();
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, state.configUrl);
  notify();
}

export function saveUserProfile(profile) {
  state.userProfile = profile;
  saveStateToLocalStorage();
  notify();
}

export function addOrUpdateBiometricEntry(entry) {
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
  state.biometricData = state.biometricData.filter(e => e.date !== date);
  saveStateToLocalStorage();
  notify();
}

export function updateWeeklyPlan(slotId, mealId) {
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
    if (!state.weeklyWorkouts[slotId]) {
        state.weeklyWorkouts[slotId] = [];
    }

    if (exerciseId) { // Add or update an exercise
        const exercise = state.masterWorkoutList.find(ex => ex.id === exerciseId);
        if (exercise) {
            const newExerciseInstance = {
                ...exercise,
                instanceId: Date.now() // Unique ID for this specific instance
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

export function resetCurrentWeek() {
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
  saveStateToLocalStorage();
  notify();
}

export function navigateWeek(direction) {
  const newDate = new Date(state.focusedDate);
  newDate.setDate(newDate.getDate() + (direction * 7));
  state.focusedDate = newDate;
  notify();
}

export function setView(view) {
  if (['planner', 'log', 'progress', 'profile', 'charts', 'recipes'].includes(view)) {
    state.currentView = view;
    notify();
  }
}

export function copyPreviousWeek() {
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
        state.weeklyWorkouts[destWorkoutSlot] = JSON.parse(JSON.stringify(workoutList)); // Deep copy
    } else {
        delete state.weeklyWorkouts[destWorkoutSlot];
    }
  }
  saveStateToLocalStorage();
  notify();
}
