import { getWorkoutState, startWorkout, pauseWorkout, resumeWorkout, endWorkout } from '../core/trainer.js';
import { setView } from '../core/state.js';

let ringProgress, ringText;
const RING_RADIUS = 80;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function createTimerRing(container) {
    if (container.querySelector('svg')) {
        ringProgress = container.querySelector('.timer-ring-progress');
        return;
    }
    container.innerHTML = '';
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
    container.prepend(svg);
    ringProgress = progressCircle;
}

function updateTimerRing(percent) {
  if (!ringProgress) return;
  const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
  ringProgress.style.strokeDashoffset = offset;
}

function formatExerciseDetails(exercise, set) {
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

function renderPhase(state) {
  const { executionQueue, currentPhaseIndex, phaseTimeElapsed } = state;
  const phase = executionQueue[currentPhaseIndex];
  if (!phase || !ringText) return;

  const phaseNameDisplay = phase.name.replace('pre-', '').toUpperCase();
  const isPrePhase = phase.name.startsWith('pre-');

  ringText.textContent = phaseNameDisplay;
  ringText.classList.toggle('flashing', isPrePhase);

  const progressPercent = Math.min(100, (phaseTimeElapsed / phase.duration) * 100);
  updateTimerRing(progressPercent);
}

function renderRest(state) {
  const { restTimeRemaining } = state;
  const secondsRemaining = Math.ceil(restTimeRemaining / 1000);
  if (!ringText) return;
  ringText.textContent = secondsRemaining;
  ringText.classList.remove('flashing');
  updateTimerRing(0);
}

export function renderTrainerView() {
  const state = getWorkoutState();
  const { exerciseQueue, currentExerciseIndex, status, currentSet, currentRep } = state;

  if (currentExerciseIndex < 0 || currentExerciseIndex >= exerciseQueue.length) return;

  const currentExercise = exerciseQueue[currentExerciseIndex];
  document.getElementById('current-exercise-name').textContent = currentExercise.name;
  document.getElementById('current-exercise-details').textContent = formatExerciseDetails(currentExercise, currentSet);
  document.getElementById('current-rep-display').textContent = (status === 'running') ? `Rip. ${currentRep}` : '';


  const upcomingList = document.getElementById('upcoming-exercises-list');
  upcomingList.innerHTML = '';
  exerciseQueue.slice(currentExerciseIndex + 1).forEach(ex => {
    const li = document.createElement('li');
    li.textContent = ex.name;
    upcomingList.appendChild(li);
  });

  const controlsContainer = document.getElementById('trainer-main-controls');
  if (status === 'idle') {
    controlsContainer.innerHTML = `<button id="trainer-start-btn" class="btn btn-primary btn-large">AVVIA</button>`;
    if(ringText) ringText.textContent = '';
    updateTimerRing(0);
  } else if (status === 'running' || status === 'resting') {
    controlsContainer.innerHTML = `<button id="trainer-pause-btn" class="btn btn-secondary btn-large">PAUSA</button>`;
  } else if (status === 'paused') {
    controlsContainer.innerHTML = `<button id="trainer-resume-btn" class="btn btn-primary btn-large">RIPRENDI</button>`;
  } else {
    controlsContainer.innerHTML = '';
  }

  const modeTempoContainer = document.getElementById('mode-tempo-guided');
  modeTempoContainer.classList.remove('hidden');

  if (status === 'running') {
      renderPhase(state);
  } else if (status === 'resting') {
      renderRest(state);
  }
}

export function initializeTrainerUI() {
    document.removeEventListener('workoutStateChange', renderTrainerView);
    document.addEventListener('workoutStateChange', renderTrainerView);

    const ringContainer = document.getElementById('timer-ring-container');
    createTimerRing(ringContainer);
    ringText = document.getElementById('tempo-phase-name');

    const page = document.getElementById('trainer-page');
    // Rimuovi vecchi listener se esistono per evitare duplicati
    const newPage = page.cloneNode(true);
    page.parentNode.replaceChild(newPage, page);

    newPage.addEventListener('click', (e) => {
        if (e.target.id === 'trainer-start-btn') startWorkout();
        if (e.target.id === 'trainer-pause-btn') pauseWorkout();
        if (e.target.id === 'trainer-resume-btn') resumeWorkout();
        if (e.target.id === 'trainer-end-btn') endWorkout();
        if (e.target.id === 'trainer-back-btn') setView('planner');
    });
}
