import { getState } from '../core/state.js';
import { renderPlannerPage } from './plannerRenderer.js';
import { renderBiometricsPage, renderProfilePage, renderChartsPage, renderDebriefingPage, renderGoalsPage, renderRecipesPage, renderLibraryPage, renderExplorePage } from './pageRenderers.js';
import { initializeTrainerController, destroyTrainerController } from './trainerRenderer.js';
import { UI_TEXT } from '../config/uiText.js';
import { renderIcon } from './icons.js';
import { log } from '../utils/logger.js';

let isTrainerActive = false;

function populateIcons() {
    document.querySelector('.app-title').insertAdjacentHTML('afterbegin', renderIcon('APP_LOGO', { width: 24, height: 24 }));
    document.getElementById('nav-planner').insertAdjacentHTML('afterbegin', renderIcon('PLANNER'));
    document.getElementById('nav-library').insertAdjacentHTML('afterbegin', renderIcon('LIBRARY'));
    document.getElementById('nav-progress').insertAdjacentHTML('afterbegin', renderIcon('WEIGHT_SCALE'));
    document.getElementById('nav-charts').insertAdjacentHTML('afterbegin', renderIcon('BAR_CHART'));
    document.getElementById('nav-recipes').insertAdjacentHTML('afterbegin', renderIcon('BOOK'));
    document.getElementById('nav-goals').insertAdjacentHTML('afterbegin', renderIcon('GOAL'));
    document.getElementById('nav-explore').insertAdjacentHTML('afterbegin', renderIcon('EXPLORE'));
    document.getElementById('nav-profile').insertAdjacentHTML('afterbegin', renderIcon('PROFILE'));
    document.getElementById('global-alert-close').innerHTML = renderIcon('CLOSE', { width: 24, height: 24, classes: 'alert-icon' });
    document.getElementById('hamburger-btn').innerHTML = renderIcon('HAMBURGER', { width: 28, height: 28 });
    document.querySelectorAll('.btn-expand-chart').forEach(btn => {
        btn.innerHTML = renderIcon('EXPAND', { width: 20, height: 20 });
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.innerHTML = renderIcon('CLOSE');
    });
}

export function populateInitialText() {
  document.title = UI_TEXT.MAIN_TITLE;
  document.getElementById('main-title').textContent = UI_TEXT.MAIN_TITLE;
  document.querySelector('#nav-planner span').textContent = UI_TEXT.NAV_PLANNER;
  document.querySelector('#nav-library span').textContent = UI_TEXT.NAV_LIBRARY;
  document.querySelector('#nav-progress span').textContent = UI_TEXT.NAV_PROGRESS;
  document.querySelector('#nav-charts span').textContent = UI_TEXT.NAV_CHARTS;
  document.querySelector('#nav-recipes span').textContent = UI_TEXT.NAV_RECIPES;
  document.querySelector('#nav-goals span').textContent = UI_TEXT.NAV_GOALS;
  document.querySelector('#nav-explore span').textContent = UI_TEXT.NAV_EXPLORE;
  document.querySelector('#nav-profile span').textContent = UI_TEXT.NAV_PROFILE;
  document.getElementById('load-content-hub-btn').textContent = UI_TEXT.LOAD_BUTTON;
  document.getElementById('reset-btn').textContent = UI_TEXT.RESET_BUTTON;
  document.getElementById('copy-week-btn').textContent = UI_TEXT.COPY_WEEK_BTN;
  document.getElementById('backup-btn').textContent = UI_TEXT.BACKUP_BTN;
  document.getElementById('restore-btn').textContent = UI_TEXT.RESTORE_BTN;
  document.getElementById('info-modal-title').textContent = UI_TEXT.INFO_MODAL_TITLE;
  document.getElementById('info-modal-desc').textContent = UI_TEXT.INFO_MODAL_DESC;
  document.getElementById('info-modal-json-example').textContent = UI_TEXT.INFO_MODAL_EXAMPLE_JSON;
  document.getElementById('biometrics-title').textContent = UI_TEXT.BIOMETRICS_FORM_TITLE;
  document.getElementById('biometrics-history-title').textContent = UI_TEXT.BIOMETRICS_HISTORY_TITLE;
  document.getElementById('profile-title').textContent = UI_TEXT.PROFILE_FORM_TITLE;
  document.getElementById('data-management-title').textContent = "Gestione Dati";
  document.getElementById('charts-title').textContent = UI_TEXT.CHARTS_TITLE;
  document.getElementById('planner-week-chart-title').textContent = UI_TEXT.PLANNER_CHART_TITLE;
  document.getElementById('biometrics-chart-title').textContent = UI_TEXT.BIOMETRICS_CHART_TITLE;
  document.getElementById('recipes-title').textContent = UI_TEXT.RECIPES_TITLE;
  document.getElementById('debriefing-title').textContent = UI_TEXT.DEBRIEFING_TITLE;
  document.getElementById('back-to-planner-btn').textContent = UI_TEXT.DEBRIEFING_BACK_BTN;
  document.getElementById('log-view-title').textContent = "Registro Dettagliato";
  populateIcons();
}

