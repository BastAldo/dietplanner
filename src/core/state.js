import { LOCAL_STORAGE_KEY_PLAN, LOCAL_STORAGE_KEY_URL, MEAL_TYPES, LOCAL_STORAGE_KEY_BIOMETRICS, LOCAL_STORAGE_KEY_PROFILE, LOCAL_STORAGE_KEY_WORKOUTS, WORKOUT_SLOT_ID, LOCAL_STORAGE_KEY_WORKOUT_HISTORY, LOCAL_STORAGE_KEY_GOALS, LOCAL_STORAGE_KEY_INGREDIENTS, LOCAL_STORAGE_KEY_MEALS, LOCAL_STORAGE_KEY_WORKOUT_TEMPLATES } from '../utils/constants.js';
import { processMealsWithCalories } from './calorieCalculator.js';
import { resetWorkoutState } from './trainer.js';
import { log } from '../utils/logger.js';

let state = {
  rules: [],
  masterMealList: [],
  masterIngredientList: [],
  masterWorkoutList: [],
  masterWorkoutTemplateList: [],
  weeklyPlan: {},
  weeklyWorkouts: {},
  workoutHistory: {},
  biometricData: [],
  userProfile: {},
  userGoals: {},
  contentHubUrl: 'https://itbiohackerhub-max.github.io/BiohackerHub/',
  recipeBaseUrl: '',
  focusedDate: new Date(),
  debugMode: false,
  ui: {
    currentView: 'planner', // 'planner', 'log', 'library', 'progress', 'charts', 'recipes', 'profile', 'trainer', 'debriefing', 'goals', 'explore'
    activeLibraryTab: 'ingredients',
    librarySearchTerm: '',
    libraryActiveFilter: null,
    lastWorkoutSummary: null,
    charts: {
      currentRangeFilter: 30,
      dateOffset: 0,
      selectedBiometric: 'weight',
      plannerChartType: 'bar'
    },
    explore: {
      packages: [],
      searchTerm: '',
      activeTags: [],
      sortOrder: 'default'
    }
  }
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
export const setState = (newState) => {
  state = { ...state, ...newState };
  notify();
}
export const setUiState = (uiChanges) => {
  state.ui = { ...state.ui, ...uiChanges };
  notify();
}

export function getPackageTags() {
  const allTags = state.masterMealList.flatMap(meal => meal.etichette || []);
  const pkgTags = allTags.filter(tag => tag && tag.startsWith('pkg:'));
  return [...new Set(pkgTags)];
}

export function getMealsForType(mealType) {
  return state.masterMealList.filter(meal => {
    if (meal.tipoPasto === 'Tutti') return true;
    if (Array.isArray(meal.tipoPasto)) {
      return meal.tipoPasto.includes(mealType);
    }
    return meal.tipoPasto === mealType;
  });
}

export function getExerciseForPlanner(slotId, instanceId) {
  const workoutList = state.weeklyWorkouts[slotId] || [];
  return workoutList.find(ex => ex.instanceId === parseFloat(instanceId));
}

export function getExerciseFromHistory(date, startTime, instanceId) {
  const workout = state.workoutHistory[date]?.find(w => w.startTime === startTime);
  if (!workout) return null;
  return workout.exercises.find(ex => ex.instanceId === parseFloat(instanceId));
}

export function toggleDebugMode() {
  state.debugMode = !state.debugMode;
  console.log(`%cDebug mode is now ${state.debugMode ? 'ON' : 'OFF'}`, 'color: white; background-color: #ef5350; padding: 4px; border-radius: 4px;');
}

export function setPlannerConfig(config, sourceId) {
  log('State', 'Merging new planner config', { sourceId });
  state.rules = config.rules || [];
  const ingredients = config.ingredienti || [];
  const meals = config.meals || [];
  state.masterWorkoutList = config.esercizi || [];

  ingredients.forEach(ing => {
    if (!state.masterIngredientList.some(existing => existing.id === ing.id)) {
      state.masterIngredientList.push(ing);
    }
  });

  const packageTag = sourceId ? `pkg:${sourceId}` : null; // Create tag

  meals.forEach(meal => {
    if (!state.masterMealList.some(existing => existing.id === meal.id)) {
      if (packageTag) { // Add tag if new and from a package
        meal.etichette = [...(meal.etichette || []), packageTag];
      }
      state.masterMealList.push(meal);
    }
  });

  state.masterMealList = processMealsWithCalories(state.masterMealList, state.masterIngredientList);
  saveStateToLocalStorage();
  notify();
}

export function setContentHubUrl(url) {
  log('State', 'Setting new Content Hub URL', { url });
  state.contentHubUrl = url;
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, url);
  notify();
}

