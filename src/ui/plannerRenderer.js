import { MEAL_TYPES, UI_TEXT, WEEK_STARTS_ON_MONDAY, DAYS } from '../utils/constants.js';

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
  if (!meal || !meal.calories_min) return '';
  const minCals = Number(meal.calories_min) || 0;
  const maxCals = Number(meal.calories_max) || minCals;
  if (minCals === 0) return '';
  const kcalLabel = UI_TEXT.KCAL_LABEL || 'Kcal';
  if (minCals === maxCals) return `${minCals} ${kcalLabel}`;
  return `${minCals} - ${maxCals} ${kcalLabel}`;
}

function calculateDailyCalories(isoDate, weeklyPlan) {
  let min = 0, max = 0;
  MEAL_TYPES.forEach(type => {
    const meal = weeklyPlan[`${isoDate}-${type}`];
    if (meal && meal.calories_min) {
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
  if (state.recipeBaseUrl && meal && meal.recipeId) {
    return `<button class="btn-view-recipe" data-meal-id="${meal.id}" title="${UI_TEXT.RECIPE_BUTTON_TITLE}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h7v14H4zm9 0V5h7l.001 14H13z"></path><path d="M9 7h2v2H9z"></path></svg>
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
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    if (isoDate === todayISO) {
      dayCell.classList.add('is-today');
    }
    dayCell.dataset.date = isoDate;
    dayCell.innerHTML = `<div class="day-cell__header"><span>${dayName}</span><span>${dayDate.getDate()}</span></div><div class="day-cell__body"><div class="daily-calories">${dailyCalories}</div></div>`;
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
