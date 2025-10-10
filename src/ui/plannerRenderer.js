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

function getSetDetails(setData) {
    let details = [];
    if (setData.reps) details.push(`${setData.reps} reps`);
    if (setData.weight) details.push(`${setData.weight} kg`);
    if (setData.duration) details.push(`${formatDuration(setData.duration)}`);
    return details.join(' / ');
}

function formatDuration(ms) {
    if (typeof ms !== 'number' || ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function renderPlannerSummaryWidget(state, weekStart) {
  const widgetContainer = document.getElementById('planner-summary-widget');
  const { userGoals, biometricData, workoutHistory } = state;
  let totalCaloriesConsumed = 0;
  let dayCount = 0;
  let completedWorkouts = 0;
  let totalCaloriesBurned = 0;

  for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const isoDate = toISODateString(dayDate);

      let dailyMin = 0;
      let hasMeals = false;
      MEAL_TYPES.forEach(type => {
          const meal = state.weeklyPlan[`${isoDate}-${type}`];
          if (meal) {
              dailyMin += Number(meal.calories_min) || 0;
              hasMeals = true;
          }
      });

      if (hasMeals) {
          totalCaloriesConsumed += dailyMin;
          dayCount++;
      }

      if (workoutHistory[isoDate]) {
          completedWorkouts += workoutHistory[isoDate].length;
          workoutHistory[isoDate].forEach(workout => {
              totalCaloriesBurned += workout.totalCaloriesBurned || 0;
          });
      }
  }

  const avgCalories = dayCount > 0 ? Math.round(totalCaloriesConsumed / dayCount) : 0;
  const calGoal = userGoals.avg_calories || 0;
  const workoutGoal = userGoals.num_workouts || 0;
  const weightGoal = userGoals.target_weight || 0;
  const latestWeight = biometricData.length > 0 ? biometricData[0].weight : 0;
  const kgToGoal = (latestWeight && weightGoal) ? (latestWeight - weightGoal).toFixed(1) : 0;

  let weightProgressHTML = '';
  if (latestWeight > 0 && weightGoal > 0) {
      weightProgressHTML = `
      <div class="planner-summary-stat">
          <div class="stat-icon">${renderIcon('GOAL', {width: 20, height: 20})}</div>
          <div>
              <span class="stat-value">${kgToGoal} kg</span>
              <span class="stat-label">${UI_TEXT.PLANNER_SUMMARY_WEIGHT_PROGRESS}</span>
          </div>
      </div>`;
  }

  widgetContainer.innerHTML = `
      <h3 class="planner-summary-title">${UI_TEXT.PLANNER_SUMMARY_TITLE}</h3>
      <div class="planner-summary-stats">
          <div class="planner-summary-stat">
              <div class="stat-icon">${renderIcon('PLANNER', {width: 20, height: 20})}</div>
              <div>
                  <span class="stat-value">${avgCalories} ${calGoal > 0 ? `/ ${calGoal}`: ''}</span>
                  <span class="stat-label">${UI_TEXT.PLANNER_SUMMARY_AVG_KCAL}</span>
              </div>
          </div>
          <div class="planner-summary-stat">
              <div class="stat-icon">${renderIcon('WEIGHT_SCALE', {width: 20, height: 20})}</div>
              <div>
                  <span class="stat-value">${completedWorkouts} ${workoutGoal > 0 ? `/ ${workoutGoal}`: ''}</span>
                  <span class="stat-label">${UI_TEXT.PLANNER_SUMMARY_WORKOUTS}</span>
              </div>
          </div>
          <div class="planner-summary-stat">
              <div class="stat-icon">${renderIcon('BAR_CHART', {width: 20, height: 20})}</div>
              <div>
                  <span class="stat-value">${Math.round(totalCaloriesBurned)}</span>
                  <span class="stat-label">${UI_TEXT.PLANNER_SUMMARY_CALORIES_BURNED}</span>
              </div>
          </div>
          ${weightProgressHTML}
      </div>
  `;
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
  let logViewHTML = '';
  let hasContent = false;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const isoDate = toISODateString(dayDate);
    const dayMeals = MEAL_TYPES.map(type => ({ type, meal: state.weeklyPlan[`${isoDate}-${type}`] })).filter(item => item.meal);
    const completedWorkouts = state.workoutHistory[isoDate] || [];

    if (dayMeals.length > 0 || completedWorkouts.length > 0) {
      hasContent = true;
      let dayLogHTML = `<div class="log-day ${isoDate === todayISO ? 'is-today' : ''}">`;
      dayLogHTML += `<h3><span>${formatFullDate(isoDate)}</span><span class="log-day__total-calories">${calculateDailyCalories(isoDate, state.weeklyPlan)}</span></h3>`;

      if (dayMeals.length > 0) {
        dayLogHTML += dayMeals.map(item => `<div class="log-item"><div class="log-item__name"><strong>${item.type}:</strong><span>${item.meal.nomePasto}</span>${getRecipeButtonHTML(item.meal, state)}</div><span class="log-item__calories">${formatMealCalories(item.meal)}</span></div>`).join('');
      }

      if (completedWorkouts.length > 0) {
          completedWorkouts.forEach(workout => {
              if (workout.type === 'structured') {
                  dayLogHTML += `<div class="log-workout-summary">
                      <div class="log-workout-header">
                          <h4>${UI_TEXT.LOG_VIEW_WORKOUT_TITLE}</h4>
                          <div class="log-workout-header-actions">
                              <button class="btn-delete-workout" data-date="${workout.date}" data-starttime="${workout.startTime}" title="Elimina Allenamento">${renderIcon('TRASH')}</button>
                          </div>
                      </div>
                      <div class="log-workout-stats">
                          <span>Durata: ${formatDuration(workout.totalTime)}</span>
                          ${workout.totalCaloriesBurned > 0 ? `<span>/</span><span>Kcal: ${workout.totalCaloriesBurned}</span>` : ''}
                          ${workout.totalTonnage > 0 ? `<span>/</span><span>Volume: ${workout.totalTonnage} kg</span>` : ''}
                          ${workout.rpe ? `<span>/</span><span>RPE: ${workout.rpe}</span>` : ''}
                      </div>
                      ${workout.exercises.map(ex => `
                      <div class="log-workout-exercise">
                          <div class="log-item">
                            <strong>${ex.name}</strong>
                            <div class="log-workout-header-actions">
                              <button class="btn-edit-logged-exercise" data-date="${workout.date}" data-starttime="${workout.startTime}" data-instanceid="${ex.instanceId}" title="Modifica Esercizio">${renderIcon('EDIT')}</button>
                            </div>
                          </div>
                          <div class="log-sets-details">
                          ${ex.setsData.map((setData, i) => `
                              <div class="log-set-item">
                              <span>Serie ${i + 1}</span>
                              <span>${getSetDetails(setData)}</span>
                              </div>
                          `).join('')}
                          </div>
                      </div>
                      `).join('')}
                  </div>`;
              } else if (workout.type === 'manual') {
                  let detailsHTML = '';
                  if (workout.distance) detailsHTML += `<div><strong>Distanza:</strong> ${workout.distance} km</div>`;
                  if (workout.fc_avg) detailsHTML += `<div><strong>FC Media:</strong> ${workout.fc_avg} bpm</div>`;
                  if (workout.fc_max) detailsHTML += `<div><strong>FC Max:</strong> ${workout.fc_max} bpm</div>`;
                  if (workout.notes) detailsHTML += `<div class="log-item-details">${workout.notes.replace(/\n/g, '<br>')}</div>`;

                  dayLogHTML += `<div class="log-workout-summary">
                      <div class="log-workout-header">
                          <h4>${UI_TEXT.LOG_VIEW_MANUAL_ACTIVITY_TITLE}</h4>
                          <div class="log-workout-header-actions">
                            <button class="btn-delete-workout" data-date="${workout.date}" data-starttime="${workout.startTime}" title="Elimina Allenamento">${renderIcon('TRASH')}</button>
                          </div>
                      </div>
                      <div class="log-item">
                          <strong>${workout.name}</strong>
                          <span>${workout.duration || ''}</span>
                      </div>
                      ${detailsHTML ? `<div class="log-manual-details">${detailsHTML}</div>` : ''}
                  </div>`;
              }
          });
      }

      dayLogHTML += `</div>`;
      logViewHTML += dayLogHTML;
    }
  }

  if (!hasContent) {
    logView.innerHTML = `<p class="placeholder-text">${UI_TEXT.LOG_VIEW_EMPTY}</p>`;
  } else {
    logView.innerHTML = logViewHTML;
  }
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
  const { currentView } = state.ui;

  if (currentView === 'planner' || currentView === 'log') {
      renderPlannerSummaryWidget(state, weekStart);
  }

  if (currentView === 'planner') {
      calendarGrid.classList.remove('hidden');
      logView.classList.add('hidden');
      viewCalendarBtn.classList.add('active');
      viewLogBtn.classList.remove('active');
  } else if (currentView === 'log') {
      calendarGrid.classList.add('hidden');
      logView.classList.remove('hidden');
      viewCalendarBtn.classList.remove('active');
      viewLogBtn.classList.add('active');
  }

  renderCalendarView(state, weekStart);
  renderLogView(state, weekStart);
}
