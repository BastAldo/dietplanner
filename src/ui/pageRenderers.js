import { calculateBMR } from '../core/calculations.js';
import { BIOMETRIC_FIELDS, PROFILE_FIELDS } from '../config/forms.js';
import { UI_TEXT } from '../config/uiText.js';
import { renderIcon } from './icons.js';
import { renderCharts } from './charts.js';
import { formatIngredients } from '../utils/formatters.js';

function toISODateString(date) {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

function formatReadableDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDuration(ms) {
    if (typeof ms !== 'number' || ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function renderBiometricsPage(state) {
  const form = document.getElementById('biometrics-form');
  const listContainer = document.getElementById('biometrics-list');
  document.getElementById('import-csv-btn').textContent = UI_TEXT.IMPORT_BIOMETRICS_BTN;

  form.innerHTML = `${BIOMETRIC_FIELDS.map(field => `<div class="form-group"><label for="bio-${field.id}">${field.label}</label>${field.type === 'textarea' ? `<textarea id="bio-${field.id}" name="${field.id}"></textarea>` : `<input type="${field.type}" id="bio-${field.id}" name="${field.id}" ${field.props || ''} ${field.id === 'date' ? `value="${toISODateString(new Date())}"` : ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.BIOMETRICS_SAVE_BTN}</button><button type="reset" class="btn btn-secondary">${UI_TEXT.BIOMETRICS_CLEAR_BTN}</button></div>`;

  if (state.biometricData.length > 0) {
      listContainer.innerHTML = state.biometricData.map(entry => {
          const fieldsHTML = BIOMETRIC_FIELDS.filter(field => field.id !== 'date' && entry[field.id])
              .map(field => `
                  <div class="biometric-card__item ${field.id === 'notes' ? 'biometric-card__notes' : ''}">
                      <span class="biometric-card__label">${field.label}</span>
                      <span class="biometric-card__value">${entry[field.id]}</span>
                  </div>
              `).join('');

          return `
              <div class="biometric-card" data-date="${entry.date}">
                  <div class="biometric-card__header">
                      <span class="biometric-card__date">${formatReadableDate(entry.date)}</span>
                      <div class="biometrics-actions">
                          <button class="btn-actions-menu" data-date="${entry.date}" title="${UI_TEXT.BIOMETRICS_ACTIONS_TITLE}">
                              ${renderIcon('KEBAB_MENU', { width: 24, height: 24 })}
                          </button>
                          <div class="actions-dropdown">
                              <button class="btn-edit-biometrics" data-date="${entry.date}">${UI_TEXT.BIOMETRICS_EDIT_BTN}</button>
                              <button class="btn-delete-biometrics delete" data-date="${entry.date}">${UI_TEXT.BIOMETRICS_DELETE_BTN}</button>
                          </div>
                      </div>
                  </div>
                  <div class="biometric-card__body">
                      ${fieldsHTML}
                  </div>
              </div>`;
      }).join('');
  } else {
      listContainer.innerHTML = `<p class="placeholder-text">${UI_TEXT.BIOMETRICS_EMPTY_LIST}</p>`;
  }

  const weightInput = form.elements.weight;
  const bmrInput = form.elements.basalMetabolism;
  const weightForCalc = weightInput.value || (state.biometricData.length > 0 ? state.biometricData[0].weight : null);

  const bmr = calculateBMR(state.userProfile, weightForCalc);
  if (bmr !== null) {
    bmrInput.value = bmr;
  } else {
    bmrInput.placeholder = UI_TEXT.BIOMETRICS_BMR_PLACEHOLDER;
  }
}

export function renderProfilePage(state) {
  const form = document.getElementById('profile-form');
  form.innerHTML = `${PROFILE_FIELDS.map(field => `<div class="form-group">${field.type === 'radio' ? `<fieldset><legend>${field.label}</legend>${field.options.map(opt => `<label><input type="radio" name="${field.id}" value="${opt.value}" ${state.userProfile[field.id] === opt.value ? 'checked' : ''}> ${opt.label}</label>`).join('')}</fieldset>` : `<label for="prof-${field.id}">${field.label}</label><input type="${field.type}" id="prof-${field.id}" name="${field.id}" value="${state.userProfile[field.id] || ''}" ${field.props || ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.PROFILE_SAVE_BTN}</button></div>`;
}

export function renderGoalsPage(state) {
    const form = document.getElementById('goals-form');
    document.getElementById('goals-title').textContent = UI_TEXT.GOALS_TITLE;
    document.getElementById('goals-explanation-text').textContent = UI_TEXT.GOALS_EXPLANATION;
    document.getElementById('goals-activity-legend').textContent = UI_TEXT.GOALS_ACTIVITY_LEGEND;
    document.getElementById('goals-biometrics-legend').textContent = UI_TEXT.GOALS_BIOMETRICS_LEGEND;
    document.getElementById('goal-calories-label').textContent = UI_TEXT.GOAL_CALORIES_LABEL;
    document.getElementById('goal-workouts-label').textContent = UI_TEXT.GOAL_WORKOUTS_LABEL;
    document.getElementById('goal-weight-label').textContent = UI_TEXT.GOAL_WEIGHT_LABEL;
    document.getElementById('goals-save-btn').textContent = UI_TEXT.GOALS_SAVE_BTN;
    form.elements.avg_calories.value = state.userGoals.avg_calories || '';
    form.elements.num_workouts.value = state.userGoals.num_workouts || '';
    form.elements.target_weight.value = state.userGoals.target_weight || '';
}

export function renderChartsPage(state) {
    const placeholder = document.getElementById('biometrics-chart-placeholder');
    const canvas = document.getElementById('biometrics-chart-canvas');
    if (state.biometricData.length < 2) {
        placeholder.textContent = UI_TEXT.BIOMETRICS_CHART_EMPTY;
        placeholder.classList.remove('hidden');
        canvas.classList.add('hidden');
    } else {
        placeholder.classList.add('hidden');
        canvas.classList.remove('hidden');
    }
    renderCharts(state);
}

function getSetDetails(setData) {
    let details = [];
    if (setData.reps) {
        details.push(`${setData.reps} reps`);
    }
    if (setData.weight) {
        details.push(`${setData.weight} kg`);
    }
    if (setData.duration) {
        details.push(`${formatDuration(setData.duration)}`);
    }
    return details.join(' / ');
}

export function renderDebriefingPage(state) {
  const summaryContainer = document.getElementById('debriefing-summary');
  const statsContainer = document.getElementById('debriefing-stats');
  const summary = state.lastWorkoutSummary;

  if (!summary || !summary.exercises) {
      summaryContainer.innerHTML = `<p class="placeholder-text">${UI_TEXT.DEBRIEFING_NO_SUMMARY}</p>`;
      statsContainer.innerHTML = '';
      document.getElementById('debriefing-feedback').classList.add('hidden');
      return;
  }

  document.getElementById('debriefing-feedback').classList.remove('hidden');
  document.getElementById('debriefing-stats-title').textContent = UI_TEXT.DEBRIEFING_STATS_TITLE;
  document.getElementById('debriefing-rpe-label').textContent = UI_TEXT.DEBRIEFING_RPE_LABEL;
  document.getElementById('save-rpe-btn').textContent = UI_TEXT.DEBRIEFING_SAVE_RPE_BTN;
  document.getElementById('speak-summary-btn').innerHTML = renderIcon('SPEAKER', {width: 24, height: 24});

  const caloriesBurnedHTML = summary.totalCaloriesBurned > 0 ? `
      <div class="stat-item">
          <span class="stat-label">${UI_TEXT.DEBRIEFING_CALORIES_BURNED}</span>
          <span class="stat-value">${summary.totalCaloriesBurned}</span>
      </div>
  ` : '';

  const tonnageHTML = summary.totalTonnage > 0 ? `
      <div class="stat-item">
          <span class="stat-label">${UI_TEXT.DEBRIEFING_TONNAGE}</span>
          <span class="stat-value">${summary.totalTonnage} kg</span>
      </div>
  ` : '';

  const statsHTML = `
      <div class="stat-item">
          <span class="stat-label">${UI_TEXT.DEBRIEFING_TOTAL_TIME}</span>
          <span class="stat-value">${formatDuration(summary.totalTime)}</span>
      </div>
      <div class="stat-item">
          <span class="stat-label">${UI_TEXT.DEBRIEFING_EXERCISE_TIME}</span>
          <span class="stat-value">${formatDuration(summary.totalExerciseTime)}</span>
      </div>
      <div class="stat-item">
          <span class="stat-label">${UI_TEXT.DEBRIEFING_REST_TIME}</span>
          <span class="stat-value">${formatDuration(summary.totalRestTime)}</span>
      </div>
      ${caloriesBurnedHTML}
      ${tonnageHTML}
  `;
  statsContainer.innerHTML = statsHTML;

  const summaryHTML = summary.exercises.map(exercise => {
      const isCompleted = exercise.setsCompleted === exercise.defaultSets;
      const setsDetailsHTML = exercise.setsData.map((setData, i) => `
          <div class="set-detail-item">
              <span>${UI_TEXT.DEBRIEFING_SET_LABEL} ${i + 1}</span>
              <span>${getSetDetails(setData)}</span>
          </div>
      `).join('');

      return `
          <div class="debriefing-card ${isCompleted ? 'completed' : 'incomplete'}">
              <div class="debriefing-card-header">
                  <h4>${exercise.name}</h4>
                  <div class="debriefing-status">
                      ${isCompleted ? UI_TEXT.DEBRIEFING_COMPLETED : UI_TEXT.DEBRIEFING_INCOMPLETE}
                  </div>
              </div>
              <div class="debriefing-card-body">
                <div class="exercise-stats">
                  <span class="exercise-stat-item">${UI_TEXT.DEBRIEFING_SETS_COMPLETED}: ${exercise.setsCompleted}/${exercise.defaultSets}</span>
                  <span class="exercise-stat-item">${UI_TEXT.DEBRIEFING_TOTAL_TIME}: ${formatDuration(exercise.totalTime)}</span>
                </div>
                <div class="sets-details-container">
                    ${setsDetailsHTML}
                </div>
              </div>
          </div>
      `;
  }).join('');

  summaryContainer.innerHTML = summaryHTML;
}

export function renderRecipesPage(state) {
  const recipesList = document.getElementById('recipes-list');
  const recipes = state.masterMealList.filter(meal => meal.recipeId);

  if (!recipes || recipes.length === 0) {
      recipesList.innerHTML = `<p class="placeholder-text">${UI_TEXT.RECIPES_EMPTY}</p>`;
      return;
  }

  let html = recipes.map(recipe => {
      // Usa il campo 'ingredienti' che è una stringa pre-formattata
      const ingredientsHtml = formatIngredients(recipe.ingredienti);

      return `
          <div class="recipe-list-item" data-meal-id="${recipe.id}">
              <h4>${recipe.nomePasto}</h4>
              <p><strong>Calorie:</strong> ${recipe.calories_min}${recipe.calories_max && recipe.calories_max !== recipe.calories_min ? ' - ' + recipe.calories_max : ''} kcal</p>
              ${ingredientsHtml ? `<div><strong>Ingredienti:</strong>${ingredientsHtml}</div>` : ''}
          </div>
      `;
  }).join('');

  recipesList.innerHTML = html;
}