export function saveStateToLocalStorage() {
  log('State', 'Saving all application state to localStorage');
  localStorage.setItem(LOCAL_STORAGE_KEY_PLAN, JSON.stringify(state.weeklyPlan));
  localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUTS, JSON.stringify(state.weeklyWorkouts));
  localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUT_HISTORY, JSON.stringify(state.workoutHistory));
  localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUT_TEMPLATES, JSON.stringify(state.masterWorkoutTemplateList));
  localStorage.setItem(LOCAL_STORAGE_KEY_BIOMETRICS, JSON.stringify(state.biometricData));
  localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(state.userProfile));
  localStorage.setItem(LOCAL_STORAGE_KEY_GOALS, JSON.stringify(state.userGoals));
  localStorage.setItem(LOCAL_STORAGE_KEY_INGREDIENTS, JSON.stringify(state.masterIngredientList));
  localStorage.setItem(LOCAL_STORAGE_KEY_MEALS, JSON.stringify(state.masterMealList));
}

export function loadStateFromLocalStorage() {
  log('State', 'Loading all application state from localStorage');
  const plan = localStorage.getItem(LOCAL_STORAGE_KEY_PLAN);
  const workouts = localStorage.getItem(LOCAL_STORAGE_KEY_WORKOUTS);
  const history = localStorage.getItem(LOCAL_STORAGE_KEY_WORKOUT_HISTORY);
  const templates = localStorage.getItem(LOCAL_STORAGE_KEY_WORKOUT_TEMPLATES);
  let url = localStorage.getItem(LOCAL_STORAGE_KEY_URL);
  const biometrics = localStorage.getItem(LOCAL_STORAGE_KEY_BIOMETRICS);
  const profile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
  const goals = localStorage.getItem(LOCAL_STORAGE_KEY_GOALS);
  const ingredients = localStorage.getItem(LOCAL_STORAGE_KEY_INGREDIENTS);
  const meals = localStorage.getItem(LOCAL_STORAGE_KEY_MEALS);

  if (url) {
      // Migration for existing users with the old, incorrect URL without the repo name
      if (url === 'https://itbiohackerhub-max.github.io/') {
          log('State', 'Migrating incorrect legacy hub URL.');
          url = 'https://itbiohackerhub-max.github.io/BiohackerHub/';
          localStorage.setItem(LOCAL_STORAGE_KEY_URL, url); // Correct it for the future
      }
      state.contentHubUrl = url;
  }

  if (plan) { try { state.weeklyPlan = JSON.parse(plan); } catch (e) { console.error("Error parsing weeklyPlan", e); state.weeklyPlan = {}; } }
  if (workouts) { try { state.weeklyWorkouts = JSON.parse(workouts); } catch (e) { console.error("Error parsing weeklyWorkouts", e); state.weeklyWorkouts = {}; } }
  if (history) { try { state.workoutHistory = JSON.parse(history); } catch (e) { console.error("Error parsing workoutHistory", e); state.workoutHistory = {}; } }
  if (templates) { try { state.masterWorkoutTemplateList = JSON.parse(templates); } catch (e) { console.error("Error parsing masterWorkoutTemplateList", e); state.masterWorkoutTemplateList = []; } }
  if (biometrics) { try { state.biometricData = JSON.parse(biometrics); } catch (e) { console.error("Error parsing biometricData", e); state.biometricData = []; } }
  if (profile) { try { state.userProfile = JSON.parse(profile); } catch (e) { console.error("Error parsing userProfile", e); state.userProfile = {}; } }
  if (goals) { try { state.userGoals = JSON.parse(goals); } catch (e) { console.error("Error parsing userGoals", e); state.userGoals = {}; } }
  if (ingredients) { try { state.masterIngredientList = JSON.parse(ingredients); } catch (e) { console.error("Error parsing masterIngredientList", e); state.masterIngredientList = []; } }
  if (meals) { try { state.masterMealList = JSON.parse(meals); } catch (e) { console.error("Error parsing masterMealList", e); state.masterMealList = []; } }
}

