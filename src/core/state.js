import { LOCAL_STORAGE_KEY_PLAN, LOCAL_STORAGE_KEY_URL } from '../utils/constants.js';

let appState = {
  masterMealList: [],
  weeklyPlan: {},
  csvUrl: '',
};

function notifyStateChange() {
  document.dispatchEvent(new CustomEvent('stateChange'));
}

export function setMasterMealList(meals) {
  appState.masterMealList = meals;
  notifyStateChange();
}

export function updateWeeklyPlan(slotId, mealId) {
  if (mealId) { appState.weeklyPlan[slotId] = mealId; } 
  else { delete appState.weeklyPlan[slotId]; }
  saveStateToLocalStorage();
  notifyStateChange();
}

export function resetWeeklyPlan() {
  appState.weeklyPlan = {};
  saveStateToLocalStorage();
  notifyStateChange();
}

export function setCsvUrl(url) {
  appState.csvUrl = url;
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, url);
}

export function getState() { return { ...appState }; }

export function saveStateToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY_PLAN, JSON.stringify(appState.weeklyPlan));
}

export function loadStateFromLocalStorage() {
  const savedPlan = localStorage.getItem(LOCAL_STORAGE_KEY_PLAN);
  const savedUrl = localStorage.getItem(LOCAL_STORAGE_KEY_URL);
  if (savedPlan) { appState.weeklyPlan = JSON.parse(savedPlan); }
  if (savedUrl) { appState.csvUrl = savedUrl; }
}
