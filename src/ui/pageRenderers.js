import { calculateBMR } from '../core/calculations.js';
import { BIOMETRIC_FIELDS, PROFILE_FIELDS, EXERCISE_FIELDS } from '../config/forms.js';
import { UI_TEXT } from '../config/uiText.js';
import { renderIcon } from './icons.js';
import { renderCharts } from './charts.js';
import { formatIngredientsSummary } from '../utils/formatters.js';
import { fetchAndMergePackage } from '../api/configService.js';
import { log } from '../utils/logger.js';
import { getState, setUiState } from '../core/state.js';
import { openPackagePreviewModal } from './modals.js';
import { ALL_MEAL_TYPES } from '../utils/constants.js';

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
      <div class="stat-item"><span class_=("stat-label")>${UI_TEXT.DEBRIEFING_EXERCISE_TIME}</span><span class="stat-value">${formatDuration(summary.totalExerciseTime)}</span></div>
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

function renderPackageFilters(state, activeLibraryTab) {
  const { packageFilter } = state.ui.library;
  const tagsContainer = document.getElementById('library-tag-filters');
  
  let sourceList = [];
  if (activeLibraryTab === 'ingredients') {
    sourceList = state.masterIngredientList;
  } else if (activeLibraryTab === 'meals') {
    sourceList = state.masterMealList;
  } else if (activeLibraryTab === 'exercises') {
    sourceList = state.masterWorkoutList;
  }

  const pkgTags = [...new Set(sourceList.flatMap(item => item.etichette || []).filter(tag => tag && tag.startsWith('pkg:')))];

  if (pkgTags.length === 0) {
    tagsContainer.innerHTML = '';
    return;
  }

  let tagsHtml = `<button class="tag-filter-btn ${!packageFilter ? 'active' : ''}" data-tag="all">${UI_TEXT.EXPLORE_FILTER_ALL}</button>`;
  tagsHtml += pkgTags.map(tag => {
    const tagName = tag.replace('pkg:', '');
    return `<button class="tag-filter-btn ${packageFilter === tag ? 'active' : ''}" data-tag="${tag}">${tagName}</button>`;
  }).join('');
  
  tagsContainer.innerHTML = tagsHtml;
}

function formatExerciseDetails(exercise) {
  const sets = exercise.defaultSets || '?';
  const rest = exercise.defaultRest || 0;
  let details = `${sets} set | Riposo: ${rest}s`;

  const mode = exercise.execution_mode || 'guided_tempo';

  if (mode === 'logging') {
      if (exercise.defaultRepsMin && exercise.defaultRepsMax) {
          details += ` | ${exercise.defaultRepsMin}-${exercise.defaultRepsMax} reps`;
      } else if (exercise.defaultRepsMin) {
          details += ` | ${exercise.defaultRepsMin}+ reps`;
      }
  } else if (mode === 'guided_static') {
      details += ` | ${exercise.defaultDuration || '?'}s`;
  } else {
      details += ` | ${exercise.defaultReps || '?'} reps`;
  }

  return details;
}

