import { startWorkout, pauseWorkout, resumeWorkout, endWorkout, incrementManualRep } from '../../core/trainer.js';
import { setView } from '../../core/state.js';
import { log } from '../../utils/logger.js';
import { UI_TEXT } from '../../config/uiText.js';

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
            btnManualRep: this.container.querySelector('#trainer-manual-rep-btn'),

            modeTempoContainer: this.container.querySelector('#mode-tempo-guided'),
            ringContainer: this.container.querySelector('#timer-ring-container'),
            
            modeStaticContainer: this.container.querySelector('#mode-static-hold'),
            staticTimerTime: this.container.querySelector('#static-timer-time'),

            modeManualContainer: this.container.querySelector('#mode-manual-reps'),
            manualRepCount: this.container.querySelector('#manual-rep-count'),
            manualRepLabel: this.container.querySelector('#manual-rep-label'),
        };

        this.ringProgress = null;
        this.ringText = null;
    }

    mount() {
        this.createTimerRing();
        this.container.addEventListener('click', this.handleControls.bind(this));
        this.elements.btnManualRep.textContent = UI_TEXT.TRAINER_MANUAL_REP_BTN_LABEL;
        this.elements.manualRepLabel.textContent = UI_TEXT.TRAINER_MANUAL_REPS_LABEL;
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
            case 'trainer-manual-rep-btn': incrementManualRep(); break;
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
        const { exerciseQueue, currentExerciseIndex, status, executionMode } = state;

        if (currentExerciseIndex < 0 || currentExerciseIndex >= exerciseQueue.length) {
            this.elements.exerciseName.textContent = '';
            this.elements.exerciseDetails.textContent = '';
            this.elements.repDisplay.classList.add('hidden-rep');
            this.elements.upcomingDisplay.innerHTML = '';
            this.elements.btnStart.classList.add('hidden');
            this.elements.btnPause.classList.add('hidden');
            this.elements.btnResume.classList.add('hidden');
            this.elements.btnManualRep.classList.add('hidden');
            return;
        };

        const currentExercise = exerciseQueue[currentExerciseIndex];
        this.elements.exerciseName.textContent = currentExercise.name;
        this.elements.exerciseDetails.textContent = this.formatExerciseDetails(state);
        
        if (status === 'running' && executionMode === 'tempo_guided') {
          this.elements.repDisplay.textContent = `${UI_TEXT.TRAINER_REP_LABEL} ${state.currentRep}`;
          this.elements.repDisplay.classList.remove('hidden-rep');
        } else {
          this.elements.repDisplay.classList.add('hidden-rep');
        }

        const upcomingExercises = exerciseQueue.slice(currentExerciseIndex + 1, currentExerciseIndex + 3).map(ex => ex.name).join(', ');
        if (upcomingExercises) {
          this.elements.upcomingDisplay.innerHTML = `<strong>${UI_TEXT.TRAINER_UPCOMING_LABEL}</strong> ${upcomingExercises}`;
        } else {
          this.elements.upcomingDisplay.innerHTML = '';
        }

        this.elements.btnStart.classList.toggle('hidden', status !== 'idle');
        this.elements.btnPause.classList.toggle('hidden', status !== 'running' && status !== 'resting');
        this.elements.btnResume.classList.toggle('hidden', status !== 'paused');
        this.elements.btnManualRep.classList.toggle('hidden', !(status === 'running' && executionMode === 'manual_reps'));

        this.elements.modeTempoContainer.classList.toggle('hidden', executionMode !== 'tempo_guided');
        this.elements.modeStaticContainer.classList.toggle('hidden', executionMode !== 'static_hold');
        this.elements.modeManualContainer.classList.toggle('hidden', executionMode !== 'manual_reps');
        
        if (executionMode === 'tempo_guided') {
            this.renderTempoGuided(state);
        } else if (executionMode === 'static_hold') {
            this.renderStaticHold(state);
        } else if (executionMode === 'manual_reps') {
            this.renderManualReps(state);
        }
    }
    
    formatTime(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    renderTempoGuided(state) {
        if (!this.ringText) { return; }
        const { status } = state;
        if (status === 'running') this.renderPhase(state);
        else if (status === 'resting') this.renderRest(state);
        else if (status === 'paused') this.renderPaused(state);
        else if (status === 'idle') {
            this.ringText.textContent = '';
            this.ringText.classList.remove('flashing');
            this.updateTimerRing(0);
        }
    }
    
    renderStaticHold(state) {
        const { status, setTimeRemaining } = state;
        if (status === 'running') {
            this.elements.staticTimerTime.textContent = this.formatTime(setTimeRemaining);
        } else if (status === 'resting') {
            this.elements.staticTimerTime.textContent = this.formatTime(state.restTimeRemaining);
        } else if (status === 'paused') {
            this.elements.staticTimerTime.textContent = UI_TEXT.TRAINER_PAUSED_LABEL;
        } else {
            this.elements.staticTimerTime.textContent = this.formatTime(0);
        }
    }
    
    renderManualReps(state) {
        const { status, manualRepCount } = state;
        if (status === 'running') {
            this.elements.manualRepCount.textContent = manualRepCount;
        } else {
            this.elements.manualRepCount.textContent = '0';
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

        if (isPrePhase) {
            this.updateTimerRing(100);
        } else {
            const progressPercent = Math.min(100, (phaseTimeElapsed / phase.duration) * 100);
            this.updateTimerRing(progressPercent);
        }
    }

    renderRest(state) {
        const { restTimeRemaining, executionMode } = state;
        
        if (executionMode === 'tempo_guided') {
            this.ringText.textContent = UI_TEXT.TRAINER_REST_LABEL;
            this.ringText.classList.remove('flashing');
            const totalRest = state.exerciseQueue[state.currentExerciseIndex].defaultRest * 1000;
            const progressPercent = (totalRest > 0) ? ((totalRest - restTimeRemaining) / totalRest) * 100 : 100;
            this.updateTimerRing(progressPercent);
        } else if (executionMode === 'static_hold') {
            this.elements.staticTimerTime.textContent = this.formatTime(restTimeRemaining);
        }
    }
    
    renderPaused() {
        const state = getWorkoutState();
        if (state.executionMode === 'tempo_guided') {
          this.ringText.textContent = UI_TEXT.TRAINER_PAUSED_LABEL;
          this.ringText.classList.remove('flashing');
        }
    }

    formatExerciseDetails(state) {
        const { exerciseQueue, currentExerciseIndex, currentSet, executionMode } = state;
        const exercise = exerciseQueue[currentExerciseIndex];
        if (!exercise) return '';
        const sets = exercise.defaultSets;
        let details = `${UI_TEXT.TRAINER_SET_LABEL} ${currentSet} ${UI_TEXT.TRAINER_OF_SETS_LABEL} ${sets}`;
        if (executionMode === 'tempo_guided' || executionMode === 'manual_reps') {
            const reps = exercise.defaultReps;
            details += ` | ${reps} ${UI_TEXT.TRAINER_REPS_LABEL}`;
        } else if (executionMode === 'static_hold') {
            const duration = exercise.defaultDuration;
            details += ` | ${duration}s`;
        }
        return details;
    }
}
