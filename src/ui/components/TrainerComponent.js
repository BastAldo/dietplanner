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
