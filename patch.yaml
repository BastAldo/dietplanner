commit_message: "refactor(js): Modularizza la logica di rendering e dei modali"
rationale: |
  In risposta all'osservazione dell'utente sulla grande dimensione dei file JavaScript, questa patch applica la stessa strategia di modularizzazione usata per CSS e HTML alla base di codice JavaScript. L'obiettivo è migliorare la manutenibilità e aderire al Principio di Singola Responsabilità (SRP).

  1.  **Estrazione della Logica dei Modali**: Tutte le funzioni relative alla gestione delle finestre modali (es. `showConfirmModal`, `openDayEditorModal`) sono state spostate dal monolitico `renderer.js` a un nuovo file dedicato, `src/ui/modals.js`. Questo centralizza la gestione dei modali in un unico modulo.

  2.  **Suddivisione dei Renderer**: Il file `renderer.js` è stato smantellato. La logica di rendering per le viste specifiche è stata estratta in moduli dedicati:
      - `src/ui/plannerRenderer.js` ora gestisce il rendering della pagina Planner (calendario e registro).
      - `src/ui/pageRenderers.js` gestisce il rendering delle pagine Profilo e Progressi.

  3.  **Creazione di un Coordinatore**: `src/ui/renderer.js` ora agisce come un "coordinatore". La sua unica responsabilità è importare i renderer specifici e invocare la funzione corretta in base allo stato `currentView` dell'applicazione.

  4.  **Aggiornamento Dipendenze**: Tutti i file che dipendevano dalle funzioni spostate (come `interactions.js` e `main.js`) sono stati aggiornati per importare dai nuovi moduli.

  5.  **Aggiornamento Service Worker**: Il file `sw.js` è stato aggiornato per includere i nuovi moduli JavaScript nella cache, garantendo che l'applicazione rimanga pienamente funzionale offline.

  Questo refactoring rende la base di codice JavaScript significativamente più pulita, organizzata e più facile da manutenere in futuro.