export function renderApp() {
  const state = getState();
  const { currentView } = state.ui;
  const plannerPage = document.getElementById('planner-page');
  const libraryPage = document.getElementById('library-page');
  const progressPage = document.getElementById('progress-page');
  const chartsPage = document.getElementById('charts-page');
  const recipesPage = document.getElementById('recipes-page');
  const goalsPage = document.getElementById('goals-page');
  const explorePage = document.getElementById('explore-page');
  const profilePage = document.getElementById('profile-page');
  const trainerPage = document.getElementById('trainer-page');
  const debriefingPage = document.getElementById('debriefing-page');

  const navPlannerBtn = document.getElementById('nav-planner');
  const navLibraryBtn = document.getElementById('nav-library');
  const navProgressBtn = document.getElementById('nav-progress');
  const navChartsBtn = document.getElementById('nav-charts');
  const navRecipesBtn = document.getElementById('nav-recipes');
  const navGoalsBtn = document.getElementById('nav-goals');
  const navExploreBtn = document.getElementById('nav-explore');
  const navProfileBtn = document.getElementById('nav-profile');

  log('Renderer', 'Render triggered. Current view:', currentView, 'isTrainerActive:', isTrainerActive);

  if (currentView !== 'trainer' && isTrainerActive) {
      log('Renderer', 'View is not trainer, destroying trainer controller...');
      destroyTrainerController();
      isTrainerActive = false;
  }

  [plannerPage, libraryPage, progressPage, chartsPage, recipesPage, goalsPage, explorePage, profilePage, trainerPage, debriefingPage].forEach(p => p.classList.add('hidden'));
  [navPlannerBtn, navLibraryBtn, navProgressBtn, navChartsBtn, navRecipesBtn, navGoalsBtn, navExploreBtn, navProfileBtn].forEach(b => b.classList.remove('active'));
  document.getElementById('main-nav').classList.remove('is-open', 'is-mobile');

  if (currentView === 'planner' || currentView === 'log') {
    plannerPage.classList.remove('hidden');
    navPlannerBtn.classList.add('active');
    renderPlannerPage(state);
  } else if (currentView === 'library') {
    libraryPage.classList.remove('hidden');
    navLibraryBtn.classList.add('active');
    renderLibraryPage(state);
  } else if (currentView === 'progress') {
    progressPage.classList.remove('hidden');
    navProgressBtn.classList.add('active');
    renderBiometricsPage(state);
  } else if (currentView === 'charts') {
    chartsPage.classList.remove('hidden');
    navChartsBtn.classList.add('active');
    renderChartsPage(state);
  } else if (currentView === 'recipes') {
    recipesPage.classList.remove('hidden');
    navRecipesBtn.classList.add('active');
    renderRecipesPage(state);
  } else if (currentView === 'goals') {
    goalsPage.classList.remove('hidden');
    navGoalsBtn.classList.add('active');
    renderGoalsPage(state);
  } else if (currentView === 'explore') {
    explorePage.classList.remove('hidden');
    navExploreBtn.classList.add('active');
    renderExplorePage(state);
  } else if (currentView === 'profile') {
    profilePage.classList.remove('hidden');
    navProfileBtn.classList.add('active');
    renderProfilePage(state);
    document.getElementById('content-hub-url-input').value = state.contentHubUrl;
  } else if (currentView === 'trainer') {
    trainerPage.classList.remove('hidden');
    setTimeout(() => window.scrollTo(0, 0), 0);
    log('Renderer', 'View is trainer, checking if trainer is active...');
    if (!isTrainerActive) {
      log('Renderer', 'Trainer is not active, initializing trainer controller...');
      initializeTrainerController();
      isTrainerActive = true;
    }
  } else if (currentView === 'debriefing') {
    debriefingPage.classList.remove('hidden');
    renderDebriefingPage(state);
  }
}
