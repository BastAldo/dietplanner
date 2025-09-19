import { LOCAL_STORAGE_KEY } from '../utils/constants.js';

let appState = {
  masterMealList: [],
  weeklyPlan: {}, // Es: { 'Lunedì-Pranzo': '1', 'Martedì-Cena': '3' }
};

/**
 * Emette un evento custom per notificare all'UI che lo stato è cambiato.
 */
function notifyStateChange() {
  document.dispatchEvent(new CustomEvent('stateChange'));
}

export function setMasterMealList(meals) {
  appState.masterMealList = meals;
  notifyStateChange();
}

export function updateWeeklyPlan(slotId, mealId) {
  if (mealId) {
    appState.weeklyPlan[slotId] = mealId;
  } else {
    delete appState.weeklyPlan[slotId];
  }
  saveStateToLocalStorage();
  notifyStateChange();
}

export function resetWeeklyPlan() {
  appState.weeklyPlan = {};
  saveStateToLocalStorage();
  notifyStateChange();
}

export function getState() {
  return { ...appState };
}

export function saveStateToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState.weeklyPlan));
}

export function loadStateFromLocalStorage() {
  const savedPlan = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedPlan) {
    appState.weeklyPlan = JSON.parse(savedPlan);
  }
}