export function renderLibraryPage(state) {
  const { activeLibraryTab = 'ingredients', library: libState } = state.ui;
  const { searchTerm = '', packageFilter, mealTypeFilter, execModeFilter } = libState;
  
  const searchInput = document.getElementById('library-search-input');
  searchInput.value = searchTerm;
  
  const tabs = {
    'ingredients': 'ingredienti (per nome o etichetta)',
    'meals': 'pasti (per nome o etichetta)',
    'exercises': 'esercizi (per nome o etichetta)',
    'templates': 'schede (per nome)'
  };
  searchInput.placeholder = `Cerca in ${tabs[activeLibraryTab] || 'ingredienti'}...`;

  document.querySelectorAll('#library-page .btn-view').forEach(btn => btn.classList.toggle('active', btn.dataset.view === activeLibraryTab));
  document.querySelectorAll('.library-content').forEach(panel => panel.classList.toggle('hidden', !panel.id.includes(activeLibraryTab)));
  
  document.getElementById('library-tab-ingredients').textContent = 'Ingredienti';
  document.getElementById('library-tab-meals').textContent = 'Pasti';
  document.getElementById('library-tab-exercises').textContent = 'Esercizi';
  document.getElementById('library-tab-templates').textContent = UI_TEXT.NAV_TEMPLATES;

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  // Render Package Filters (solo per pasti, ingredienti, esercizi)
  const tagsContainer = document.getElementById('library-tag-filters');
  if (activeLibraryTab === 'meals' || activeLibraryTab === 'ingredients' || activeLibraryTab === 'exercises') {
    renderPackageFilters(state, activeLibraryTab);
    tagsContainer.classList.remove('hidden');
  } else {
    tagsContainer.classList.add('hidden');
  }

  // Render Specific Filters (Meals, Exercises)
  const specificFiltersContainer = document.getElementById('library-specific-filters');
  let specificFiltersHtml = '';

  if (activeLibraryTab === 'meals') {
    specificFiltersHtml = `
      <div class="form-group">
        <label for="library-meal-type-filter">Tipo Pasto</label>
        <select id="library-meal-type-filter" name="mealTypeFilter">
          <option value="all">Tutti i tipi</option>
          ${ALL_MEAL_TYPES.map(type => `<option value="${type}" ${mealTypeFilter === type ? 'selected' : ''}>${type}</option>`).join('')}
        </select>
      </div>
    `;
  } else if (activeLibraryTab === 'exercises') {
    specificFiltersHtml = `
      <div class="form-group">
        <label for="library-exec-mode-filter">Modalità Esecuzione</label>
        <select id="library-exec-mode-filter" name="execModeFilter">
          <option value="all">Tutte le modalità</option>
          <option value="guided_tempo" ${execModeFilter === 'guided_tempo' ? 'selected' : ''}>${UI_TEXT.EXERCISE_FIELD_MODE_GUIDED_TEMPO}</option>
          <option value="guided_static" ${execModeFilter === 'guided_static' ? 'selected' : ''}>${UI_TEXT.EXERCISE_FIELD_MODE_GUIDED_STATIC}</option>
          <option value="logging" ${execModeFilter === 'logging' ? 'selected' : ''}>${UI_TEXT.EXERCISE_FIELD_MODE_LOGGING}</option>
        </select>
      </div>
    `;
  }

  specificFiltersContainer.innerHTML = specificFiltersHtml;
  specificFiltersContainer.classList.toggle('hidden', specificFiltersHtml === '');


  // Render Ingredients
  const ingredientList = document.getElementById('ingredient-list');
  const filteredIngredients = state.masterIngredientList.filter(ing => {
      // Filtro Pacchetto
      if (packageFilter && (!ing.etichette || !ing.etichette.includes(packageFilter))) {
        return false;
      }
      // Filtro Ricerca
      if (lowerCaseSearchTerm !== '') {
        const nameMatch = ing.nome.toLowerCase().includes(lowerCaseSearchTerm);
        const tagMatch = ing.etichette && ing.etichette.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm));
        if (!nameMatch && !tagMatch) return false;
      }
      return true;
  });

  if (filteredIngredients.length > 0) {
    ingredientList.innerHTML = filteredIngredients.map(ing => `<div class="library-item" data-id="${ing.id}"><div class="library-item-info"><span class="library-item-info__name">${ing.nome}</span><span class="library-item-info__details">${ing.kcal_per_100g} kcal / 100g ${ing.g_per_pezzo ? `| ${ing.g_per_pezzo}g per pezzo` : ''}</span></div><div class="library-item-actions"><button class="btn-edit" title="Modifica">${renderIcon('EDIT', { width: 18, height: 18 })}</button><button class="btn-delete" title="Elimina">${renderIcon('TRASH', { width: 18, height: 18 })}</button></div></div>`).join('');
  } else {
    ingredientList.innerHTML = `<p class="placeholder-text">Nessun ingrediente trovato.</p>`;
  }

  // Render Meals
  const mealList = document.getElementById('meal-list');
  const filteredMeals = state.masterMealList.filter(meal => {
      // Filtro Pacchetto
      if (packageFilter && (!meal.etichette || !meal.etichette.includes(packageFilter))) {
        return false;
      }
      
      // Filtro Tipo Pasto
      if (mealTypeFilter !== 'all') {
        if (meal.tipoPasto === 'Tutti') {
          // 'Tutti' non matcha un filtro specifico
        } else if (Array.isArray(meal.tipoPasto)) {
          if (!meal.tipoPasto.includes(mealTypeFilter)) return false;
        } else {
          if (meal.tipoPasto !== mealTypeFilter) return false;
        }
      }
      
      // Filtro Ricerca
      if (lowerCaseSearchTerm !== '') {
        const nameMatch = meal.nomePasto.toLowerCase().includes(lowerCaseSearchTerm);
        const tagMatch = meal.etichette && meal.etichette.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm));
        if (!nameMatch && !tagMatch) return false;
      }
      
      return true;
  });

  if (filteredMeals.length > 0) {
    mealList.innerHTML = filteredMeals.map(meal => {
      const calorieText = (meal.calories_min && meal.calories_max) ? (meal.calories_min === meal.calories_max ? `${meal.calories_min} kcal` : `${meal.calories_min} - ${meal.calories_max} kcal`) : 'Calorie non calcolate';
      return `<div class="library-item" data-id="${meal.id}"><div class="library-item-info"><span class="library-item-info__name">${meal.nomePasto}</span><span class="library-item-info__details">${calorieText}</span></div><div class="library-item-actions"><button class="btn-edit" title="Modifica">${renderIcon('EDIT', { width: 18, height: 18 })}</button><button class="btn-delete" title="Elimina">${renderIcon('TRASH', { width: 18, height: 18 })}</button></div></div>`;
    }).join('');
  } else {
    mealList.innerHTML = `<p class="placeholder-text">Nessun pasto trovato. Creane uno nuovo o caricalo da una configurazione remota.</p>`;
  }

  // Render Exercises
  const exerciseList = document.getElementById('exercise-list');
  const filteredExercises = state.masterWorkoutList.filter(ex => {
      // Filtro Pacchetto
      if (packageFilter && (!ex.etichette || !ex.etichette.includes(packageFilter))) {
        return false;
      }
      
      // Filtro Modalità Esecuzione
      if (execModeFilter !== 'all') {
        const mode = ex.execution_mode || 'guided_tempo'; // Default
        if (mode !== execModeFilter) return false;
      }
      
      // Filtro Ricerca
      if (lowerCaseSearchTerm !== '') {
        const nameMatch = ex.name.toLowerCase().includes(lowerCaseSearchTerm);
        const tagMatch = ex.etichette && ex.etichette.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm));
        if (!nameMatch && !tagMatch) return false;
      }
      
      return true;
  });

  if (filteredExercises.length > 0) {
    exerciseList.innerHTML = filteredExercises.map(ex => {
      return `<div class="library-item" data-id="${ex.id}">
                <div class="library-item-info">
                  <span class="library-item-info__name">${ex.name}</span>
                  <span class="library-item-info__details">${formatExerciseDetails(ex)}</span>
                </div>
                <div class="library-item-actions">
                  <button class="btn-edit" title="Modifica">${renderIcon('EDIT', { width: 18, height: 18 })}</button>
                  <button class="btn-delete" title="Elimina">${renderIcon('TRASH', { width: 18, height: 18 })}</button>
                </div>
              </div>`;
    }).join('');
  } else {
    exerciseList.innerHTML = `<p class="placeholder-text">Nessun esercizio trovato. Creane uno nuovo o carica un pacchetto dalla sezione Esplora.</p>`;
  }

  // Render Templates
  const templateList = document.getElementById('template-list');
  const filteredTemplates = state.masterWorkoutTemplateList.filter(t => t.name.toLowerCase().includes(lowerCaseSearchTerm));
  if (filteredTemplates.length > 0) {
    templateList.innerHTML = filteredTemplates.map(template => {
      const exerciseCount = template.exercises.length;
      const plural = exerciseCount === 1 ? 'esercizio' : 'esercizi';
      return `<div class="library-item" data-id="${template.id}">
                <div class="library-item-info">
                  <span class="library-item-info__name">${template.name}</span>
                  <span class="library-item-info__details">${exerciseCount} ${plural}</span>
                </div>
                <div class="library-item-actions">
                  <button class="btn-edit-template" title="Modifica">${renderIcon('EDIT', { width: 18, height: 18 })}</button>
                  <button class="btn-delete-template" title="Elimina">${renderIcon('TRASH', { width: 18, height: 18 })}</button>
                </div>
              </div>`;
    }).join('');
  } else {
    templateList.innerHTML = `<p class="placeholder-text">${UI_TEXT.NO_TEMPLATES_AVAILABLE}</p>`;
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

    manifests.forEach(manifest => {
      const path = packageIndex[manifest.id];
      if (path) {
        manifest.url = new URL(path, state.contentHubUrl).href;
      } else {
        log('Renderer', 'Could not find a path for manifest id:', manifest.id);
        manifest.url = null;
      }
    });

    const validManifests = manifests.filter(m => m.url);

    setUiState({
      ...state.ui,
      explore: { ...state.ui.explore, packages: validManifests }
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
        <img src="${new URL(pkg.image, pkg.url)}" alt="${pkg.title}" class="explore-card-image">
        <div class="explore-card-body">
          <h3>${pkg.title}</h3>
          <p>${pkg.description}</p>
          <div class="explore-card-actions">
            <button class="btn btn-secondary btn-preview-package" data-url="${pkg.url}">Anteprima</button>
            <button class="btn btn-primary btn-add-package" data-url="${pkg.url}">${UI_TEXT.EXPLORE_ADD_TO_LIBRARY}</button>
          </div>
        </div>
      </div>
    `).join('');

    gridContainer.querySelectorAll('.btn-add-package, .btn-preview-package').forEach(button => {
      button.addEventListener('click', (e) => {
        const packageUrl = e.currentTarget.dataset.url;
        const pkg = packages.find(p => p.url === packageUrl);
        if (!pkg) return;

        if (e.currentTarget.classList.contains('btn-add-package')) {
          fetchAndMergePackage(packageUrl);
        } else {
          openPackagePreviewModal(pkg);
        }
      });
    });
  }
}
