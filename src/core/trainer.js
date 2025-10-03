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
