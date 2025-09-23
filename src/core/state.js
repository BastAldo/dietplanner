import { LOCAL_STORAGE_KEY_PLAN, LOCAL_STORAGE_KEY_URL } from '../utils/constants.js';

let state = {
  rules: [],
  masterMealList: [],
  weeklyPlan: {},
  configUrl: '',
  focusedDate: new Date(),
  currentView: 'calendar', // 'calendar' or 'log'
};

const notify = () => document.dispatchEvent(new CustomEvent('stateChange'));
const toISODateString = (date) => date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

export const getState = () => ({ ...state });

export function setPlannerConfig(config) {
  state.rules = config.rules || [];
  state.masterMealList = config.meals || [];
  notify();
}

export function setConfigUrl(url) {
  state.configUrl = url;
  localStorage.setItem(LOCAL_STORAGE_KEY_URL, url);
}

export function saveStateToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY_PLAN, JSON.stringify(state.weeklyPlan));
}

export function loadStateFromLocalStorage() {
  const plan = localStorage.getItem(LOCAL_STORAGE_KEY_PLAN);
  const url = localStorage.getItem(LOCAL_STORAGE_KEY_URL);
  if (plan) {
    state.weeklyPlan = JSON.parse(plan);
  }
  if (url) {
    state.configUrl = url;
  }
}

export function updateWeeklyPlan(slotId, mealId) {
  if (mealId) {
    state.weeklyPlan[slotId] = mealId;
  } else {
    delete state.weeklyPlan[slotId];
  }
  saveStateToLocalStorage();
  notify();
}

export function resetWeeklyPlan() {
  state.weeklyPlan = {};
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
  if (view === 'calendar' || view === 'log') {
    state.currentView = view;
    notify();
  }
}

export function copyPreviousWeek() {
  const currentWeekStart = new Date(state.focusedDate);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Monday of current week
  
  const prevWeekStart = new Date(currentWeekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7); // Monday of previous week

  for (let i = 0; i < 7; i++) {
    const sourceDate = new Date(prevWeekStart);
    sourceDate.setDate(sourceDate.getDate() + i);
    const sourceISO = toISODateString(sourceDate);

    const destDate = new Date(currentWeekStart);
    destDate.setDate(destDate.getDate() + i);
    const destISO = toISODateString(destDate);

    // Copy each meal type
    state.masterMealList.map(m => m.tipoPasto).forEach(mealType => {
      const sourceSlotId = `${sourceISO}-${mealType}`;
      const destSlotId = `${destISO}-${mealType}`;
      const mealId = state.weeklyPlan[sourceSlotId];

      if (mealId) {
        state.weeklyPlan[destSlotId] = mealId;
      } else {
        delete state.weeklyPlan[destSlotId]; // Ensure empty slots are also copied
      }
    });
  }
  saveStateToLocalStorage();
  notify();
}