export function setAppState(backupData) {
  log('State', 'Restoring application state from backup');
  state.weeklyPlan = backupData.weeklyPlan || {};
  state.weeklyWorkouts = backupData.weeklyWorkouts || {};
  state.workoutHistory = backupData.workoutHistory || {};
  state.masterWorkoutTemplateList = backupData.masterWorkoutTemplateList || [];
  state.contentHubUrl = backupData.contentHubUrl || 'https://itbiohackerhub-max.github.io/BiohackerHub/';
  state.biometricData = backupData.biometricData || [];
  state.userProfile = backupData.userProfile || {};
  state.userGoals = backupData.userGoals || {};
  state.masterIngredientList = backupData.masterIngredientList || [];
  state.masterMealList = backupData.masterMealList || [];
  saveStateToLocalStorage();
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, state.contentHubUrl);
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

export function addMultipleBiometricEntries(newEntries) {
  log('State', 'Adding multiple biometric entries', { count: newEntries.length });
  state.biometricData = [...state.biometricData, ...newEntries];
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

export function addIngredient(ingredientData) {
  log('State', 'Adding new ingredient', { ingredientData });
  state.masterIngredientList.push(ingredientData);
  state.masterIngredientList.sort((a, b) => a.nome.localeCompare(b.nome));
  saveStateToLocalStorage();
  notify();
}

export function updateIngredient(ingredientId, updatedData) {
  log('State', 'Updating ingredient', { ingredientId, updatedData });
  const index = state.masterIngredientList.findIndex(ing => ing.id === ingredientId);
  if (index > -1) {
    state.masterIngredientList[index] = { ...state.masterIngredientList[index], ...updatedData };
    state.masterIngredientList.sort((a, b) => a.nome.localeCompare(b.nome));
    saveStateToLocalStorage();
    notify();
  }
}

export function deleteIngredient(ingredientId) {
  log('State', 'Deleting ingredient', { ingredientId });
  state.masterIngredientList = state.masterIngredientList.filter(ing => ing.id !== ingredientId);
  saveStateToLocalStorage();
  notify();
}

export function addMeal(mealData) {
  log('State', 'Adding new meal', { mealData });
  state.masterMealList.push(mealData);
  state.masterMealList = processMealsWithCalories(state.masterMealList, state.masterIngredientList);
  state.masterMealList.sort((a,b) => a.nomePasto.localeCompare(b.nomePasto));
  saveStateToLocalStorage();
  notify();
}

export function updateMeal(mealId, updatedData) {
  log('State', 'Updating meal', { mealId, updatedData });
  const index = state.masterMealList.findIndex(m => m.id === mealId);
  if (index > -1) {
    state.masterMealList[index] = { ...state.masterMealList[index], ...updatedData };
    state.masterMealList = processMealsWithCalories(state.masterMealList, state.masterIngredientList);
    state.masterMealList.sort((a,b) => a.nomePasto.localeCompare(b.nomePasto));
    saveStateToLocalStorage();
    notify();
  }
}

export function deleteMeal(mealId) {
  log('State', 'Deleting meal', { mealId });
  state.masterMealList = state.masterMealList.filter(m => m.id !== mealId);
  saveStateToLocalStorage();
  notify();
}

export function addWorkoutTemplate(templateName, exercises) {
  log('State', 'Adding new workout template', { templateName });
  const newTemplate = {
    id: Date.now() + Math.random(),
    name: templateName,
    exercises: JSON.parse(JSON.stringify(exercises)) // Deep copy
  };
  state.masterWorkoutTemplateList.push(newTemplate);
  state.masterWorkoutTemplateList.sort((a, b) => a.name.localeCompare(b.name));
  saveStateToLocalStorage();
  notify();
}

export function deleteWorkoutTemplate(templateId) {
  log('State', 'Deleting workout template', { templateId });
  state.masterWorkoutTemplateList = state.masterWorkoutTemplateList.filter(t => t.id !== templateId);
  saveStateToLocalStorage();
  notify();
}

export function addWorkoutTemplateToDay(slotId, templateId) {
  log('State', 'Adding workout template to day', { slotId, templateId });
  const template = state.masterWorkoutTemplateList.find(t => t.id === templateId);
  if (!template) return;

  // Deep copy exercises from template to ensure unique instanceIds
  const exercisesToAdd = JSON.parse(JSON.stringify(template.exercises));
  
  // Ensure new instanceIds for all exercises being added
  exercisesToAdd.forEach(ex => {
    ex.instanceId = Date.now() + Math.random();
  });

  if (!state.weeklyWorkouts[slotId]) {
      state.weeklyWorkouts[slotId] = [];
  }
  
  state.weeklyWorkouts[slotId] = [...state.weeklyWorkouts[slotId], ...exercisesToAdd];
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

    if (exerciseId) {
        const exercise = state.masterWorkoutList.find(ex => ex.id === exerciseId);
        if (exercise) {
            const newExerciseInstance = { ...exercise, instanceId: Date.now() + Math.random() };
            state.weeklyWorkouts[slotId].push(newExerciseInstance);
        }
    } else if (instanceId) {
        state.weeklyWorkouts[slotId] = state.weeklyWorkouts[slotId].filter(ex => ex.instanceId !== instanceId);
        if (state.weeklyWorkouts[slotId].length === 0) {
            delete state.weeklyWorkouts[slotId];
        }
    }
    saveStateToLocalStorage();
    notify();
}

export function clearWeeklyWorkout(slotId) {
  log('State', 'Clearing weekly workout', { slotId });
  if (state.weeklyWorkouts[slotId]) {
    delete state.weeklyWorkouts[slotId];
    saveStateToLocalStorage();
    notify();
  }
}

export function updateExerciseInstanceInWorkout(slotId, instanceId, newValues) {
  log('State', 'Updating exercise instance in planner', { slotId, instanceId, newValues });
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

      if (state.workoutHistory[isoDate]) {
          delete state.workoutHistory[isoDate];
      }
  }
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
  log('State', 'Setting new view', { newView: view, oldView: state.ui.currentView });
  if (['planner', 'log', 'library', 'progress', 'profile', 'charts', 'recipes', 'trainer', 'debriefing', 'goals', 'explore'].includes(view)) {
    state.ui.currentView = view;
    notify();
  }
}

export function setLastWorkoutSummary(summary) {
  log('State', 'Setting last workout summary');
  state.ui.lastWorkoutSummary = summary;
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

export function updateExerciseSetsInHistory(date, startTime, exerciseInstanceId, newSetsData) {
  log('State', 'Updating exercise sets in history', { date, startTime, exerciseInstanceId });
  if (!state.workoutHistory[date]) return;

  const workoutIndex = state.workoutHistory[date].findIndex(w => w.startTime === startTime);
  if (workoutIndex === -1) return;

  const workout = state.workoutHistory[date][workoutIndex];
  const exerciseIndex = workout.exercises.findIndex(ex => ex.instanceId === exerciseInstanceId);
  if (exerciseIndex === -1) return;

  workout.exercises[exerciseIndex].setsData = newSetsData;
  const exerciseTonnage = newSetsData.reduce((acc, set) => acc + ((set.reps || 0) * (set.weight || 0)), 0);
  workout.exercises[exerciseIndex].tonnage = exerciseTonnage;
  workout.totalTonnage = workout.exercises.reduce((acc, ex) => acc + (ex.tonnage || 0), 0);
  saveStateToLocalStorage();
  notify();
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
