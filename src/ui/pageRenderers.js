import { calculateBMR } from '../core/calculations.js';
import { BIOMETRIC_FIELDS, PROFILE_FIELDS } from '../config/forms.js';
import { UI_TEXT } from '../config/uiText.js';
import { renderIcon } from './icons.js';
import { renderCharts } from './charts.js';
import { formatIngredientsSummary } from '../utils/formatters.js';
import { fetchAndMergePackage } from '../api/configService.js';
import { log } from '../utils/logger.js';
import { getState, setUiState } from '../core/state.js';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
}

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
  let formHTML = '';

  PROFILE_FIELDS.forEach(field => {
    let fieldHTML = '<div class="form-group">';
    switch (field.type) {
      case 'radio':
        fieldHTML += `<fieldset><legend>${field.label}</legend>${field.options.map(opt => `<label><input type="radio" name="${field.id}" value="${opt.value}" ${state.userProfile[field.id] === opt.value ? 'checked' : ''}> ${opt.label}</label>`).join('')}</fieldset>`;
        break;
      case 'checkbox-group':
        fieldHTML += `<fieldset><legend>${field.label}</legend>${field.options.map(opt => `<label><input type="checkbox" name="${opt.id}" id="prof-${opt.id}" ${state.userProfile[opt.id] ? 'checked' : ''}> ${opt.label}</label>`).join('')}</fieldset>`;
        break;
      default:
        fieldHTML += `<label for="prof-${field.id}">${field.label}</label><input type="${field.type}" id="prof-${field.id}" name="${field.id}" value="${state.userProfile[field.id] || ''}" ${field.props || ''}>`;
    }
    fieldHTML += '</div>';
    formHTML += fieldHTML;
  });

  form.innerHTML = `${formHTML}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.PROFILE_SAVE_BTN}</button></div>`;
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
  const summary = state.ui.lastWorkoutSummary;

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

  const caloriesBurnedHTML = summary.totalCaloriesBurned > 0 ? `<div class="stat-item"><span class="stat-label">${UI_TEXT.DEBRIEFING_CALORIES_BURNED}</span><span class="stat-value">${summary.totalCaloriesBurned}</span></div>` : '';
  const tonnageHTML = summary.totalTonnage > 0 ? `<div class="stat-item"><span class="stat-label">${UI_TEXT.DEBRIEFING_TONNAGE}</span><span class="stat-value">${summary.totalTonnage} kg</span></div>` : '';

  statsContainer.innerHTML = `
      <div class="stat-item"><span class="stat-label">${UI_TEXT.DEBRIEFING_TOTAL_TIME}</span><span class="stat-value">${formatDuration(summary.totalTime)}</span></div>
      <div class="stat-item"><span class="stat-label">${UI_TEXT.DEBRIEFING_EXERCISE_TIME}</span><span class="stat-value">${formatDuration(summary.totalExerciseTime)}</span></div>
      <div class="stat-item"><span class="stat-label">${UI_TEXT.DEBRIEFING_REST_TIME}</span><span class="stat-value">${formatDuration(summary.totalRestTime)}</span></div>
      ${caloriesBurnedHTML}
      ${tonnageHTML}
  `;

  summaryContainer.innerHTML = summary.exercises.map(exercise => {
      const isCompleted = exercise.setsCompleted === exercise.defaultSets;
      return `
          <div class="debriefing-card ${isCompleted ? 'completed' : 'incomplete'}">
              <div class="debriefing-card-header"><h4>${exercise.name}</h4><div class="debriefing-status">${isCompleted ? UI_TEXT.DEBRIEFING_COMPLETED : UI_TEXT.DEBRIEFING_INCOMPLETE}</div></div>
              <div class="debriefing-card-body">
                <div class="exercise-stats">
                  <span class="exercise-stat-item">${UI_TEXT.DEBRIEFING_SETS_COMPLETED}: ${exercise.setsCompleted}/${exercise.defaultSets}</span>
                  <span class="exercise-stat-item">${UI_TEXT.DEBRIEFING_TOTAL_TIME}: ${formatDuration(exercise.totalTime)}</span>
                </div>
                <div class="sets-details-container">${exercise.setsData.map((setData, i) => `<div class="set-detail-item"><span>${UI_TEXT.DEBRIEFING_SET_LABEL} ${i + 1}</span><span>${getSetDetails(setData)}</span></div>`).join('')}</div>
              </div>
          </div>`;
  }).join('');
}

