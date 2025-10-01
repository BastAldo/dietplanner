import { startWorkout, pauseWorkout, resumeWorkout, endWorkout } from '../../core/trainer.js';
import { setView } from '../../core/state.js';

const RING_RADIUS = 80;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export class TrainerComponent {
    constructor(containerElement) {
        this.container = containerElement;

        // Query degli elementi DOM una sola volta
        this.elements = {
            exerciseName: this.container.querySelector('#current-exercise-name'),
            exerciseDetails: this.container.querySelector('#current-exercise-details'),
            repDisplay: this.container.querySelector('#current-rep-display'),
            upcomingList: this.container.querySelector('#upcoming-exercises-list'),
            controlsContainer: this.container.querySelector('#trainer-main-controls'),
            modeTempoContainer: this.container.querySelector('#mode-tempo-guided'),
            ringContainer: this.container.querySelector('#timer-ring-container'),
            ringText: this.container.querySelector('#tempo-phase-name'),
        };

        this.ringProgress = null; // Verrà inizializzato dopo la creazione dell'SVG
    }

    mount() {
        this.createTimerRing();
        this.container.addEventListener('click', this.handleControls.bind(this));
    }

    destroy() {
        this.container.removeEventListener('click', this.handleControls.bind(this));
        // Altre pulizie se necessarie
    }

    handleControls(e) {
        const targetId = e.target.id;
        switch (targetId) {
            case 'trainer-start-btn':
                startWorkout();
                break;
            case 'trainer-pause-btn':
                pauseWorkout();
                break;
            case 'trainer-resume-btn':
                resumeWorkout();
                break;
            case 'trainer-end-btn':
                endWorkout();
                break;
            case 'trainer-back-btn':
                setView('planner');
                break;
        }
    }

    createTimerRing() {
        if (this.elements.ringContainer.querySelector('svg')) return;
        this.elements.ringContainer.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '200');
        svg.setAttribute('height', '200');
        svg.setAttribute('viewBox', '0 0 200 200');

        const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        backgroundCircle.setAttribute('cx', '100');
        backgroundCircle.setAttribute('cy', '100');
        backgroundCircle.setAttribute('r', RING_RADIUS);
        backgroundCircle.setAttribute('class', 'timer-ring-bg');

        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', '100');
        progressCircle.setAttribute('cy', '100');
        progressCircle.setAttribute('r', RING_RADIUS);
        progressCircle.setAttribute('class', 'timer-ring-progress');
        progressCircle.style.strokeDasharray = RING_CIRCUMFERENCE;
        progressCircle.style.strokeDashoffset = RING_CIRCUMFERENCE;

        svg.appendChild(backgroundCircle);
        svg.appendChild(progressCircle);
        this.elements.ringContainer.prepend(svg);
        this.ringProgress = progressCircle;
    }

    updateTimerRing(percent) {
        if (!this.ringProgress) return;
        const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
        this.ringProgress.style.strokeDashoffset = offset;
    }

    render(state) {
        const { exerciseQueue, currentExerciseIndex, status, currentSet, currentRep } = state;

        if (currentExerciseIndex < 0 || currentExerciseIndex >= exerciseQueue.length) return;

        const currentExercise = exerciseQueue[currentExerciseIndex];
        this.elements.exerciseName.textContent = currentExercise.name;
        this.elements.exerciseDetails.textContent = this.formatExerciseDetails(currentExercise, currentSet);
        this.elements.repDisplay.textContent = (status === 'running') ? `Rip. ${currentRep}` : '';

        this.elements.upcomingList.innerHTML = '';
        exerciseQueue.slice(currentExerciseIndex + 1).forEach(ex => {
            const li = document.createElement('li');
            li.textContent = ex.name;
            this.elements.upcomingList.appendChild(li);
        });

        // Gestione Controlli
        if (status === 'idle') {
            this.elements.controlsContainer.innerHTML = `<button id="trainer-start-btn" class="btn btn-primary btn-large">AVVIA</button>`;
            this.elements.ringText.textContent = '';
            this.updateTimerRing(0);
        } else if (status === 'running' || status === 'resting') {
            this.elements.controlsContainer.innerHTML = `<button id="trainer-pause-btn" class="btn btn-secondary btn-large">PAUSA</button>`;
        } else if (status === 'paused') {
            this.elements.controlsContainer.innerHTML = `<button id="trainer-resume-btn" class="btn btn-primary btn-large">RIPRENDI</button>`;
        } else {
            this.elements.controlsContainer.innerHTML = '';
        }

        // Gestione Modalità
        this.elements.modeTempoContainer.classList.remove('hidden');

        if (status === 'running') {
            this.renderPhase(state);
        } else if (status === 'resting') {
            this.renderRest(state);
        }
    }

    renderPhase(state) {
        const { executionQueue, currentPhaseIndex, phaseTimeElapsed } = state;
        const phase = executionQueue[currentPhaseIndex];
        if (!phase) return;

        const phaseNameDisplay = phase.name.replace('pre-', '').toUpperCase();
        const isPrePhase = phase.name.startsWith('pre-');

        this.elements.ringText.textContent = phaseNameDisplay;
        this.elements.ringText.classList.toggle('flashing', isPrePhase);

        const progressPercent = Math.min(100, (phaseTimeElapsed / phase.duration) * 100);
        this.updateTimerRing(progressPercent);
    }

    renderRest(state) {
        const { restTimeRemaining } = state;
        const secondsRemaining = Math.ceil(restTimeRemaining / 1000);
        this.elements.ringText.textContent = secondsRemaining;
        this.elements.ringText.classList.remove('flashing');
        this.updateTimerRing(0);
    }

    formatExerciseDetails(exercise, set) {
        if (!exercise) return '';
        const sets = exercise.defaultSets;
        let details = `Serie ${set} di ${sets}`;
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