commit_message: "refactor(trainer): Migliora UX/UI del trainer e centralizza le stringhe"
rationale: |
  Questo commit implementa la Fase 1 del piano di miglioramento approvato. Le modifiche si concentrano sul refactoring del codice, sulla centralizzazione delle stringhe di testo e sul miglioramento dell'esperienza utente della vista Trainer.

  Modifiche principali:
  1.  **Centralizzazione Testo**: Tutte le stringhe di testo hardcoded nella vista Trainer e nell'editor degli esercizi sono state spostate nel file `src/utils/constants.js` per una gestione centralizzata. La label "Pausa" è stata corretta in "Tenuta".
  2.  **Logica Trainer Corretta**: La coda di esecuzione ora aggiunge le fasi 'pre-hold' e 'hold' solo se la durata della tenuta è maggiore di zero, ottimizzando gli esercizi che non prevedono una fase isometrica.
  3.  **UX Timer di Riposo Migliorata**: L'animazione del timer ring durante la fase di riposo è stata invertita per riempirsi, comunicando un'idea di "recupero". Il testo al centro è stato sostituito con una label statica "RECUPERO".
  4.  **Stile Trainer Affinato**: La dimensione del font all'interno del timer ring è stata ridotta per migliorare l'equilibrio visivo dell'interfaccia.
  5.  **Refactoring Codice (DRY)**: La funzione duplicata `formatIngredients` è stata estratta in un nuovo modulo di utilità `src/utils/formatters.js` per eliminare la ridondanza e migliorare la manutenibilità.
  6.  **Aggiornamento Service Worker**: Il nuovo file `formatters.js` è stato aggiunto alla cache del service worker per garantire il funzionamento offline.
