import { LOCAL_STORAGE_KEY_PLAN, LOCAL_STORAGE_KEY_URL, MEAL_TYPES, LOCAL_STORAGE_KEY_BIOMETRICS, LOCAL_STORAGE_KEY_PROFILE } from '../utils/constants.js';

let state = {
  rules: [],
  masterMealList: [],
  weeklyPlan: {},
  biometricData: [],
  userProfile: {},
  configUrl: '',
  recipeBaseUrl: '',
  focusedDate: new Date(),
  currentView: 'planner', // 'planner', 'log', 'progress', 'charts', or 'profile'
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

export function setPlannerConfig(config) {
  state.rules = config.rules || [];
  state.masterMealList = config.meals || [];
  state.recipeBaseUrl = config.recipeBaseUrl || '';
  notify();
}

export function setConfigUrl(url) {
  state.configUrl = url;
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, url);
  notify();
}

export function saveStateToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY_PLAN, JSON.stringify(state.weeklyPlan));
  localStorage.setItem(LOCAL_STORAGE_KEY_BIOMETRICS, JSON.stringify(state.biometricData));
  localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(state.userProfile));
}

export function loadStateFromLocalStorage() {
  const plan = localStorage.getItem(LOCAL_STORAGE_KEY_PLAN);
  const url = localStorage.getItem(LOCAL_STORAGE_KEY_URL);
  const biometrics = localStorage.getItem(LOCAL_STORAGE_KEY_BIOMETRICS);
  const profile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);

  if (plan) { try { state.weeklyPlan = JSON.parse(plan); } catch (e) { console.error("Error parsing weeklyPlan", e); state.weeklyPlan = {}; } }
  if (url) { state.configUrl = url; }
  if (biometrics) { try { state.biometricData = JSON.parse(biometrics); } catch (e) { console.error("Error parsing biometricData", e); state.biometricData = []; } }
  if (profile) { try { state.userProfile = JSON.parse(profile); } catch (e) { console.error("Error parsing userProfile", e); state.userProfile = {}; } }
}

export function setAppState(backupData) {
  state.weeklyPlan = backupData.weeklyPlan || {};
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
  if (['planner', 'log', 'progress', 'profile', 'charts'].includes(view)) {
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
  }
  saveStateToLocalStorage();
  notify();
}