export function renderRecipesPage(state) {
  const recipesList = document.getElementById('recipes-list');
  const recipes = state.masterMealList.filter(meal => meal.recipeId);
  if (!recipes || recipes.length === 0) {
      recipesList.innerHTML = `<p class="placeholder-text">${UI_TEXT.RECIPES_EMPTY}</p>`;
      return;
  }
  recipesList.innerHTML = recipes.map(recipe => {
      const ingredientsHtml = formatIngredientsSummary(recipe);
      return `<div class="recipe-list-item" data-meal-id="${recipe.id}"><h4>${recipe.nomePasto}</h4><p><strong>Calorie:</strong> ${recipe.calories_min}${recipe.calories_max && recipe.calories_max !== recipe.calories_min ? ' - ' + recipe.calories_max : ''} kcal</p>${ingredientsHtml ? `<div><strong>Ingredienti:</strong> ${ingredientsHtml}</div>` : ''}</div>`;
  }).join('');
}

export function renderLibraryPage(state) {
  const { activeLibraryTab = 'ingredients', librarySearchTerm = '' } = state.ui;
  const searchInput = document.getElementById('library-search-input');
  searchInput.value = librarySearchTerm;
  searchInput.placeholder = `Cerca in ${activeLibraryTab === 'ingredients' ? 'ingredienti' : 'pasti'}...`;
  document.querySelectorAll('#library-page .btn-view').forEach(btn => btn.classList.toggle('active', btn.dataset.view === activeLibraryTab));
  document.querySelectorAll('.library-content').forEach(panel => panel.classList.toggle('hidden', !panel.id.includes(activeLibraryTab)));
  const lowerCaseSearchTerm = librarySearchTerm.toLowerCase();

  const ingredientList = document.getElementById('ingredient-list');
  const filteredIngredients = state.masterIngredientList.filter(ing => ing.nome.toLowerCase().includes(lowerCaseSearchTerm));
  if (filteredIngredients.length > 0) {
    ingredientList.innerHTML = filteredIngredients.map(ing => `<div class="library-item" data-id="${ing.id}"><div class="library-item-info"><span class="library-item-info__name">${ing.nome}</span><span class="library-item-info__details">${ing.kcal_per_100g} kcal / 100g ${ing.g_per_pezzo ? `| ${ing.g_per_pezzo}g per pezzo` : ''}</span></div><div class="library-item-actions"><button class="btn-edit" title="Modifica">${renderIcon('EDIT', { width: 18, height: 18 })}</button><button class="btn-delete" title="Elimina">${renderIcon('TRASH', { width: 18, height: 18 })}</button></div></div>`).join('');
  } else {
    ingredientList.innerHTML = `<p class="placeholder-text">Nessun ingrediente trovato.</p>`;
  }

  const mealList = document.getElementById('meal-list');
  const filteredMeals = state.masterMealList.filter(meal => meal.nomePasto.toLowerCase().includes(lowerCaseSearchTerm));
  if (filteredMeals.length > 0) {
    mealList.innerHTML = filteredMeals.map(meal => {
      const calorieText = (meal.calories_min && meal.calories_max) ? (meal.calories_min === meal.calories_max ? `${meal.calories_min} kcal` : `${meal.calories_min} - ${meal.calories_max} kcal`) : 'Calorie non calcolate';
      return `<div class="library-item" data-id="${meal.id}"><div class="library-item-info"><span class="library-item-info__name">${meal.nomePasto}</span><span class="library-item-info__details">${calorieText}</span></div><div class="library-item-actions"><button class="btn-edit" title="Modifica">${renderIcon('EDIT', { width: 18, height: 18 })}</button><button class="btn-delete" title="Elimina">${renderIcon('TRASH', { width: 18, height: 18 })}</button></div></div>`;
    }).join('');
  } else {
    mealList.innerHTML = `<p class="placeholder-text">Nessun pasto trovato. Creane uno nuovo o caricalo da una configurazione remota.</p>`;
  }
}

