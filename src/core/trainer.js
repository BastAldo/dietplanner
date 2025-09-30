import { setView } from './state.js';

let workoutState = {
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

let timerInterval = null;
const TICK_RATE_MS = 50;

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
    workoutState.status = 'idle'; // Pronto per il prossimo esercizio
    workoutState.currentSet = 1;
    workoutState.currentRep = 1;
    workoutState.executionQueue = [];
    workoutState.currentPhaseIndex = -1;
  }
}

function tick() {
  if (workoutState.status === 'running') {
    workoutState.phaseTimeElapsed += TICK_RATE_MS;
    const currentPhase = workoutState.executionQueue[workoutState.currentPhaseIndex];
    if (!currentPhase) {
      pauseWorkout();
      return;
    }
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
    workoutState.restTimeRemaining -= TICK_RATE_MS;
    if (workoutState.restTimeRemaining <= 0) {
      advanceToNextSet();
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
    prePauseStatus: '',
    currentSet: 1,
    currentRep: 1,
    executionQueue: [],
    currentPhaseIndex: -1,
    phaseTimeElapsed: 0,
    restTimeRemaining: 0,
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
    if (!timerInterval) {
      timerInterval = setInterval(tick, TICK_RATE_MS);
    }
  }
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function pauseWorkout() {
  if (workoutState.status === 'running' || workoutState.status === 'resting') {
    workoutState.prePauseStatus = workoutState.status;
    workoutState.status = 'paused';
    clearInterval(timerInterval);
    timerInterval = null;
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function resumeWorkout() {
  if (workoutState.status === 'paused') {
    workoutState.status = workoutState.prePauseStatus;
    workoutState.prePauseStatus = '';
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
  setView('planner');
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}