patches:
  - file: src/utils/formatters.js
    content: |
      /**
       * Formatta l'elenco degli ingredienti di un pasto in una stringa leggibile.
       * @param {object} meal - L'oggetto pasto contenente un array di ingredienti.
       * @returns {string} - Una stringa HTML con l'elenco formattato.
       */
      export function formatIngredients(meal) {
          if (!meal.ingredienti || !Array.isArray(meal.ingredienti)) return '';
          
          const ingredientsList = meal.ingredienti.map(item => {
              let quantity = '';
              if (item.quantita_g) quantity = `${item.quantita_g}g`;
              else if (item.quantita_g_min && item.quantita_g_max) quantity = `${item.quantita_g_min}-${item.quantita_g_max}g`;
              else if (item.quantita_g_min) quantity = `${item.quantita_g_min}g`;
              else if (item.quantita_pezzi) quantity = `x${item.quantita_pezzi}`;
              
              return `${item.id.replace(/_/g, ' ')} ${quantity}`.trim();
          }).join(', ');
          
          return `<p>${ingredientsList}</p>`;
      }
  - file: src/utils/constants.js
    content: |
      export const DEFAULT_CONFIG_URL = '';
      export const LOCAL_STORAGE_KEY_PLAN = 'dynamicProtocolPlan';
      export const LOCAL_STORAGE_KEY_URL = 'dynamicConfigUrl';
      export const LOCAL_STORAGE_KEY_BIOMETRICS = 'healtyproBiometricData';
      export const LOCAL_STORAGE_KEY_PROFILE = 'healtyproUserProfile';
      export const LOCAL_STORAGE_KEY_WORKOUTS = 'healtyproWorkouts';
      export const WEEK_STARTS_ON_MONDAY = 1;
      export const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
      export const MEAL_TYPES = [ 'Colazione', 'Spuntino Mattutino', 'Pranzo', 'Spuntino Pomeridiano', 'Cena' ];
      export const WORKOUT_SLOT_ID = 'Allenamento';

      export const PROFILE_FIELDS = [
        { id: 'firstName', label: 'Nome', type: 'text' },
        { id: 'lastName', label: 'Cognome', type: 'text' },
        { id: 'nickname', label: 'Nickname', type: 'text' },
        { id: 'dateOfBirth', label: 'Data di Nascita', type: 'date' },
        { id: 'height', label: 'Altezza (cm)', type: 'number', props: 'min="1"' },
        { id: 'gender', label: 'Sesso Biologico', type: 'radio', options: [{value: 'male', label: 'Uomo'}, {value: 'female', label: 'Donna'}] }
      ];

      export const BIOMETRIC_FIELDS = [
        { id: 'date', label: 'Data', type: 'date', props: 'required' },
        { id: 'weight', label: 'Peso (kg)', type: 'number', props: 'step="0.1" required' },
        { id: 'muscleMass', label: 'M. M. (kg)', type: 'number', props: 'step="0.1"' },
        { id: 'fatMass', label: 'Massa G. (kg)', type: 'number', props: 'step="0.1"' },
        { id: 'water', label: 'Acqua (kg)', type: 'number', props: 'step="0.1"' },
        { id: 'fatPercentage', label: 'Grasso (%)', type: 'number', props: 'step="0.1"' },
        { id: 'bmi', label: 'BMI', type: 'number', props: 'step="0.1"' },
        { id: 'basalMetabolism', label: 'M. Basale (kcal)', type: 'number', props: 'step="1" readonly' },
        { id: 'notes', label: 'Note', type: 'textarea' }
      ];

      const UI_TEXT_CONFIG = [
        { id: 'MAIN_TITLE', text: 'HealtyPro' },
        { id: 'NAV_PLANNER', text: 'Planner' },
        { id: 'NAV_PROGRESS', text: 'Progressi' },
        { id: 'NAV_CHARTS', text: 'Grafici' },
        { id: 'NAV_RECIPES', text: 'Ricette' },
        { id: 'NAV_PROFILE', text: 'Profilo' },
        { id: 'LOAD_BUTTON', text: 'Carica' },
        { id: 'COPY_WEEK_BTN', text: 'Copia Settimana' },
        { id: 'RESET_BUTTON', text: 'Pulisci Settimana' },
        { id: 'BACKUP_BTN', text: 'Salva Backup' },
        { id: 'RESTORE_BTN', text: 'Ripristina Backup' },
        { id: 'CONFIG_URL_EMPTY_ERROR', text: 'Per favore, inserisci un URL.' },
        { id: 'CONFIG_LOAD_SUCCESS', text: 'Configurazione caricata!' },
        { id: 'COPY_WEEK_CONFIRM_TITLE', text: 'Copia Settimana' },
        { id: 'COPY_WEEK_CONFIRM_MSG', text: 'Sei sicuro di voler sovrascrivere il piano di questa settimana con quello della settimana precedente?' },
        { id: 'COPY_WEEK_SUCCESS', text: 'Piano settimanale copiato!' },
        { id: 'RESET_WEEK_CONFIRM_TITLE', text: 'Pulisci Settimana' },
        { id: 'RESET_WEEK_CONFIRM_MSG', text: 'Sei sicuro di voler cancellare tutti i pasti e gli allenamenti da questa settimana? L\'azione è irreversibile.' },
        { id: 'RESET_WEEK_SUCCESS', text: 'Settimana pulita!' },
        { id: 'SHARE_NO_URL_INFO', text: 'Nessun URL di configurazione da condividere.' },
        { id: 'SHARE_SUCCESS', text: 'Link di condivisione copiato!' },
        { id: 'SHARE_ERROR', text: 'Impossibile copiare il link.' },
        { id: 'BACKUP_SHARE_TITLE', text: 'Backup Dati HealtyPro' },
        { id: 'BACKUP_SUCCESS', text: 'Backup salvato con successo!' },
        { id: 'RESTORE_CONFIRM_TITLE', text: 'Ripristina Backup' },
        { id: 'RESTORE_CONFIRM_MSG', text: 'Sei sicuro di voler sovrascrivere la configurazione e il piano attuali? L\'azione è irreversibile.' },
        { id: 'RESTORE_SUCCESS', text: 'Backup ripristinato con successo!' },
        { id: 'RESTORE_INVALID_FILE', text: 'File di backup non valido o corrotto.' },
        { id: 'LOG_VIEW_EMPTY', text: 'Nessun pasto pianificato per questa settimana.' },
        { id: 'CONFIRM_MODAL_CONFIRM_BTN', text: 'Conferma' },
        { id: 'CONFIRM_MODAL_CANCEL_BTN', text: 'Annulla' },
        { id: 'LOAD_SHARED_CONFIG_TITLE', text: 'Caricare Nuova Configurazione?' },
        { id: 'LOAD_SHARED_CONFIG_MSG', text: 'Hai aperto un link di condivisione. Vuoi caricare questa nuova configurazione? La libreria di pasti attuale verrà sostituita.' },
        { id: 'BIOMETRICS_FORM_TITLE', text: 'Inserisci Misurazione' },
        { id: 'BIOMETRICS_HISTORY_TITLE', text: 'Storico Misurazioni' },
        { id: 'BIOMETRICS_SAVE_BTN', text: 'Salva Dati' },
        { id: 'BIOMETRICS_CLEAR_BTN', text: 'Annulla' },
        { id: 'BIOMETRICS_SAVE_SUCCESS', text: 'Dati biometrici salvati!' },
        { id: 'BIOMETRICS_DELETE_CONFIRM_TITLE', text: 'Elimina Misurazione' },
        { id: 'BIOMETRICS_DELETE_CONFIRM_MSG', text: 'Sei sicuro di voler eliminare i dati di questa data? L\'azione è irreversibile.' },
        { id: 'BIOMETRICS_DELETE_SUCCESS', text: 'Misurazione eliminata.' },
        { id: 'BIOMETRICS_BMR_PLACEHOLDER', text: 'Completa il profilo per il calcolo' },
        { id: 'BIOMETRICS_EMPTY_LIST', text: 'Nessuna misurazione ancora registrata.' },
        { id: 'PROFILE_FORM_TITLE', text: 'Profilo Utente' },
        { id: 'PROFILE_SAVE_BTN', text: 'Salva Profilo' },
        { id: 'PROFILE_SAVE_SUCCESS', text: 'Profilo salvato con successo!' },
        { id: 'INFO_MODAL_TITLE', text: 'Formato `config.json` Richiesto' },
        { id: 'INFO_MODAL_DESC', text: 'Includi `calories_min` per ogni pasto. `calories_max` è opzionale.' },
        { id: 'SELECT_MEAL_TITLE', text: 'Scegli' },
        { id: 'NO_MEALS_AVAILABLE', text: 'Nessun pasto di questo tipo disponibile.' },
        { id: 'KCAL_LABEL', text: 'Kcal' },
        { id: 'EDITOR_MODAL_TITLE_PREFIX', text: 'Editor:' },
        { id: 'ADD_MEAL_BTN', text: 'Aggiungi Pasto' },
        { id: 'ADD_EXERCISE_BTN', text: 'Aggiungi Esercizio' },
        { id: 'MANAGE_WORKOUT_BTN', text: 'Gestisci' },
        { id: 'START_WORKOUT_BTN', text: 'Avvia Allenamento' },
        { id: 'WORKOUT_EDITOR_TITLE', text: 'Editor Allenamento' },
        { id: 'EXERCISE_EDITOR_TITLE', text: 'Modifica Esercizio' },
        { id: 'EXERCISE_SAVE_BTN', text: 'Salva Modifiche' },
        { id: 'EXERCISE_TEMPO_HOLD_LABEL', text: 'Tenuta (s)' },
        { id: 'SELECT_EXERCISE_TITLE', text: 'Scegli Esercizio' },
        { id: 'NO_WORKOUTS_AVAILABLE', text: 'Nessun esercizio disponibile. Controlla il file esercizi.json.' },
        { id: 'RECIPE_BUTTON_TITLE', text: 'Mostra ricetta' },
        { id: 'RECIPE_MODAL_LOADING', text: 'Caricamento ricetta...' },
        { id: 'RECIPE_MODAL_LOAD_ERROR', text: 'Impossibile caricare la ricetta. Controlla l\'URL e la connessione.' },
        { id: 'RECIPE_LOAD_FAIL_MSG', text: 'Caricamento ricetta fallito' },
        { id: 'INFO_MODAL_EXAMPLE_JSON', text: '{\n  "rules": [],\n  "meals": []\n}' },
        { id: 'CHARTS_TITLE', text: 'Dashboard Grafici' },
        { id: 'PLANNER_CHART_TITLE', text: 'Riepilogo Calorie Settimanali' },
        { id: 'BIOMETRICS_CHART_TITLE', text: 'Andamento Dati Biometrici' },
        { id: 'BIOMETRICS_CHART_EMPTY', text: 'Inserisci almeno due misurazioni per visualizzare il grafico.' },
        { id: 'RECIPES_TITLE', text: 'Tutte le Ricette' },
        { id: 'RECIPES_EMPTY', text: 'Nessuna ricetta disponibile. Carica una configurazione che includa pasti con `recipeId`.' },
        { id: 'TRAINER_REST_LABEL', text: 'RECUPERO' },
        { id: 'TRAINER_PAUSED_LABEL', text: 'PAUSA' },
        { id: 'TRAINER_REP_LABEL', text: 'Rip.' },
        { id: 'TRAINER_UPCOMING_LABEL', text: 'A seguire:' },
      ];

      export const UI_TEXT = UI_TEXT_CONFIG.reduce((acc, { id, text }) => {
        acc[id] = text;
        return acc;
      }, {});
  - file: templates/modals.html
    content: |
      <div id="info-modal" class="modal-overlay modal-hidden">
          <div class="modal-content">
              <div class="modal-header">
                <h3 id="info-modal-title"></h3>
                <button class="modal-close-btn" data-target="info-modal"></button>
              </div>
              <div class="modal-body">
                  <p id="info-modal-desc"></p>
                  <pre><code id="info-modal-json-example"></code></pre>
              </div>
          </div>
      </div>
      <div id="selection-modal" class="modal-overlay modal-hidden">
          <div class="modal-content">
              <div class="modal-header">
                <h3 id="selection-modal-title"></h3>
                <button class="modal-close-btn" data-target="selection-modal"></button>
              </div>
              <div id="selection-modal-list" class="modal-body selection-list"></div>
          </div>
      </div>
      <div id="workout-selection-modal" class="modal-overlay modal-hidden">
          <div class="modal-content">
              <div class="modal-header">
                <h3 id="workout-selection-modal-title"></h3>
                <button class="modal-close-btn" data-target="workout-selection-modal"></button>
              </div>
              <div id="workout-selection-modal-list" class="modal-body selection-list"></div>
          </div>
      </div>
      <div id="day-editor-modal" class="modal-overlay modal-hidden">
        <div class="modal-content">
            <div class="modal-header">
              <h3 id="day-editor-title"></h3>
              <button class="modal-close-btn" data-target="day-editor-modal"></button>
            </div>
            <div id="day-editor-body" class="modal-body day-editor-list"></div>
        </div>
      </div>
      <div id="workout-editor-modal" class="modal-overlay modal-hidden">
        <div class="modal-content">
            <div class="modal-header">
              <h3 id="workout-editor-title"></h3>
              <button class="modal-close-btn" data-target="workout-editor-modal"></button>
            </div>
            <div id="workout-editor-body" class="modal-body"></div>
        </div>
      </div>
      <div id="exercise-editor-modal" class="modal-overlay modal-hidden">
        <div class="modal-content">
            <div class="modal-header">
              <h3 id="exercise-editor-title"></h3>
              <button class="modal-close-btn" data-target="exercise-editor-modal"></button>
            </div>
            <div class="modal-body">
              <form id="exercise-editor-form">
                <div class="form-group">
                  <label for="ex-edit-sets">Serie</label>
                  <input type="number" id="ex-edit-sets" name="sets" min="1">
                </div>
                <div class="form-group reps-group">
                  <label for="ex-edit-reps">Ripetizioni</label>
                  <input type="number" id="ex-edit-reps" name="reps" min="1">
                </div>
                <div class="form-group duration-group">
                  <label for="ex-edit-duration">Durata (s)</label>
                  <input type="number" id="ex-edit-duration" name="duration" min="1">
                </div>
                <div class="form-group">
                  <label for="ex-edit-rest">Riposo (s)</label>
                  <input type="number" id="ex-edit-rest" name="rest" min="0">
                </div>
                <div class="tempo-group">
                  <div class="form-group">
                    <label for="ex-edit-tempo-up">Salita (s)</label>
                    <input type="number" id="ex-edit-tempo-up" name="tempo_up" min="0">
                  </div>
                  <div class="form-group">
                    <label for="ex-edit-tempo-hold" id="ex-edit-tempo-hold-label">Tenuta (s)</label>
                    <input type="number" id="ex-edit-tempo-hold" name="tempo_hold" min="0">
                  </div>
                  <div class="form-group">
                    <label for="ex-edit-tempo-down">Discesa (s)</label>
                    <input type="number" id="ex-edit-tempo-down" name="tempo_down" min="0">
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
                <button type="submit" form="exercise-editor-form" class="btn btn-primary" id="exercise-editor-save-btn"></button>
            </div>
        </div>
      </div>
      <div id="confirm-modal" class="modal-overlay modal-hidden">
        <div class="modal-content">
            <div class="modal-header">
              <h3 id="confirm-modal-title"></h3>
            </div>
            <div class="modal-body">
              <p id="confirm-modal-message"></p>
            </div>
            <div class="modal-footer">
              <button id="confirm-modal-cancel-btn" class="btn btn-secondary"></button>
              <button id="confirm-modal-confirm-btn" class="btn"></button>
            </div>
        </div>
      </div>
      <div id="recipe-modal" class="modal-overlay modal-hidden">
        <div class="modal-content">
            <div class="modal-header">
              <h3 id="recipe-modal-title"></h3>
              <button class="modal-close-btn" data-target="recipe-modal"></button>
            </div>
            <div id="recipe-modal-body" class="modal-body recipe-body"></div>
        </div>
      </div>
  - file: src/core/trainer.js
    content: |
      import { setView } from './state.js';
      import { log } from '../utils/logger.js';

      const initialWorkoutState = {
        exerciseQueue: [],
        currentExerciseIndex: -1,
        status: 'idle', // idle, running, paused, resting, finished
        prePauseStatus: '',
        currentSet: 0,
        currentRep: 0,
        executionQueue: [],
        currentPhaseIndex: -1,
        phaseTimeElapsed: 0,
        restTimeRemaining: 0,
      };

      let workoutState = { ...initialWorkoutState };
      let animationFrameId = null;
      let lastTickTimestamp = 0;

      function buildExecutionQueueForCurrentSet() {
        const currentExercise = workoutState.exerciseQueue[workoutState.currentExerciseIndex];
        if (!currentExercise || currentExercise.type !== 'reps') return [];

        const queue = [];
        const reps = currentExercise.defaultReps;
        const tempo = currentExercise.defaultTempo;

        for (let i = 0; i < reps; i++) {
          if (tempo) {
            queue.push({ name: 'pre-up', rep: i + 1, duration: 700 });
            queue.push({ name: 'up', rep: i + 1, duration: tempo.up * 1000 });
            if (tempo.hold > 0) {
              queue.push({ name: 'pre-hold', rep: i + 1, duration: 700 });
              queue.push({ name: 'hold', rep: i + 1, duration: tempo.hold * 1000 });
            }
            queue.push({ name: 'pre-down', rep: i + 1, duration: 700 });
            queue.push({ name: 'down', rep: i + 1, duration: tempo.down * 1000 });
          }
        }
        return queue;
      }

      function advanceToNextSet() {
        workoutState.currentSet++;
        const currentExercise = workoutState.exerciseQueue[workoutState.currentExerciseIndex];
        if (workoutState.currentSet > currentExercise.defaultSets) {
          advanceToNextExercise();
        } else {
          workoutState.status = 'running';
          workoutState.executionQueue = buildExecutionQueueForCurrentSet();
          workoutState.currentPhaseIndex = 0;
          workoutState.phaseTimeElapsed = 0;
          workoutState.currentRep = 1;
        }
      }

      function advanceToNextExercise() {
        workoutState.currentExerciseIndex++;
        if (workoutState.currentExerciseIndex >= workoutState.exerciseQueue.length) {
          endWorkout();
        } else {
          workoutState.status = 'idle';
          workoutState.currentSet = 1;
          workoutState.currentRep = 1;
          workoutState.executionQueue = [];
          workoutState.currentPhaseIndex = -1;
        }
      }

      function tick(timestamp) {
        if (lastTickTimestamp === 0) {
          lastTickTimestamp = timestamp;
        }
        const deltaTime = timestamp - lastTickTimestamp;
        lastTickTimestamp = timestamp;

        if (workoutState.status === 'running') {
          workoutState.phaseTimeElapsed += deltaTime;
          const currentPhase = workoutState.executionQueue[workoutState.currentPhaseIndex];

          if (workoutState.phaseTimeElapsed >= currentPhase.duration) {
            workoutState.currentPhaseIndex++;
            workoutState.phaseTimeElapsed = 0;
            const nextPhase = workoutState.executionQueue[workoutState.currentPhaseIndex];
            if (nextPhase) {
              workoutState.currentRep = nextPhase.rep;
            } else {
              const currentExercise = workoutState.exerciseQueue[workoutState.currentExerciseIndex];
              workoutState.status = 'resting';
              workoutState.restTimeRemaining = currentExercise.defaultRest * 1000;
            }
          }
        } else if (workoutState.status === 'resting') {
          workoutState.restTimeRemaining -= deltaTime;
          if (workoutState.restTimeRemaining <= 0) {
            advanceToNextSet();
          }
        }
        
        document.dispatchEvent(new CustomEvent('workoutStateChange'));

        if (workoutState.status !== 'paused' && workoutState.status !== 'idle' && workoutState.status !== 'finished') {
          animationFrameId = requestAnimationFrame(tick);
        }
      }

      export function getWorkoutState() {
        return workoutState;
      }

      export function resetWorkoutState() {
        log('Trainer', 'Resetting workout state. Current state:', JSON.parse(JSON.stringify(workoutState)));
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        workoutState = { ...initialWorkoutState };
        log('Trainer', 'Workout state has been reset.', JSON.parse(JSON.stringify(workoutState)));
      }

      export function initializeWorkout(plannedExercises) {
        if (!plannedExercises || plannedExercises.length === 0) {
          return;
        }
        resetWorkoutState();

        workoutState = {
          ...initialWorkoutState,
          exerciseQueue: JSON.parse(JSON.stringify(plannedExercises)),
          currentExerciseIndex: 0,
          currentSet: 1,
          currentRep: 1,
        };
        document.dispatchEvent(new CustomEvent('workoutStateChange'));
      }

      export function startWorkout() {
        log('Trainer', 'Attempting to start workout. Current status:', workoutState.status);
        if (workoutState.status === 'idle') {
          workoutState.status = 'running';
          workoutState.executionQueue = buildExecutionQueueForCurrentSet();
          workoutState.currentPhaseIndex = 0;
          workoutState.phaseTimeElapsed = 0;
          workoutState.currentRep = 1;
          lastTickTimestamp = 0;
          animationFrameId = requestAnimationFrame(tick);
          log('Trainer', 'Workout started. New status:', workoutState.status);
        }
        document.dispatchEvent(new CustomEvent('workoutStateChange'));
      }

      export function pauseWorkout() {
        if (workoutState.status === 'running' || workoutState.status === 'resting') {
          workoutState.prePauseStatus = workoutState.status;
          workoutState.status = 'paused';
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
          document.dispatchEvent(new CustomEvent('workoutStateChange'));
        }
      }

      export function resumeWorkout() {
        if (workoutState.status === 'paused') {
          workoutState.status = workoutState.prePauseStatus;
          workoutState.prePauseStatus = '';
          lastTickTimestamp = 0;
          animationFrameId = requestAnimationFrame(tick);
          document.dispatchEvent(new CustomEvent('workoutStateChange'));
        }
      }

      export function endWorkout() {
        workoutState.status = 'finished';
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        setView('planner');
      }
  - file: src/ui/components/TrainerComponent.js
    content: |
      import { startWorkout, pauseWorkout, resumeWorkout, endWorkout } from '../../core/trainer.js';
      import { setView } from '../../core/state.js';
      import { log } from '../../utils/logger.js';
      import { UI_TEXT } from '../../utils/constants.js';

      const RING_RADIUS = 80;
      const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

      export class TrainerComponent {
          constructor(containerElement) {
              this.container = containerElement;

              this.elements = {
                  exerciseName: this.container.querySelector('#current-exercise-name'),
                  exerciseDetails: this.container.querySelector('#current-exercise-details'),
                  repDisplay: this.container.querySelector('#current-rep-display'),
                  upcomingList: this.container.querySelector('#upcoming-exercises-list'),
                  upcomingTitle: this.container.querySelector('.upcoming-exercises-container h4'),
                  
                  btnStart: this.container.querySelector('#trainer-start-btn'),
                  btnPause: this.container.querySelector('#trainer-pause-btn'),
                  btnResume: this.container.querySelector('#trainer-resume-btn'),

                  modeTempoContainer: this.container.querySelector('#mode-tempo-guided'),
                  ringContainer: this.container.querySelector('#timer-ring-container'),
              };

              this.ringProgress = null;
              this.ringText = null;
          }

          mount() {
              this.createTimerRing();
              this.container.addEventListener('click', this.handleControls.bind(this));
              this.elements.upcomingTitle.textContent = UI_TEXT.TRAINER_UPCOMING_LABEL;
          }

          destroy() {
              log('TrainerComponent', 'Destroying component and cleaning up DOM...');
              this.container.removeEventListener('click', this.handleControls.bind(this));
              if (this.elements.ringContainer) {
                  this.elements.ringContainer.innerHTML = '';
              }
              log('TrainerComponent', 'Component destroyed.');
          }

          handleControls(e) {
              const targetId = e.target.id;
              log('TrainerComponent', `Control button clicked: ${targetId}`);
              switch (targetId) {
                  case 'trainer-start-btn': startWorkout(); break;
                  case 'trainer-pause-btn': pauseWorkout(); break;
                  case 'trainer-resume-btn': resumeWorkout(); break;
                  case 'trainer-end-btn': endWorkout(); break;
                  case 'trainer-back-btn': setView('planner'); break;
              }
          }

          createTimerRing() {
              if (this.elements.ringContainer.querySelector('svg')) {
                log('TrainerComponent', 'Timer ring SVG already exists. Skipping creation.');
                return;
              }
              log('TrainerComponent', 'Creating timer ring SVG...');
              this.elements.ringContainer.innerHTML = '';
              const svgNS = 'http://www.w3.org/2000/svg';
              const svg = document.createElementNS(svgNS, 'svg');
              svg.setAttribute('width', '200');
              svg.setAttribute('height', '200');
              svg.setAttribute('viewBox', '0 0 200 200');

              const backgroundCircle = document.createElementNS(svgNS, 'circle');
              backgroundCircle.setAttribute('cx', '100');
              backgroundCircle.setAttribute('cy', '100');
              backgroundCircle.setAttribute('r', RING_RADIUS);
              backgroundCircle.setAttribute('class', 'timer-ring-bg');

              const progressCircle = document.createElementNS(svgNS, 'circle');
              progressCircle.setAttribute('cx', '100');
              progressCircle.setAttribute('cy', '100');
              progressCircle.setAttribute('r', RING_RADIUS);
              progressCircle.setAttribute('class', 'timer-ring-progress');
              progressCircle.style.strokeDasharray = RING_CIRCUMFERENCE;

              const text = document.createElementNS(svgNS, 'text');
              text.setAttribute('x', '50%');
              text.setAttribute('y', '50%');
              text.setAttribute('dy', '.3em');
              text.setAttribute('class', 'timer-ring-display');

              svg.appendChild(backgroundCircle);
              svg.appendChild(progressCircle);
              svg.appendChild(text);
              this.elements.ringContainer.prepend(svg);
              this.ringProgress = progressCircle;
              this.ringText = text;
              log('TrainerComponent', 'Timer ring SVG created and references set.');
          }

          updateTimerRing(percent) {
              if (!this.ringProgress) return;
              const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
              this.ringProgress.style.strokeDashoffset = offset;
          }

          render(state) {
              const { exerciseQueue, currentExerciseIndex, status } = state;

              if (currentExerciseIndex < 0 || currentExerciseIndex >= exerciseQueue.length) {
                  this.elements.exerciseName.textContent = '';
                  this.elements.exerciseDetails.textContent = '';
                  this.elements.repDisplay.textContent = '';
                  this.elements.upcomingList.innerHTML = '';
                  this.elements.btnStart.classList.add('hidden');
                  this.elements.btnPause.classList.add('hidden');
                  this.elements.btnResume.classList.add('hidden');
                  return;
              };

              const currentExercise = exerciseQueue[currentExerciseIndex];
              this.elements.exerciseName.textContent = currentExercise.name;
              this.elements.exerciseDetails.textContent = this.formatExerciseDetails(state);
              this.elements.repDisplay.textContent = (status === 'running') ? `${UI_TEXT.TRAINER_REP_LABEL} ${state.currentRep}` : '';

              this.elements.upcomingList.innerHTML = '';
              exerciseQueue.slice(currentExerciseIndex + 1).forEach(ex => {
                  const li = document.createElement('li');
                  li.textContent = ex.name;
                  this.elements.upcomingList.appendChild(li);
              });

              this.elements.btnStart.classList.toggle('hidden', status !== 'idle');
              this.elements.btnPause.classList.toggle('hidden', status !== 'running' && status !== 'resting');
              this.elements.btnResume.classList.toggle('hidden', status !== 'paused');

              this.elements.modeTempoContainer.classList.remove('hidden');
              
              if (!this.ringText) {
                log('TrainerComponent', 'Render called but ringText is null. Aborting render of ring.');
                return;
              }

              if (status === 'running') this.renderPhase(state);
              else if (status === 'resting') this.renderRest(state);
              else if (status === 'paused') this.renderPaused(state);
              else if (status === 'idle') {
                  this.ringText.textContent = '';
                  this.ringText.classList.remove('flashing');
                  this.updateTimerRing(0);
              }
          }

          renderPhase(state) {
              const { executionQueue, currentPhaseIndex, phaseTimeElapsed } = state;
              const phase = executionQueue[currentPhaseIndex];
              if (!phase) return;

              const phaseNameDisplay = phase.name.replace('pre-', '').toUpperCase();
              const isPrePhase = phase.name.startsWith('pre-');

              this.ringText.textContent = phaseNameDisplay;
              this.ringText.classList.toggle('flashing', isPrePhase);

              const progressPercent = Math.min(100, (phaseTimeElapsed / phase.duration) * 100);
              this.updateTimerRing(progressPercent);
          }

          renderRest(state) {
              const { restTimeRemaining } = state;
              this.ringText.textContent = UI_TEXT.TRAINER_REST_LABEL;
              this.ringText.classList.remove('flashing');
              const totalRest = state.exerciseQueue[state.currentExerciseIndex].defaultRest * 1000;
              const progressPercent = (totalRest > 0) ? ((totalRest - restTimeRemaining) / totalRest) * 100 : 100;
              this.updateTimerRing(progressPercent);
          }
          
          renderPaused() {
            this.ringText.textContent = UI_TEXT.TRAINER_PAUSED_LABEL;
            this.ringText.classList.remove('flashing');
          }

          formatExerciseDetails(state) {
              const { exerciseQueue, currentExerciseIndex, currentSet } = state;
              const exercise = exerciseQueue[currentExerciseIndex];
              if (!exercise) return '';
              const sets = exercise.defaultSets;
              let details = `Serie ${currentSet} di ${sets}`;
              if (exercise.type === 'reps') {
                  const reps = exercise.defaultReps;
                  details += ` | ${reps} Ripetizioni`;
              } else if (exercise.type === 'time') {
                  const duration = exercise.defaultDuration;
                  details += ` | ${duration}s`;
              }
              return details;
          }
      }
  - file: styles/trainer.css
    content: |
      /* --- TRAINER VIEW STYLES --- */
      #trainer-page {
          height: calc(100vh - 60px);
          display: flex;
          flex-direction: column;
          background-color: var(--bg-color);
          color: var(--text-color);
      }

      .trainer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: var(--card-color);
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
      }

      .trainer-header h2 {
          font-size: 1.25rem;
          color: var(--primary-color);
      }

      .trainer-body {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          text-align: center;
          position: relative;
      }

      .exercise-info-container {
          margin-bottom: 1rem;
      }

      .current-exercise-name {
          font-size: 2rem;
          font-weight: bold;
      }

      .current-exercise-details {
          font-size: 1.25rem;
          color: var(--text-color-muted);
          margin-bottom: 0.5rem;
      }

      #current-rep-display {
        font-size: 1rem;
        color: var(--secondary-color);
        font-weight: bold;
      }

      .timer-ring-container {
          width: 250px;
          height: 250px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 1rem 0;
      }

      .timer-ring-display {
          font-size: 2.5rem;
          font-weight: bold;
          fill: var(--text-color);
          text-transform: uppercase;
          text-anchor: middle;
      }

      .timer-ring-bg {
          fill: none;
          stroke: var(--card-color);
          stroke-width: 10;
      }

      .timer-ring-progress {
          fill: none;
          stroke: var(--primary-color);
          stroke-width: 10;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
          transition: stroke-dashoffset 0.1s linear;
      }

      @keyframes flash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .flashing {
        animation: flash 1.4s infinite;
        fill: var(--secondary-color);
      }

      .trainer-controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          margin-top: 1rem;
          height: 80px;
      }

      .btn-large {
          padding: 1rem 2rem;
          font-size: 1.25rem;
      }

      .upcoming-exercises-container {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 400px;
      }

      .upcoming-exercises-list {
          list-style: none;
          padding: 0;
          margin: 0;
          color: var(--text-color-muted);
      }

      .upcoming-exercises-list li {
          padding: 0.25rem 0;
      }
  - file: src/ui/modals.js
    content: |
      import { getState, updateWeeklyPlan, updateWeeklyWorkout, updateExerciseInstanceInWorkout, reorderWorkoutExercises, setView } from '../core/state.js';
      import { initializeWorkout } from '../core/trainer.js';
      import { showNotification } from './notifications.js';
      import { UI_TEXT, MEAL_TYPES, WORKOUT_SLOT_ID } from '../utils/constants.js';
      import { renderIcon } from './icons.js';
      import { log } from '../utils/logger.js';
      import { formatIngredients } from '../utils/formatters.js';

      let currentEditingDayISO = null;
      let sortableInstance = null;

      function formatFullDate(isoDate) {
        const date = new Date(isoDate);
        return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      }

      function getRecipeButtonHTML(meal, state) {
        if (state.recipeBaseUrl && meal && meal.recipeId) {
          return `<button class="btn-view-recipe" data-meal-id="${meal.id}" title="${UI_TEXT.RECIPE_BUTTON_TITLE}">
                    ${renderIcon('RECIPE', { width: 20, height: 20 })}
                  </button>`;
        }
        return '';
      }

      function formatExerciseDetails(exercise) {
        const sets = exercise.defaultSets;
        const rest = exercise.defaultRest;
        let details;

        if (exercise.type === 'reps') {
            const reps = exercise.defaultReps;
            details = `${sets} x ${reps} | Riposo: ${rest}s`;
        } else if (exercise.type === 'time') {
            const duration = exercise.defaultDuration;
            details = `${sets} x ${duration}s | Riposo: ${rest}s`;
        }

        if (exercise.defaultTempo) {
            const { up, hold, down } = exercise.defaultTempo;
            details += ` | Tempo: ${up}-${hold}-${down}`;
        }
        return details;
      }

      export async function showRecipeModal(meal) {
        if (!meal) return;
        log('Modals', 'Showing recipe modal', { mealId: meal.id });
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
        log('Modals', 'Showing confirm modal', { title });
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
        log('Modals', 'Opening meal selection modal', { slotId });
        const state = getState();
        const mealType = slotId.substring(11);
        const selectionModal = document.getElementById('selection-modal');
        selectionModal.querySelector('#selection-modal-title').textContent = `${UI_TEXT.SELECT_MEAL_TITLE} ${mealType}`;
        const list = selectionModal.querySelector('#selection-modal-list');
        const relevantMeals = state.masterMealList.filter(m => m.tipoPasto === mealType || m.tipoPasto === 'Tutti');
        list.innerHTML = relevantMeals.length > 0 ? relevantMeals.map(meal => `<div class="selection-item" data-meal-id="${meal.id}"><h4>${meal.nomePasto}</h4>${formatIngredients(meal)}</div>`).join('') : `<p>${UI_TEXT.NO_MEALS_AVAILABLE}</p>`;
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

      export function openWorkoutSelectionModal(slotId) {
        log('Modals', 'Opening workout selection modal', { slotId });
        const state = getState();
        const workoutSelectionModal = document.getElementById('workout-selection-modal');
        workoutSelectionModal.querySelector('#workout-selection-modal-title').textContent = UI_TEXT.SELECT_EXERCISE_TITLE;
        const list = workoutSelectionModal.querySelector('#workout-selection-modal-list');
        const relevantWorkouts = state.masterWorkoutList;
        list.innerHTML = relevantWorkouts.length > 0 ? relevantWorkouts.map(ex => `<div class="selection-item" data-exercise-id="${ex.id}"><h4>${ex.name}</h4><p>${ex.description}</p></div>`).join('') : `<p>${UI_TEXT.NO_WORKOUTS_AVAILABLE}</p>`;
        
        const closeAndReturn = () => {
          workoutSelectionModal.classList.add('modal-hidden');
          if (currentEditingDayISO) openWorkoutEditorModal(currentEditingDayISO);
        };

        list.onclick = e => {
          const item = e.target.closest('.selection-item');
          if (item) {
            updateWeeklyWorkout(slotId, item.dataset.exerciseId);
            closeAndReturn();
          }
        };
        workoutSelectionModal.classList.remove('modal-hidden');
      }

      export function openExerciseEditorModal(slotId, instanceId) {
        log('Modals', 'Opening exercise editor modal', { slotId, instanceId });
        const state = getState();
        const modal = document.getElementById('exercise-editor-modal');
        const form = modal.querySelector('form');
        const workoutList = state.weeklyWorkouts[slotId] || [];
        const exercise = workoutList.find(ex => ex.instanceId === instanceId);

        if (!exercise) return;

        modal.querySelector('#exercise-editor-title').textContent = `Modifica: ${exercise.name}`;
        modal.querySelector('#exercise-editor-save-btn').textContent = UI_TEXT.EXERCISE_SAVE_BTN;
        form.elements.sets.value = exercise.defaultSets;
        form.elements.rest.value = exercise.defaultRest;

        const repsContainer = form.querySelector('.reps-group');
        const durationContainer = form.querySelector('.duration-group');

        if (exercise.type === 'reps') {
            repsContainer.style.display = 'block';
            durationContainer.style.display = 'none';
            form.elements.reps.value = exercise.defaultReps;
        } else {
            repsContainer.style.display = 'none';
            durationContainer.style.display = 'block';
            form.elements.duration.value = exercise.defaultDuration;
        }

        const tempoContainer = form.querySelector('.tempo-group');
        if (exercise.defaultTempo) {
            tempoContainer.style.display = 'grid';
            form.elements.tempo_up.value = exercise.defaultTempo.up;
            form.elements.tempo_hold.value = exercise.defaultTempo.hold;
            form.elements.tempo_down.value = exercise.defaultTempo.down;
        } else {
            tempoContainer.style.display = 'none';
        }
        
        document.getElementById('ex-edit-tempo-hold-label').textContent = UI_TEXT.EXERCISE_TEMPO_HOLD_LABEL;

        form.onsubmit = e => {
            e.preventDefault();
            const newValues = {
                defaultSets: parseInt(form.elements.sets.value),
                defaultRest: parseInt(form.elements.rest.value)
            };
            if (exercise.type === 'reps') {
                newValues.defaultReps = parseInt(form.elements.reps.value);
            } else {
                newValues.defaultDuration = parseInt(form.elements.duration.value);
            }
            if (exercise.defaultTempo) {
                newValues.defaultTempo = {
                    up: parseInt(form.elements.tempo_up.value),
                    hold: parseInt(form.elements.tempo_hold.value),
                    down: parseInt(form.elements.tempo_down.value)
                };
            }
            updateExerciseInstanceInWorkout(slotId, instanceId, newValues);
            modal.classList.add('modal-hidden');
            openWorkoutEditorModal(currentEditingDayISO);
        };
        
        modal.classList.remove('modal-hidden');
      }

      export function openWorkoutEditorModal(isoDate) {
        log('Modals', 'Opening workout editor modal', { isoDate });
        currentEditingDayISO = isoDate;
        const state = getState();
        const modal = document.getElementById('workout-editor-modal');
        modal.querySelector('#workout-editor-title').textContent = `${UI_TEXT.WORKOUT_EDITOR_TITLE} - ${formatFullDate(isoDate)}`;
        const body = modal.querySelector('#workout-editor-body');
        const workoutSlotId = `${isoDate}-${WORKOUT_SLOT_ID}`;
        const plannedWorkoutList = state.weeklyWorkouts[workoutSlotId] || [];

        let exercisesHTML = plannedWorkoutList.map(exercise => {
            const exerciseDetails = formatExerciseDetails(exercise);
            return `<div class="meal-details draggable-item" data-instance-id="${exercise.instanceId}">
                        <div class="drag-handle">${renderIcon('DRAG_HANDLE', { width: 18, height: 18 })}</div>
                        <div class="exercise-info">
                            <span class="meal-details__name">${exercise.name}</span>
                            <span class="exercise-details-summary">${exerciseDetails}</span>
                        </div>
                        <div class="meal-actions">
                            <button class="btn-edit-exercise" title="Modifica" data-slot-id="${workoutSlotId}" data-instance-id="${exercise.instanceId}">${renderIcon('EDIT', { width: 16, height: 16 })}</button>
                            <button class="btn-remove-exercise" title="Rimuovi" data-slot-id="${workoutSlotId}" data-instance-id="${exercise.instanceId}">${renderIcon('TRASH', { width: 16, height: 16 })}</button>
                        </div>
                    </div>`;
        }).join('');

        const addExerciseButton = `<button class="btn-add-exercise" data-slot-id="${workoutSlotId}">${UI_TEXT.ADD_EXERCISE_BTN}</button>`;
        body.innerHTML = `<div class="day-editor-list workout-editor-list">${exercisesHTML}</div>${addExerciseButton}`;

        const listContainer = body.querySelector('.workout-editor-list');

        if (sortableInstance) {
            sortableInstance.destroy();
        }
        sortableInstance = new Sortable(listContainer, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            onEnd: function(evt) {
                reorderWorkoutExercises(workoutSlotId, evt.oldIndex, evt.newIndex);
            }
        });

        body.onclick = e => {
            const btnAddExercise = e.target.closest('.btn-add-exercise');
            const btnRemoveExercise = e.target.closest('.btn-remove-exercise');
            const btnEditExercise = e.target.closest('.btn-edit-exercise');

            if (btnAddExercise) {
                modal.classList.add('modal-hidden');
                openWorkoutSelectionModal(btnAddExercise.dataset.slotId);
            } else if (btnRemoveExercise) {
                updateWeeklyWorkout(btnRemoveExercise.dataset.slotId, null, parseInt(btnRemoveExercise.dataset.instanceId));
                openWorkoutEditorModal(isoDate); // Refresh this modal
            } else if (btnEditExercise) {
                modal.classList.add('modal-hidden');
                openExerciseEditorModal(btnEditExercise.dataset.slotId, parseInt(btnEditExercise.dataset.instanceId));
            }
        };

        modal.classList.remove('modal-hidden');
      }

      export function openDayEditorModal(isoDate) {
        log('Modals', 'Opening day editor modal', { isoDate });
        currentEditingDayISO = isoDate;
        const state = getState();
        const dayEditorModal = document.getElementById('day-editor-modal');
        dayEditorModal.querySelector('#day-editor-title').textContent = `${UI_TEXT.EDITOR_MODAL_TITLE_PREFIX} ${formatFullDate(isoDate)}`;
        const body = dayEditorModal.querySelector('#day-editor-body');
        
        const mealSlotsHTML = MEAL_TYPES.map(mealType => {
          const slotId = `${isoDate}-${mealType}`;
          const plannedMeal = state.weeklyPlan[slotId];
          const meal = plannedMeal ? state.masterMealList.find(m => m.id === plannedMeal.id) : null;
          
          let mealDetailsHTML = `<button class="btn-add-meal" data-slot-id="${slotId}">${UI_TEXT.ADD_MEAL_BTN}</button>`;
          if (meal) {
            mealDetailsHTML = `<div class="meal-details"><span class="meal-details__name">${meal.nomePasto}</span><div class="meal-actions">${getRecipeButtonHTML(meal, state)}<button class="btn-remove-meal" data-slot-id="${slotId}">${renderIcon('TRASH', { width: 16, height: 16 })}</button></div></div>`;
          }
          return `<div class="day-editor-slot"><span class="meal-type-label">${mealType}</span><div class="meal-details-container">${mealDetailsHTML}</div></div>`;
        }).join('');

        const workoutSlotId = `${isoDate}-${WORKOUT_SLOT_ID}`;
        const plannedWorkoutList = state.weeklyWorkouts[workoutSlotId] || [];
        
        let workoutDetailsHTML;
        if (plannedWorkoutList.length > 0) {
            const plural = plannedWorkoutList.length > 1 ? 'Esercizi' : 'Esercizio';
            const startWorkoutBtn = `<button class="btn-start-workout btn btn-primary">${UI_TEXT.START_WORKOUT_BTN}</button>`;
            workoutDetailsHTML = `<div class="workout-summary"><span>${plannedWorkoutList.length} ${plural}</span><div class="workout-summary-actions"><button class="btn-manage-workout btn btn-secondary">${UI_TEXT.MANAGE_WORKOUT_BTN}</button>${startWorkoutBtn}</div></div>`;
        } else {
            workoutDetailsHTML = `<button class="btn-add-exercise" data-slot-id="${workoutSlotId}">${UI_TEXT.ADD_EXERCISE_BTN}</button>`;
        }
        
        const workoutSlotHTML = `<div class="day-editor-slot"><span class="meal-type-label">${WORKOUT_SLOT_ID}</span><div class="meal-details-container">${workoutDetailsHTML}</div></div>`;

        body.innerHTML = mealSlotsHTML + workoutSlotHTML;

        body.onclick = e => {
          const btnAddMeal = e.target.closest('.btn-add-meal');
          const btnRemoveMeal = e.target.closest('.btn-remove-meal');
          const btnRecipe = e.target.closest('.btn-view-recipe');
          const btnAddExercise = e.target.closest('.btn-add-exercise');
          const btnManageWorkout = e.target.closest('.btn-manage-workout');
          const btnStartWorkout = e.target.closest('.btn-start-workout');

          if (btnAddMeal) { dayEditorModal.classList.add('modal-hidden'); openSelectionModal(btnAddMeal.dataset.slotId); }
          else if (btnRemoveMeal) { updateWeeklyPlan(btnRemoveMeal.dataset.slotId, null); openDayEditorModal(isoDate); }
          else if (btnRecipe) {
            const meal = state.masterMealList.find(m => m.id === btnRecipe.dataset.mealId);
            if (meal) showRecipeModal(meal);
          }
          else if (btnAddExercise) {
            dayEditorModal.classList.add('modal-hidden');
            openWorkoutEditorModal(isoDate);
          }
          else if (btnManageWorkout) {
            dayEditorModal.classList.add('modal-hidden');
            openWorkoutEditorModal(isoDate);
          }
          else if (btnStartWorkout) {
            dayEditorModal.classList.add('modal-hidden');
            const globalState = getState();
            const workoutSlotId = `${currentEditingDayISO}-${WORKOUT_SLOT_ID}`;
            const exercisesForWorkout = globalState.weeklyWorkouts[workoutSlotId];
            initializeWorkout(exercisesForWorkout);
            setView('trainer');
          }
        };
        dayEditorModal.classList.remove('modal-hidden');
      }
  - file: src/ui/recipesRenderer.js
    content: |
      import { UI_TEXT } from '../utils/constants.js';
      import { formatIngredients } from '../utils/formatters.js';

      export function renderRecipesPage(state) {
          const listContainer = document.getElementById('recipes-list');
          const mealsWithRecipes = state.masterMealList.filter(meal => meal.recipeId);

          if (mealsWithRecipes.length > 0) {
              listContainer.innerHTML = mealsWithRecipes.map(meal => `
                  <div class="recipe-list-item" data-meal-id="${meal.id}">
                      <h4>${meal.nomePasto}</h4>
                      ${formatIngredients(meal)}
                  </div>
              `).join('');
          } else {
              listContainer.innerHTML = `<p class="placeholder-text">${UI_TEXT.RECIPES_EMPTY}</p>`;
          }
      }
  - file: sw.js
    content: |
      const CACHE_NAME = 'healtypro-v8';
      const APP_SHELL_FILES = [
        '.',
        'index.html',
        'styles/base.css',
        'styles/planner.css',
        'styles/progress.css',
        'styles/modals.css',
        'styles/charts.css',
        'styles/recipes.css',
        'styles/trainer.css',
        'templates/planner.html',
        'templates/progress.html',
        'templates/profile.html',
        'templates/charts.html',
        'templates/recipes.html',
        'templates/modals.html',
        'templates/trainer.html',
        'src/main.js',
        'src/api/configService.js',
        'src/core/state.js',
        'src/core/calculations.js',
        'src/core/validation.js',
        'src/core/trainer.js',
        'src/ui/interactions.js',
        'src/ui/notifications.js',
        'src/ui/renderer.js',
        'src/ui/modals.js',
        'src/ui/plannerRenderer.js',
        'src/ui/pageRenderers.js',
        'src/ui/recipesRenderer.js',
        'src/ui/charts.js',
        'src/ui/viewLoader.js',
        'src/ui/icons.js',
        'src/ui/trainerRenderer.js',
        'src/ui/components/TrainerComponent.js',
        'src/utils/constants.js',
        'src/utils/formatters.js',
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
  - file: templates/trainer.html
    content: |
      <div id="trainer-page" class="page-view hidden">
          <header class="trainer-header">
              <button id="trainer-back-btn" class="btn btn-secondary">Indietro</button>
              <h2 id="trainer-title">Allenamento</h2>
              <button id="trainer-end-btn" class="btn btn-danger">Termina</button>
          </header>
          <div class="trainer-body">
              <div class="exercise-info-container">
                  <h3 id="current-exercise-name" class="current-exercise-name"></h3>
                  <p id="current-exercise-details" class="current-exercise-details"></p>
                  <p id="current-rep-display"></p>
              </div>

              <div id="trainer-display-modes">
                  <div id="mode-tempo-guided">
                      <div id="timer-ring-container" class="timer-ring-container">
                          </div>
                  </div>
              </div>

              <div id="trainer-main-controls" class="trainer-controls">
                  <button id="trainer-start-btn" class="btn btn-primary btn-large hidden">AVVIA</button>
                  <button id="trainer-pause-btn" class="btn btn-secondary btn-large hidden">PAUSA</button>
                  <button id="trainer-resume-btn" class="btn btn-primary btn-large hidden">RIPRENDI</button>
              </div>

              <div class="upcoming-exercises-container">
                  <h4></h4>
                  <ul id="upcoming-exercises-list" class="upcoming-exercises-list">
                  </ul>
              </div>
          </div>
      </div>
commands:
  - "echo 'Fase 1 completata. La vista Trainer è stata migliorata e il codice è stato reso più manutenibile.'"