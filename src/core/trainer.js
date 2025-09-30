import { setView } from './state.js';

let workoutState = {
  exerciseQueue: [],
  currentExerciseIndex: -1,
  status: 'idle', // idle, running, paused, resting, finished
  currentSet: 0,
  currentRep: 0,
  executionQueue: [],
  currentPhaseIndex: -1,
  phaseTimeElapsed: 0,
  totalTimeElapsed: 0,
};

let timerInterval = null;
const TICK_RATE_MS = 50; // Aggiorna 20 volte al secondo per un'animazione fluida

function buildExecutionQueueForCurrentSet() {
  const currentExercise = workoutState.exerciseQueue[workoutState.currentExerciseIndex];
  if (!currentExercise) return [];

  const queue = [];
  const reps = currentExercise.defaultReps;
  const tempo = currentExercise.defaultTempo;

  for (let i = 0; i < reps; i++) {
    if (tempo) {
      queue.push({ name: 'pre-up', rep: i + 1, duration: 700 });
      queue.push({ name: 'up', rep: i + 1, duration: tempo.up * 1000 });
      queue.push({ name: 'pre-hold', rep: i + 1, duration: 700 });
      queue.push({ name: 'hold', rep: i + 1, duration: tempo.hold * 1000 });
      queue.push({ name: 'pre-down', rep: i + 1, duration: 700 });
      queue.push({ name: 'down', rep: i + 1, duration: tempo.down * 1000 });
    }
  }
  return queue;
}

function tick() {
  if (workoutState.status !== 'running') return;

  workoutState.phaseTimeElapsed += TICK_RATE_MS;
  workoutState.totalTimeElapsed += TICK_RATE_MS;

  const currentPhase = workoutState.executionQueue[workoutState.currentPhaseIndex];
  if (!currentPhase) {
    // Fine della serie o errore
    pauseWorkout(); // Metti in pausa per sicurezza
    return;
  }

  if (workoutState.phaseTimeElapsed >= currentPhase.duration) {
    // Passa alla fase successiva
    workoutState.currentPhaseIndex++;
    workoutState.phaseTimeElapsed = 0;

    const nextPhase = workoutState.executionQueue[workoutState.currentPhaseIndex];
    if (nextPhase) {
      workoutState.currentRep = nextPhase.rep;
    } else {
      // Serie completata
      // Qui andrà la logica per il riposo e la serie successiva
      workoutState.status = 'resting';
      console.log("Serie completata, inizio riposo...");
    }
  }
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function getWorkoutState() {
  return workoutState;
}

export function initializeWorkout(plannedExercises) {
  if (!plannedExercises || plannedExercises.length === 0) {
    console.error("Tentativo di inizializzare un allenamento senza esercizi.");
    return;
  }
  clearInterval(timerInterval);
  timerInterval = null;

  workoutState = {
    exerciseQueue: JSON.parse(JSON.stringify(plannedExercises)),
    currentExerciseIndex: 0,
    status: 'idle',
    currentSet: 1,
    currentRep: 1,
    executionQueue: [],
    currentPhaseIndex: -1,
    phaseTimeElapsed: 0,
    totalTimeElapsed: 0,
  };
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function startWorkout() {
  if (workoutState.status === 'idle') {
    workoutState.status = 'running';
    workoutState.executionQueue = buildExecutionQueueForCurrentSet();
    workoutState.currentPhaseIndex = 0;
    workoutState.phaseTimeElapsed = 0;
    workoutState.currentRep = 1;
    timerInterval = setInterval(tick, TICK_RATE_MS);
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function pauseWorkout() {
  if (workoutState.status === 'running' || workoutState.status === 'resting') {
    const oldStatus = workoutState.status;
    workoutState.status = 'paused';
    workoutState.prePauseStatus = oldStatus; // Salva lo stato precedente
    clearInterval(timerInterval);
    timerInterval = null;
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function resumeWorkout() {
  if (workoutState.status === 'paused') {
    workoutState.status = workoutState.prePauseStatus || 'running';
    if (!timerInterval) {
      timerInterval = setInterval(tick, TICK_RATE_MS);
    }
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function endWorkout() {
  workoutState.status = 'finished';
  clearInterval(timerInterval);
  timerInterval = null;
  setView('planner'); // Torna al planner
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}
