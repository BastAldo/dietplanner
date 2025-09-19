import { LOCAL_STORAGE_KEY_PLAN, LOCAL_STORAGE_KEY_URL } from '../utils/constants.js';
let state = { rules: [], masterMealList: [], weeklyPlan: {}, configUrl: '' };
const notify = () => document.dispatchEvent(new CustomEvent('stateChange'));
export const getState = () => ({ ...state });
export function setPlannerConfig(config) {
  state.rules = config.rules || [];
  state.masterMealList = config.meals || [];
  notify();
}
export function setConfigUrl(url) { state.configUrl = url; localStorage.setItem(LOCAL_STORAGE_KEY_URL, url); }
export function saveStateToLocalStorage() { localStorage.setItem(LOCAL_STORAGE_KEY_PLAN, JSON.stringify(state.weeklyPlan)); }
export function loadStateFromLocalStorage() {
  const plan = localStorage.getItem(LOCAL_STORAGE_KEY_PLAN);
  const url = localStorage.getItem(LOCAL_STORAGE_KEY_URL);
  if (plan) { state.weeklyPlan = JSON.parse(plan); }
  if (url) { state.configUrl = url; }
}
export function updateWeeklyPlan(slotId, mealId) {
  if (mealId) { state.weeklyPlan[slotId] = mealId; } 
  else { delete state.weeklyPlan[slotId]; }
  saveStateToLocalStorage();
  notify();
}
export function resetWeeklyPlan() { state.weeklyPlan = {}; saveStateToLocalStorage(); notify(); }