async function cacheAllPackages() {
  log('Renderer', 'Caching all packages from Content Hub');
  const state = getState();
  if (state.ui.explore.packages.length > 0) {
    log('Renderer', 'Packages already cached.');
    return;
  }

  try {
    const indexUrl = new URL('package-index.json', state.contentHubUrl).href;
    const packageIndex = await fetchJson(indexUrl);

    const manifestPromises = Object.values(packageIndex).map(path =>
      fetchJson(new URL(path, state.contentHubUrl).href)
    );
    const manifests = await Promise.all(manifestPromises);

    manifests.forEach(m => {
      m.url = new URL(Object.values(packageIndex).find(p => p.includes(m.id)), state.contentHubUrl).href;
    });

    setUiState({
      ...state.ui,
      explore: { ...state.ui.explore, packages: manifests }
    });
    log('Renderer', 'All packages successfully cached.');

  } catch (error) {
    log('Renderer', 'Error caching packages', error);
    document.getElementById('explore-grid').innerHTML = `<p class="placeholder-text">Impossibile caricare i contenuti dall'hub.</p>`;
  }
}

export async function renderExplorePage() {
  log('Renderer', 'Rendering Explore Page');
  const state = getState();
  const { packages, searchTerm, activeTags, sortOrder } = state.ui.explore;

  document.getElementById('explore-title').textContent = UI_TEXT.EXPLORE_TITLE;
  document.getElementById('explore-search-input').placeholder = UI_TEXT.EXPLORE_SEARCH_PLACEHOLDER;
  document.getElementById('explore-sort-label').textContent = UI_TEXT.EXPLORE_SORT_LABEL;
  document.getElementById('explore-sort-default').textContent = UI_TEXT.EXPLORE_SORT_DEFAULT;
  document.getElementById('explore-sort-name-asc').textContent = UI_TEXT.EXPLORE_SORT_NAME_ASC;
  document.getElementById('explore-sort-name-desc').textContent = UI_TEXT.EXPLORE_SORT_NAME_DESC;
  document.getElementById('explore-sort-author').textContent = UI_TEXT.EXPLORE_SORT_AUTHOR;


  if (packages.length === 0) {
    document.getElementById('explore-grid').innerHTML = '<p class="placeholder-text">Caricamento contenuti...</p>';
    await cacheAllPackages();
    return;
  }

  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  let filteredPackages = packages.filter(pkg =>
    (pkg.title.toLowerCase().includes(lowerCaseSearchTerm) || pkg.description.toLowerCase().includes(lowerCaseSearchTerm)) &&
    (activeTags.length === 0 || activeTags.every(tag => pkg.tags && pkg.tags.includes(tag)))
  );

  switch (sortOrder) {
    case 'name_asc': filteredPackages.sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'name_desc': filteredPackages.sort((a, b) => b.title.localeCompare(a.title)); break;
    case 'author': filteredPackages.sort((a, b) => a.author.localeCompare(b.author)); break;
    default: break;
  }

  const allTags = [...new Set(packages.flatMap(p => p.tags || []))].sort();
  const tagsContainer = document.getElementById('explore-tags-container');
  tagsContainer.innerHTML = `<button class="tag-filter-btn ${activeTags.length === 0 ? 'active' : ''}" data-tag="all">${UI_TEXT.EXPLORE_FILTER_ALL}</button>${allTags.map(tag => `<button class="tag-filter-btn ${activeTags.includes(tag) ? 'active' : ''}" data-tag="${tag}">${tag}</button>`).join('')}`;

  const gridContainer = document.getElementById('explore-grid');
  if (filteredPackages.length === 0) {
    gridContainer.innerHTML = '<p class="placeholder-text">Nessun pacchetto corrisponde ai criteri di ricerca.</p>';
  } else {
    gridContainer.innerHTML = filteredPackages.map(pkg => `
      <div class="explore-card">
        <img src="${pkg.image}" alt="${pkg.title}" class="explore-card-image">
        <div class="explore-card-body">
          <h3>${pkg.title}</h3>
          <p>${pkg.description}</p>
          <button class="btn btn-primary btn-add-package" data-url="${pkg.url}">${UI_TEXT.EXPLORE_ADD_TO_LIBRARY}</button>
        </div>
      </div>
    `).join('');

    gridContainer.querySelectorAll('.btn-add-package').forEach(button => {
      button.addEventListener('click', (e) => {
        fetchAndMergePackage(e.currentTarget.dataset.url);
      });
    });
  }
}