patches:
  - file: src/ui/renderer.js
    content: |
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
  - file: src/ui/interactions.js
    content: |
      import {
        resetCurrentWeek, setPlannerConfig, setConfigUrl, navigateWeek, setView,
        copyPreviousWeek, getState, setAppState, addOrUpdateBiometricEntry,
        deleteBiometricEntry, saveUserProfile
      } from '../core/state.js';
      import { calculateBMR } from '../core/calculations.js';
      import { fetchAndParseConfig } from '../api/configService.js';
      import { showNotification } from './notifications.js';
      import { openDayEditorModal, showConfirmModal, showRecipeModal } from './modals.js';
      import { UI_TEXT } from '../utils/constants.js';

      async function handleLoadConfig() {
        const url = document.getElementById('config-url-input').value.trim();
        if (!url) { showNotification(UI_TEXT.CONFIG_URL_EMPTY_ERROR, 'error'); return; }
        setConfigUrl(url);
        try {
          const config = await fetchAndParseConfig(url);
          setPlannerConfig(config);
          showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
        } catch (error) { showNotification(error.message, 'error'); }
      }

      function handleCalendarClick(e) {
        const dayCell = e.target.closest('.day-cell');
        if (dayCell) { openDayEditorModal(dayCell.dataset.date); }
      }

      function handleLogViewClick(e) {
        const btnRecipe = e.target.closest('.btn-view-recipe');
        if (btnRecipe) {
          const state = getState();
          const meal = state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
          if (meal) { showRecipeModal(meal); }
        }
      }

      function handleShareConfig() {
        const state = getState();
        if (!state.configUrl) { showNotification(UI_TEXT.SHARE_NO_URL_INFO, 'info'); return; }
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?configUrl=${encodeURIComponent(state.configUrl)}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          showNotification(UI_TEXT.SHARE_SUCCESS, 'success');
        }).catch(() => { showNotification(UI_TEXT.SHARE_ERROR, 'error'); });
      }

      function triggerDownload(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification(UI_TEXT.BACKUP_SUCCESS, 'success');
      }

      async function handleSaveBackup() {
        const state = getState();
        const backupData = {
          configUrl: state.configUrl,
          weeklyPlan: state.weeklyPlan,
          biometricData: state.biometricData,
          userProfile: state.userProfile
        };
        const fileName = 'healtypro_backup.txt';
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'text/plain' });
        const file = new File([blob], fileName, { type: 'text/plain' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ title: UI_TEXT.BACKUP_SHARE_TITLE, files: [file] });
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.warn('Web Share API failed, falling back to download:', error);
              triggerDownload(blob, fileName);
            }
          }
        } else { triggerDownload(blob, fileName); }
      }

      function handleRestoreBackup() {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.json,.txt,application/json,text/plain';
          fileInput.onchange = e => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = readerEvent => {
                  try {
                      const content = readerEvent.target.result;
                      const backupData = JSON.parse(content);
                      if (typeof backupData.configUrl === 'string' && typeof backupData.weeklyPlan === 'object') {
                          showConfirmModal(
                              UI_TEXT.RESTORE_CONFIRM_TITLE,
                              UI_TEXT.RESTORE_CONFIRM_MSG,
                              () => { setAppState(backupData); showNotification(UI_TEXT.RESTORE_SUCCESS, 'success'); },
                              'danger'
                          );
                      } else { throw new Error('Invalid structure'); }
                  } catch (err) { showNotification(UI_TEXT.RESTORE_INVALID_FILE, 'error'); }
              };
              reader.readAsText(file);
          };
          fileInput.click();
      }

      function handleCopyWeek() {
        showConfirmModal(
          UI_TEXT.COPY_WEEK_CONFIRM_TITLE, UI_TEXT.COPY_WEEK_CONFIRM_MSG,
          () => { copyPreviousWeek(); showNotification(UI_TEXT.COPY_WEEK_SUCCESS, 'success'); }, 'primary'
        );
      }

      function handleResetWeek() {
        showConfirmModal(
          UI_TEXT.RESET_WEEK_CONFIRM_TITLE, UI_TEXT.RESET_WEEK_CONFIRM_MSG,
          () => { resetCurrentWeek(); showNotification(UI_TEXT.RESET_WEEK_SUCCESS, 'info'); }, 'danger'
        );
      }

      function handleBiometricsForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const entry = {};
        for (let [key, value] of formData.entries()) { entry[key] = value; }
        addOrUpdateBiometricEntry(entry);
        showNotification(UI_TEXT.BIOMETRICS_SAVE_SUCCESS, 'success');
      }

      function handleBiometricsTableClick(e) {
        const btnEdit = e.target.closest('.btn-edit-biometrics');
        const btnDelete = e.target.closest('.btn-delete-biometrics');
        if (btnEdit) {
            const date = btnEdit.dataset.date;
            const entry = getState().biometricData.find(e => e.date === date);
            if (entry) {
                const form = document.getElementById('biometrics-form');
                for (const key in entry) {
                    if (form.elements[key]) { form.elements[key].value = entry[key]; }
                }
                form.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (btnDelete) {
            const date = btnDelete.dataset.date;
            showConfirmModal(
                UI_TEXT.BIOMETRICS_DELETE_CONFIRM_TITLE, UI_TEXT.BIOMETRICS_DELETE_CONFIRM_MSG,
                () => { deleteBiometricEntry(date); showNotification(UI_TEXT.BIOMETRICS_DELETE_SUCCESS, 'info'); }, 'danger'
            );
        }
      }

      function handleProfileForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const profile = {};
        for (let [key, value] of formData.entries()) { profile[key] = value; }
        saveUserProfile(profile);
        showNotification(UI_TEXT.PROFILE_SAVE_SUCCESS, 'success');
      }

      function handleWeightInputChange(e) {
        const weight = e.target.value;
        const { userProfile } = getState();
        const bmrField = document.getElementById('bio-basalMetabolism');
        const bmr = calculateBMR(userProfile, weight);
        if (bmr !== null) {
          bmrField.value = bmr;
        } else {
          bmrField.value = '';
          bmrField.placeholder = UI_TEXT.BIOMETRICS_BMR_PLACEHOLDER;
        }
      }

      export function initializeEventListeners() {
        document.getElementById('backup-btn').addEventListener('click', handleSaveBackup);
        document.getElementById('restore-btn').addEventListener('click', handleRestoreBackup);
        document.getElementById('info-icon').addEventListener('click', () => document.getElementById('info-modal').classList.remove('modal-hidden'));
        document.getElementById('nav-planner').addEventListener('click', () => setView('planner'));
        document.getElementById('nav-progress').addEventListener('click', () => setView('progress'));
        document.getElementById('nav-profile').addEventListener('click', () => setView('profile'));
        document.getElementById('load-config-btn').addEventListener('click', handleLoadConfig);
        document.getElementById('share-config-btn').addEventListener('click', handleShareConfig);
        document.getElementById('calendar-grid').addEventListener('click', handleCalendarClick);
        document.getElementById('log-view').addEventListener('click', handleLogViewClick);
        document.getElementById('prev-week-btn').addEventListener('click', () => navigateWeek(-1));
        document.getElementById('next-week-btn').addEventListener('click', () => navigateWeek(1));
        document.getElementById('view-calendar-btn').addEventListener('click', () => setView('planner'));
        document.getElementById('view-log-btn').addEventListener('click', () => setView('log'));
        document.getElementById('copy-week-btn').addEventListener('click', handleCopyWeek);
        document.getElementById('reset-btn').addEventListener('click', handleResetWeek);
        document.getElementById('biometrics-form').addEventListener('submit', handleBiometricsForm);
        document.getElementById('biometrics-table').addEventListener('click', handleBiometricsTableClick);
        document.getElementById('profile-form').addEventListener('submit', handleProfileForm);
        
        document.getElementById('progress-page').addEventListener('input', e => {
          if (e.target.id === 'bio-weight') { handleWeightInputChange(e); }
        });

        document.querySelectorAll('.modal-close-btn').forEach(btn => {
          btn.addEventListener('click', e => {
            e.stopPropagation();
            const modalId = e.target.dataset.target;
            if (modalId) { document.getElementById(modalId).classList.add('modal-hidden'); }
          });
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
          overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.classList.add('modal-hidden'); } });
        });
        document.getElementById('global-alert-close').addEventListener('click', () => { document.getElementById('global-alert').classList.add('hidden'); });
      }
  - file: src/main.js
    content: |
      import { loadStateFromLocalStorage, getState, setPlannerConfig, setConfigUrl } from './core/state.js';
      import { renderApp, populateInitialText } from './ui/renderer.js';
      import { showConfirmModal } from './ui/modals.js';
      import { initializeEventListeners } from './ui/interactions.js';
      import { loadViews } from './ui/viewLoader.js';
      import { DEFAULT_CONFIG_URL } from './utils/constants.js';
      import { fetchAndParseConfig } from './api/configService.js';
      import { showNotification } from './ui/notifications.js';
      import { UI_TEXT } from './utils/constants.js';

      async function loadConfig(url) {
        if (!url) {
          setPlannerConfig({}); // Clear master list if no URL
          return;
        };
        try {
          const config = await fetchAndParseConfig(url);
          setPlannerConfig(config);
          showNotification(UI_TEXT.CONFIG_LOAD_SUCCESS, 'success');
        } catch (error) {
          showNotification(error.message, 'error');
          setPlannerConfig({}); // Clear master list on error
        }
      }

      function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/dietplanner/sw.js')
              .then(registration => console.log('ServiceWorker registration successful'))
              .catch(err => console.log('ServiceWorker registration failed: ', err));
          });
        }
      }

      async function init() {
        await loadViews();
        document.addEventListener('stateChange', renderApp);
        
        loadStateFromLocalStorage();
        let initialState = getState();
        document.getElementById('config-url-input').value = initialState.configUrl || DEFAULT_CONFIG_URL;

        populateInitialText();
        initializeEventListeners();
        renderApp(); // Initial render with local data

        const urlParams = new URLSearchParams(window.location.search);
        const configUrlFromParam = urlParams.get('configUrl');

        if (configUrlFromParam) {
          const decodedUrl = decodeURIComponent(configUrlFromParam);
          initialState = getState(); // Get fresh state
          if (decodedUrl !== initialState.configUrl) {
            showConfirmModal(
              UI_TEXT.LOAD_SHARED_CONFIG_TITLE,
              UI_TEXT.LOAD_SHARED_CONFIG_MSG,
              () => {
                setConfigUrl(decodedUrl);
                loadConfig(decodedUrl);
              },
              'primary'
            );
          } else {
            await loadConfig(initialState.configUrl);
          }
        } else {
          await loadConfig(initialState.configUrl);
        }
        
        registerServiceWorker();
      }

      document.addEventListener('DOMContentLoaded', init);
  - file: sw.js
    content: |
      const CACHE_NAME = 'healtypro-v5';
      const APP_SHELL_FILES = [
        '.',
        'index.html',
        'styles/base.css',
        'styles/planner.css',
        'styles/progress.css',
        'styles/modals.css',
        'templates/planner.html',
        'templates/progress.html',
        'templates/profile.html',
        'templates/modals.html',
        'src/main.js',
        'src/api/configService.js',
        'src/core/state.js',
        'src/core/calculations.js',
        'src/core/validation.js',
        'src/ui/interactions.js',
        'src/ui/notifications.js',
        'src/ui/renderer.js',
        'src/ui/modals.js',
        'src/ui/plannerRenderer.js',
        'src/ui/pageRenderers.js',
        'src/ui/viewLoader.js',
        'src/utils/constants.js',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png',
        'screenshots/screen_desktop.png',
        'screenshots/screen_mobile.png'
      ];

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => {
              console.log('Opened cache and caching app shell');
              return cache.addAll(APP_SHELL_FILES);
            })
        );
      });

      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.filter((cacheName) => {
                return cacheName !== CACHE_NAME;
              }).map(cacheName => caches.delete(cacheName))
            );
          })
        );
      });

      self.addEventListener('fetch', (event) => {
        if (event.request.url.startsWith(self.location.origin)) {
          event.respondWith(
            caches.match(event.request)
              .then((response) => {
                return response || fetch(event.request);
              })
          );
        } else {
          event.respondWith(fetch(event.request));
        }
      });
  - file: src/ui/modals.js
    content: |
      import { getState, updateWeeklyPlan } from '../core/state.js';
      import { showNotification } from './notifications.js';
      import { UI_TEXT, MEAL_TYPES } from '../utils/constants.js';

      let currentEditingDayISO = null;

      function formatFullDate(isoDate) {
        const date = new Date(isoDate);
        return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      }

      function getRecipeButtonHTML(meal, state) {
        if (state.recipeBaseUrl && meal && meal.recipeId) {
          return `<button class="btn-view-recipe" data-meal-id="${meal.id}" title="${UI_TEXT.RECIPE_BUTTON_TITLE}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h7v14H4zm9 0V5h7l.001 14H13z"></path><path d="M9 7h2v2H9z"></path></svg>
                  </button>`;
        }
        return '';
      }

      export async function showRecipeModal(meal) {
        if (!meal) return;
        const state = getState();
        const recipeModal = document.getElementById('recipe-modal');
        const url = `${state.recipeBaseUrl}${meal.recipeId}.md`;
        recipeModal.querySelector('#recipe-modal-title').textContent = meal.nomePasto;
        const body = recipeModal.querySelector('#recipe-modal-body');
        body.innerHTML = `<p>${UI_TEXT.RECIPE_MODAL_LOADING}</p>`;
        recipeModal.classList.remove('modal-hidden');
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Errore di rete: ${response.status}`);
          body.innerHTML = DOMPurify.sanitize(marked.parse(await response.text()));
        } catch (error) {
          body.innerHTML = `<p>${UI_TEXT.RECIPE_MODAL_LOAD_ERROR}</p>`;
          showNotification(UI_TEXT.RECIPE_LOAD_FAIL_MSG, 'error');
        }
      }

      export function showConfirmModal(title, message, onConfirm, type = 'secondary') {
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.querySelector('#confirm-modal-title').textContent = title;
        confirmModal.querySelector('#confirm-modal-message').textContent = message;
        const confirmBtn = confirmModal.querySelector('#confirm-modal-confirm-btn');
        const cancelBtn = confirmModal.querySelector('#confirm-modal-cancel-btn');
        confirmBtn.className = `btn btn-${type}`;
        confirmBtn.textContent = UI_TEXT.CONFIRM_MODAL_CONFIRM_BTN;
        cancelBtn.textContent = UI_TEXT.CONFIRM_MODAL_CANCEL_BTN;
        const cleanup = () => {
          confirmModal.classList.add('modal-hidden');
          cancelBtn.removeEventListener('click', cancelHandler);
          confirmBtn.removeEventListener('click', confirmHandler);
        };
        const cancelHandler = () => cleanup();
        const confirmHandler = () => { onConfirm(); cleanup(); };
        cancelBtn.addEventListener('click', cancelHandler, { once: true });
        confirmBtn.addEventListener('click', confirmHandler, { once: true });
        confirmModal.classList.remove('modal-hidden');
      }

      export function openSelectionModal(slotId) {
        const state = getState();
        const mealType = slotId.substring(11);
        const selectionModal = document.getElementById('selection-modal');
        selectionModal.querySelector('#selection-modal-title').textContent = `${UI_TEXT.SELECT_MEAL_TITLE} ${mealType}`;
        const list = selectionModal.querySelector('#selection-modal-list');
        const relevantMeals = state.masterMealList.filter(m => m.tipoPasto === mealType || m.tipoPasto === 'Tutti');
        list.innerHTML = relevantMeals.length > 0 ? relevantMeals.map(meal => `<div class="selection-item" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4><p>${meal.ingredienti || ''}</p></div>`).join('') : `<p>${UI_TEXT.NO_MEALS_AVAILABLE}</p>`;
        const closeAndReturn = () => {
          selectionModal.classList.add('modal-hidden');
          if (currentEditingDayISO) openDayEditorModal(currentEditingDayISO);
        };
        list.onclick = e => {
          const item = e.target.closest('.selection-item');
          if(item) { updateWeeklyPlan(slotId, item.dataset.mealId); closeAndReturn(); }
        };
        selectionModal.classList.remove('modal-hidden');
      }

      export function openDayEditorModal(isoDate) {
        currentEditingDayISO = isoDate;
        const state = getState();
        const dayEditorModal = document.getElementById('day-editor-modal');
        dayEditorModal.querySelector('#day-editor-title').textContent = `${UI_TEXT.EDITOR_MODAL_TITLE_PREFIX} ${formatFullDate(isoDate)}`;
        const body = dayEditorModal.querySelector('#day-editor-body');
        body.innerHTML = MEAL_TYPES.map(mealType => {
          const slotId = `${isoDate}-${mealType}`;
          const meal = state.weeklyPlan[slotId];
          let mealDetailsHTML = `<button class="btn-add-meal" data-slot-id="${slotId}">${UI_TEXT.ADD_MEAL_BTN}</button>`;
          if (meal) {
            mealDetailsHTML = `<div class="meal-details"><span class="meal-details__name">${meal.nomePasto}</span><div class="meal-actions">${getRecipeButtonHTML(meal, state)}<button class="btn-remove-meal" data-slot-id="${slotId}">&times;</button></div></div>`;
          }
          return `<div class="day-editor-slot"><span class="meal-type-label">${mealType}</span><div class="meal-details-container">${mealDetailsHTML}</div></div>`;
        }).join('');
        body.onclick = e => {
          const btnAdd = e.target.closest('.btn-add-meal');
          const btnRemove = e.target.closest('.btn-remove-meal');
          const btnRecipe = e.target.closest('.btn-view-recipe');
          if (btnAdd) { dayEditorModal.classList.add('modal-hidden'); openSelectionModal(btnAdd.dataset.slotId); }
          else if (btnRemove) { updateWeeklyPlan(btnRemove.dataset.slotId, null); openDayEditorModal(isoDate); }
          else if (btnRecipe) {
            const meal = Object.values(state.weeklyPlan).find(m => m && m.id === btnRecipe.dataset.mealId) || state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
            if (meal) showRecipeModal(meal);
          }
        };
        dayEditorModal.classList.remove('modal-hidden');
      }
  - file: src/ui/pageRenderers.js
    content: |
      import { calculateBMR } from '../core/calculations.js';
      import { BIOMETRIC_FIELDS, PROFILE_FIELDS, UI_TEXT } from '../utils/constants.js';

      function toISODateString(date) {
        return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
      }

      export function renderBiometricsPage(state) {
        const form = document.getElementById('biometrics-form');
        const tableBody = document.querySelector('#biometrics-table tbody');
        const tableHead = document.querySelector('#biometrics-table thead');
        form.innerHTML = `${BIOMETRIC_FIELDS.map(field => `<div class="form-group"><label for="bio-${field.id}">${field.label}</label>${field.type === 'textarea' ? `<textarea id="bio-${field.id}" name="${field.id}"></textarea>` : `<input type="${field.type}" id="bio-${field.id}" name="${field.id}" ${field.props || ''} ${field.id === 'date' ? `value="${toISODateString(new Date())}"` : ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.BIOMETRICS_SAVE_BTN}</button><button type="reset" class="btn btn-secondary">${UI_TEXT.BIOMETRICS_CLEAR_BTN}</button></div>`;
        tableHead.innerHTML = `<tr>${BIOMETRIC_FIELDS.map(f => `<th>${f.label}</th>`).join('')}<th>Azioni</th></tr>`;
        tableBody.innerHTML = state.biometricData.map(entry => `<tr data-date="${entry.date}">${BIOMETRIC_FIELDS.map(field => `<td>${entry[field.id] || ''}</td>`).join('')}<td class="biometrics-actions"><button class="btn-edit-biometrics" data-date="${entry.date}" title="Modifica">✏️</button><button class="btn-delete-biometrics" data-date="${entry.date}" title="Elimina">🗑️</button></td></tr>`).join('');
        
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
  - file: src/ui/plannerRenderer.js
    content: |
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
commands:
  - "echo 'Refactoring JavaScript completato. La logica di rendering e dei modali è ora suddivisa in moduli dedicati.'"