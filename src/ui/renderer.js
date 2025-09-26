import { getState } from '../core/state.js';
import { renderPlannerPage } from './plannerRenderer.js';
import { renderBiometricsPage, renderProfilePage } from './pageRenderers.js';

export function populateInitialText() {
  document.title = UI_TEXT.MAIN_TITLE;
  document.getElementById('main-title').textContent = UI_TEXT.MAIN_TITLE;
  document.getElementById('nav-planner').textContent = UI_TEXT.NAV_PLANNER;
  document.getElementById('nav-progress').textContent = UI_TEXT.NAV_PROGRESS;
  document.getElementById('nav-profile').textContent = UI_TEXT.NAV_PROFILE;
  document.getElementById('load-config-btn').textContent = UI_TEXT.LOAD_BUTTON;
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
}

export function renderApp() {
  const state = getState();
  const plannerPage = document.getElementById('planner-page');
  const progressPage = document.getElementById('progress-page');
  const profilePage = document.getElementById('profile-page');
  const navPlannerBtn = document.getElementById('nav-planner');
  const navProgressBtn = document.getElementById('nav-progress');
  const navProfileBtn = document.getElementById('nav-profile');

  [plannerPage, progressPage, profilePage].forEach(p => p.classList.add('hidden'));
  [navPlannerBtn, navProgressBtn, navProfileBtn].forEach(b => b.classList.remove('active'));

  if (state.currentView === 'planner' || state.currentView === 'log') {
    plannerPage.classList.remove('hidden');
    navPlannerBtn.classList.add('active');
    renderPlannerPage(state);
  } else if (state.currentView === 'progress') {
    progressPage.classList.remove('hidden');
    navProgressBtn.classList.add('active');
    renderBiometricsPage(state);
  } else if (state.currentView === 'profile') {
    profilePage.classList.remove('hidden');
    navProfileBtn.classList.add('active');
    renderProfilePage(state);
  }

  const urlInput = document.getElementById('config-url-input');
  if (document.activeElement !== urlInput) urlInput.value = state.configUrl;
}
