import { MEAL_TYPES, WEEK_STARTS_ON_MONDAY, DAYS, WORKOUT_SLOT_ID } from '../utils/constants.js';
import { UI_TEXT } from '../config/uiText.js';
import { renderIcon } from './icons.js';

function toISODateString(date) {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : WEEK_STARTS_ON_MONDAY);
  return new Date(d.setDate(diff));
}

function formatShortDate(date) {
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
}

function formatFullDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatMealCalories(meal) {
  if (!meal || typeof meal.calories_min !== 'number') return '';
  const minCals = Number(meal.calories_min) || 0;
  const maxCals = Number(meal.calories_max) || minCals;
  if (minCals === 0 && maxCals === 0) return '';
  const kcalLabel = UI_TEXT.KCAL_LABEL || 'Kcal';
  if (minCals === maxCals) return `${minCals} ${kcalLabel}`;
  return `${minCals} - ${maxCals} ${kcalLabel}`;
}

function calculateDailyCalories(isoDate, weeklyPlan) {
  let min = 0, max = 0;
  MEAL_TYPES.forEach(type => {
    const meal = weeklyPlan[`${isoDate}-${type}`];
    if (meal && typeof meal.calories_min === 'number') {
      const minCals = Number(meal.calories_min) || 0;
      const maxCals = Number(meal.calories_max) || minCals;
      min += minCals;
      max += maxCals;
    }
  });
  if (min === 0 && max === 0) return '';
  return min === max ? `${UI_TEXT.KCAL_LABEL}: ${min}` : `${UI_TEXT.KCAL_LABEL}: ${min} - ${max}`;
}

function getRecipeButtonHTML(meal, state) {
  const fullMeal = state.masterMealList.find(m => m.id === meal.id);
  if (state.recipeBaseUrl && fullMeal && fullMeal.recipeId) {
    return `<button class="btn-view-recipe" data-meal-id="${fullMeal.id}" title="${UI_TEXT.RECIPE_BUTTON_TITLE}">
              ${renderIcon('RECIPE', { width: 20, height: 20 })}
            </button>`;
  }
  return '';
}

function renderCalendarView(state, weekStart) {
  const calendarGrid = document.getElementById('calendar-grid');
  const todayISO = toISODateString(new Date());
  calendarGrid.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const dayName = DAYS[i];
    const isoDate = toISODateString(dayDate);
    const dailyCalories = calculateDailyCalories(isoDate, state.weeklyPlan);
    const workoutList = state.weeklyWorkouts[`${isoDate}-${WORKOUT_SLOT_ID}`];
    
    let summaryHTML = `<div class="daily-calories">${dailyCalories}</div>`;
    let workoutButtonHTML = '';

    if (workoutList && workoutList.length > 0) {
        const exerciseCount = workoutList.length;
        const plural = exerciseCount > 1 ? UI_TEXT.PLANNER_EXERCISES_MULTI_LABEL : UI_TEXT.PLANNER_EXERCISES_SINGLE_LABEL;
        summaryHTML += `<div class="daily-summary-item">${renderIcon('WEIGHT_SCALE', {width: 16, height: 16})} ${exerciseCount} ${plural}</div>`;
        workoutButtonHTML = `<button class="btn btn-primary btn-start-workout-day" data-date="${isoDate}">${UI_TEXT.START_WORKOUT_BTN}</button>`;
    }

    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    if (isoDate === todayISO) {
      dayCell.classList.add('is-today');
    }
    dayCell.dataset.date = isoDate;
    dayCell.innerHTML = `
      <div class="day-cell__header"><span>${dayName}</span><span>${dayDate.getDate()}</span></div>
      <div class="day-cell__body">${summaryHTML}${workoutButtonHTML}</div>`;
    calendarGrid.appendChild(dayCell);
  }
}

function renderLogView(state, weekStart) {
  const logView = document.getElementById('log-view');
  const todayISO = toISODateString(new Date());
  logView.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const isoDate = toISODateString(dayDate);
    const dayMeals = MEAL_TYPES.map(type => ({ type, meal: state.weeklyPlan[`${isoDate}-${type}`] })).filter(item => item.meal);
    if (dayMeals.length > 0) {
      const dayLog = document.createElement('div');
      dayLog.className = 'log-day';
       if (isoDate === todayISO) {
        dayLog.classList.add('is-today');
      }
      dayLog.innerHTML = `<h3><span>${formatFullDate(isoDate)}</span><span class="log-day__total-calories">${calculateDailyCalories(isoDate, state.weeklyPlan)}</span></h3>` 
        + dayMeals.map(item => `<div class="log-item"><div class="log-item__name"><strong>${item.type}:</strong><span>${item.meal.nomePasto}</span>${getRecipeButtonHTML(item.meal, state)}</div><span class="log-item__calories">${formatMealCalories(item.meal)}</span></div>`).join('');
      logView.appendChild(dayLog);
    }
  }
  if (logView.innerHTML === '') logView.innerHTML = `<p class="placeholder-text">${UI_TEXT.LOG_VIEW_EMPTY}</p>`;
}

export function renderPlannerPage(state) {
  const weekStart = getWeekStartDate(state.focusedDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  document.getElementById('week-title').textContent = `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;
  
  const calendarGrid = document.getElementById('calendar-grid');
  const logView = document.getElementById('log-view');
  const viewCalendarBtn = document.getElementById('view-calendar-btn');
  const viewLogBtn = document.getElementById('view-log-btn');

  if (state.currentView === 'planner') {
      calendarGrid.classList.remove('hidden');
      logView.classList.add('hidden');
      viewCalendarBtn.classList.add('active');
      viewLogBtn.classList.remove('active');
  } else if (state.currentView === 'log') {
      calendarGrid.classList.add('hidden');
      logView.classList.remove('hidden');
      viewCalendarBtn.classList.remove('active');
      viewLogBtn.classList.add('active');
  }

  renderCalendarView(state, weekStart);
  renderLogView(state, weekStart);
}
