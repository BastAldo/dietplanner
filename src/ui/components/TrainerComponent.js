import { getWorkoutState, updateState } from '../../core/trainer/state.js';
import { startWorkout, pauseWorkout, resumeWorkout, endWorkout, discardWorkout, confirmCurrentSet, skipPhase } from '../../core/trainer.js';
import { setView } from '../../core/state.js';
import { log } from '../../utils/logger.js';
import { UI_TEXT } from '../../config/uiText.js';
import { renderIcon } from '../icons.js';
import { showConfirmModal } from '../modals.js';

const RING_RADIUS = 128;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export class TrainerComponent {
    constructor(containerElement) {
        this.container = containerElement;

        this.elements = {
            exerciseName: this.container.querySelector('#current-exercise-name'),
            exerciseDetails: this.container.querySelector('#current-exercise-details'),
            repDisplay: this.container.querySelector('#current-rep-display'),
            upcomingDisplay: this.container.querySelector('#upcoming-exercise-display'),

            btnStart: this.container.querySelector('#trainer-start-btn'),
            btnPause: this.container.querySelector('#trainer-pause-btn'),
            btnResume: this.container.querySelector('#trainer-resume-btn'),
            btnAudio: this.container.querySelector('#audio-toggle-btn'),
            btnEnd: this.container.querySelector('#trainer-end-btn'),
            btnSkipBwd: this.container.querySelector('#trainer-skip-bwd-btn'),
            btnSkipFwd: this.container.querySelector('#trainer-skip-fwd-btn'),

            ringContainer: this.container.querySelector('#timer-ring-container'),
            ringSvg: null, // Verrà popolato da createTimerRing
            
            // Controlli Logging
            loggingControls: this.container.querySelector('#trainer-logging-controls'),
            loggingWeightInput: this.container.querySelector('#trainer-log-weight'),
            loggingRepsInput: this.container.querySelector('#trainer-log-reps'),
            loggingFailureInput: this.container.querySelector('#trainer-log-failure'),
            btnConfirmSet: this.container.querySelector('#trainer-confirm-set-btn'),
        };

        this.ringProgress = null;
        this.ringText = null;

        // Bind the event handler once in the constructor
        this.boundHandleControls = this.handleControls.bind(this);
    }

    mount() {
        this.createTimerRing();
        this.container.addEventListener('click', this.boundHandleControls);
        this.elements.btnEnd.innerHTML = renderIcon('STOP', {width: 28, height: 28});
        this.elements.btnSkipBwd.innerHTML = renderIcon('SKIP_BWD', {width: 24, height: 24});
        this.elements.btnSkipFwd.innerHTML = renderIcon('SKIP_FWD', {width: 24, height: 24});

        this.updateAudioButton(getWorkoutState().isAudioEnabled);
    }

    destroy() {
        log('TrainerComponent', 'Destroying component and cleaning up DOM...');
        this.container.removeEventListener('click', this.boundHandleControls);
        // Non svuotare l'HTML, la vista viene riutilizzata
        log('TrainerComponent', 'Component destroyed.');
    }

    _handleEndWorkoutFlow() {
      showConfirmModal({
          title: UI_TEXT.TERMINATE_WORKOUT_CONFIRM_TITLE,
          message: UI_TEXT.TERMINATE_WORKOUT_PROMPT_MSG,
          buttons: [
              {
                  text: UI_TEXT.SAVE_AND_END_BTN,
                  className: 'btn btn-primary',
                  callback: endWorkout
              },
              {
                  text: UI_TEXT.DISCARD_WORKOUT_BTN,
                  className: 'btn btn-danger',
                  callback: discardWorkout
              },
              {
                  text: UI_TEXT.CONFIRM_MODAL_CANCEL_BTN,
                  className: 'btn btn-secondary',
                  callback: null // Just closes the modal
              }
          ]
      });
    }

    async handleControls(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const targetId = target.id;
        log('TrainerComponent', `Control button clicked: ${targetId}`);
        switch (targetId) {
            case 'trainer-start-btn':
                target.disabled = true;
                await startWorkout();
                if(this.elements.btnStart) {
                  this.elements.btnStart.disabled = false;
                }
                break;
            case 'trainer-pause-btn': pauseWorkout(); break;
            case 'trainer-resume-btn': resumeWorkout(); break;
            case 'trainer-end-btn': this._handleEndWorkoutFlow(); break;
            case 'audio-toggle-btn': this.toggleAudio(); break;
            case 'trainer-skip-bwd-btn': skipPhase(-1); break;
            case 'trainer-skip-fwd-btn': skipPhase(1); break;
            case 'trainer-confirm-set-btn':
                const setDataFromUI = {
                  weight: parseFloat(this.elements.loggingWeightInput.value) || 0,
                  reps: parseInt(this.elements.loggingRepsInput.value) || 0,
                  to_failure: this.elements.loggingFailureInput.checked
                };
                confirmCurrentSet(setDataFromUI);
                break;
        }
    }

    toggleAudio() {
        const currentState = getWorkoutState();
        const newState = !currentState.isAudioEnabled;
        updateState({ isAudioEnabled: newState });
        this.updateAudioButton(newState);
    }

    updateAudioButton(isAudioEnabled) {
        this.elements.btnAudio.innerHTML = renderIcon(isAudioEnabled ? 'AUDIO_ON' : 'AUDIO_OFF');
        this.elements.btnAudio.classList.toggle('active', isAudioEnabled);
    }

    createTimerRing() {
        // Non ricreare se esiste già
        if (this.elements.ringSvg) return;

        this.elements.ringContainer.innerHTML = ''; // Pulisce prima di aggiungere
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        const svgSize = (RING_RADIUS + 12) * 2;
        svg.setAttribute('width', svgSize);
        svg.setAttribute('height', svgSize);
        svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
        const center = svgSize / 2;
        const backgroundCircle = document.createElementNS(svgNS, 'circle');
        backgroundCircle.setAttribute('cx', center);
        backgroundCircle.setAttribute('cy', center);
        backgroundCircle.setAttribute('r', RING_RADIUS);
        backgroundCircle.setAttribute('class', 'timer-ring-bg');
        const progressCircle = document.createElementNS(svgNS, 'circle');
        progressCircle.setAttribute('cx', center);
        progressCircle.setAttribute('cy', center);
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
        this.elements.ringContainer.prepend(svg); // Aggiunge l'SVG
        
        // Riappende i controlli di logging che sono già nel DOM ma fuori dal container
        this.elements.ringContainer.appendChild(this.elements.loggingControls); 
        
        // Salva i riferimenti
        this.elements.ringSvg = svg;
        this.ringProgress = progressCircle;
        this.ringText = text;
    }

    updateTimerRing(percent) {
        if (!this.ringProgress) return;
        const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
        this.ringProgress.style.strokeDashoffset = offset;
    }

    formatTime(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    render(state) {
        if (!this.ringText || !this.elements.ringSvg || !state.fullExecutionQueue || state.fullExecutionQueue.length === 0) {
            // Handle pre-start or empty state
            this.elements.exerciseName.textContent = state.exerciseQueue[0]?.name || 'Pronto per iniziare';
            this.elements.exerciseDetails.textContent = '';
            this.elements.repDisplay.classList.add('hidden-rep');
            this.elements.upcomingDisplay.innerHTML = '';
            this.updateTimerRing(0);
            this.ringText.textContent = '';
            this.elements.btnStart.classList.toggle('hidden', state.status !== 'idle');
            this.elements.btnPause.classList.add('hidden');
            this.elements.btnResume.classList.add('hidden');
            this.elements.loggingControls.classList.add('hidden');
            this.elements.ringSvg.classList.remove('hidden');
            this.ringText.classList.remove('hidden');
            this.ringProgress.classList.remove('hidden');
            return;
        };

        const { fullExecutionQueue, currentQueueIndex, status } = state;
        const currentPhase = fullExecutionQueue[currentQueueIndex];

        if (!currentPhase || !currentPhase.context || !currentPhase.context.exercise) {
            this.elements.exerciseName.textContent = 'Allenamento Completato';
            this.elements.exerciseDetails.textContent = '';
            this.elements.repDisplay.classList.add('hidden-rep');
            this.elements.upcomingDisplay.innerHTML = '';
            this.elements.btnStart.classList.add('hidden');
            this.elements.btnPause.classList.add('hidden');
            this.elements.btnResume.classList.add('hidden');
            this.elements.loggingControls.classList.add('hidden');
            this.elements.ringSvg.classList.remove('hidden');
            this.ringText.classList.remove('hidden');
            this.ringProgress.classList.remove('hidden');
            return;
        }

        const { exercise } = currentPhase.context;
        this.elements.exerciseName.textContent = exercise.name;
        this.elements.exerciseDetails.textContent = this.formatExerciseDetails(currentPhase.context);

        if ((currentPhase.type === 'movement' || currentPhase.type === 'static_hold') && currentPhase.context.rep) {
          this.elements.repDisplay.textContent = `${UI_TEXT.TRAINER_REP_LABEL} ${currentPhase.context.rep}`;
          this.elements.repDisplay.classList.remove('hidden-rep');
        } else {
          this.elements.repDisplay.classList.add('hidden-rep');
        }

        const nextExercisePhase = fullExecutionQueue.find((phase, index) => {
            return index > currentQueueIndex && phase.context && phase.context.exercise && phase.context.exercise.instanceId !== exercise.instanceId;
        });

        if (nextExercisePhase && nextExercisePhase.context && nextExercisePhase.context.exercise) {
          this.elements.upcomingDisplay.innerHTML = `<strong>${UI_TEXT.TRAINER_UPCOMING_LABEL}</strong> ${nextExercisePhase.context.exercise.name}`;
        } else {
          this.elements.upcomingDisplay.innerHTML = '';
        }


        this.elements.btnStart.classList.toggle('hidden', status !== 'idle');
        this.elements.btnResume.classList.toggle('hidden', status !== 'paused');

        // --- Main Render Logic ---
        this.ringText.classList.remove('is-timer', 'is-phase', 'is-rep-count', 'flashing', 'hidden');
        this.ringProgress.classList.remove('is-rest', 'hidden');
        this.elements.ringSvg.classList.remove('hidden');

        const isLoggingPhase = (status === 'running' && currentPhase.type === 'logging');
        const isGuidedPhase = (status === 'running' && (currentPhase.type === 'movement' || currentPhase.type === 'static_hold' || currentPhase.type === 'rest'));

        // UI per "inputs DENTRO l'anello"
        this.elements.loggingControls.classList.toggle('hidden', !isLoggingPhase);
        this.ringText.classList.toggle('hidden', isLoggingPhase || status === 'paused');
        this.ringProgress.classList.toggle('hidden', isLoggingPhase || status === 'paused');
        
        this.elements.btnPause.classList.toggle('hidden', !isGuidedPhase || status === 'paused');


        if (status === 'running') {
            if (currentPhase.type === 'movement') this.renderPhase(state, currentPhase);
            else if (currentPhase.type === 'static_hold') this.renderStaticHold(state, currentPhase);
            else if (currentPhase.type === 'logging') this.renderManualReps(state, currentPhase);
            else if (currentPhase.type === 'rest') this.renderRest(state, currentPhase);
            else this.ringText.textContent = ''; // For audio/speech phases
        }
        
        if(status === 'paused') {
          this.renderPaused();
        }
    }

    renderPhase(state, phase) {
        const { phaseTimeElapsed } = state;
        const phaseNameDisplay = phase.phase.replace('pre-', '').toUpperCase();
        const isPrePhase = phase.phase.startsWith('pre-');

        this.ringText.textContent = phaseNameDisplay;
        this.ringText.classList.add('is-phase');
        this.ringText.classList.toggle('flashing', isPrePhase);

        const progressPercent = (phase.duration_ms > 0) ? (phaseTimeElapsed / phase.duration_ms) * 100 : 0;
        this.updateTimerRing(isPrePhase ? 100 : progressPercent);
    }

    renderStaticHold(state, phase) {
        const { phaseTimeElapsed } = state;
        const timeRemaining = phase.duration_ms - phaseTimeElapsed;
        const progressPercent = (phase.duration_ms > 0) ? (phaseTimeElapsed / phase.duration_ms) * 100 : 0;
        this.ringText.textContent = this.formatTime(timeRemaining);
        this.ringText.classList.add('is-timer');
        this.updateTimerRing(progressPercent);
    }

    renderManualReps(state, phase) {
        // Pre-compila i campi per la modalità logging
        this.elements.loggingWeightInput.value = phase.context.weight || 0;
        // Usa repMin come default, altrimenti rep, altrimenti 0
        const defaultReps = phase.context.repsMin || phase.context.reps || 0;
        this.elements.loggingRepsInput.value = defaultReps;
        this.elements.loggingFailureInput.checked = false;
    }

    renderRest(state, phase) {
        const { phaseTimeElapsed } = state;
        const timeRemaining = phase.duration_ms - phaseTimeElapsed;
        const progressPercent = (phase.duration_ms > 0) ? (phaseTimeElapsed / phase.duration_ms) * 100 : 0;

        this.ringText.textContent = this.formatTime(timeRemaining);
        this.ringText.classList.add('is-timer');
        this.ringProgress.classList.add('is-rest');
        this.updateTimerRing(progressPercent);
    }

    renderPaused() {
        this.elements.ringSvg.classList.remove('hidden');
        this.elements.loggingControls.classList.add('hidden');
        this.ringText.classList.remove('hidden');
        this.ringProgress.classList.remove('hidden');

        this.ringText.textContent = UI_TEXT.TRAINER_PAUSED_LABEL;
        this.ringText.classList.add('is-phase', 'flashing');
    }

    formatExerciseDetails(context) {
        const { exercise, set } = context;
        if (!exercise || !set) return '';
        let details = `${UI_TEXT.TRAINER_SET_LABEL} ${set} ${UI_TEXT.TRAINER_OF_SETS_LABEL} ${exercise.defaultSets}`;
        
        if (exercise.execution_mode === 'guided_tempo') {
            details += ` | ${exercise.defaultReps} ${UI_TEXT.TRAINER_REPS_LABEL}`;
        } else if (exercise.execution_mode === 'guided_static') {
            details += ` | ${exercise.defaultDuration}s`;
        } else if (exercise.execution_mode === 'logging') {
            if (exercise.defaultRepsMin && exercise.defaultRepsMax) {
                details += ` | ${exercise.defaultRepsMin}-${exercise.defaultRepsMax} ${UI_TEXT.TRAINER_REPS_LABEL}`;
            } else if (exercise.defaultRepsMin) {
                details += ` | ${exercise.defaultRepsMin}+ ${UI_TEXT.TRAINER_REPS_LABEL}`;
            } else {
                details += ` | ${UI_TEXT.TRAINER_REPS_LABEL}`;
            }
        }

        if (exercise.defaultWeight) {
            details += ` @ ${exercise.defaultWeight}kg`;
        }
        return details;
    }
}
