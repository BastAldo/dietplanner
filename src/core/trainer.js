import { setView } from './state.js';
import { log } from '../utils/logger.js';
import { getWorkoutState, resetState, updateState } from './trainer/state.js';
import { startAnimation, stopAnimation } from './trainer/animation.js';
import { advanceToNextExercise } from './trainer/machine.js';
import { buildExecutionQueueForCurrentSet } from './trainer/queueBuilder.js';

export function getWorkoutState() {
  return getWorkoutState();
}

export function resetWorkoutState() {
  log('Trainer', 'Resetting workout state.');
  stopAnimation();
  resetState();
}

export function initializeWorkout(plannedExercises) {
  if (!plannedExercises || plannedExercises.length === 0) {
    return;
  }
  resetWorkoutState();
  const initialState = {
    exerciseQueue: JSON.parse(JSON.stringify(plannedExercises)),
    currentExerciseIndex: 0,
    currentSet: 1,
    currentRep: 1,
  };
  updateState(initialState);
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function startWorkout() {
  const state = getWorkoutState();
  log('Trainer', 'Attempting to start workout. Current status:', state.status);
  if (state.status === 'idle') {
    const executionQueue = buildExecutionQueueForCurrentSet();
    updateState({
      status: 'running',
      executionQueue: executionQueue,
      currentPhaseIndex: 0,
      phaseTimeElapsed: 0,
      currentRep: 1,
    });
    startAnimation();
    log('Trainer', 'Workout started. New status:', getWorkoutState().status);
  }
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function pauseWorkout() {
  const state = getWorkoutState();
  if (state.status === 'running' || state.status === 'resting') {
    updateState({
      prePauseStatus: state.status,
      status: 'paused',
    });
    stopAnimation();
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function resumeWorkout() {
  const state = getWorkoutState();
  if (state.status === 'paused') {
    updateState({
      status: state.prePauseStatus,
      prePauseStatus: '',
    });
    startAnimation();
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function endWorkout() {
  updateState({ status: 'finished' });
  stopAnimation();
  setView('planner');
}
