import { getWorkoutState, updateState, resetState } from './state.js';
import { buildExecutionQueueForCurrentSet } from './queueBuilder.js';

export function advanceToNextSet() {
  const state = getWorkoutState();
  const newSet = state.currentSet + 1;
  const currentExercise = state.exerciseQueue[state.currentExerciseIndex];

  if (newSet > currentExercise.defaultSets) {
    advanceToNextExercise();
  } else {
    let nextState = {
      status: 'running',
      currentSet: newSet,
      phaseTimeElapsed: 0,
      currentRep: 1,
      manualRepCount: 0,
    };
    if (state.executionMode === 'tempo_guided') {
      nextState.executionQueue = buildExecutionQueueForCurrentSet();
      nextState.currentPhaseIndex = 0;
    } else if (state.executionMode === 'static_hold') {
      nextState.setTimeRemaining = currentExercise.defaultDuration * 1000;
    }
    updateState(nextState);
  }
}

export function advanceToNextExercise() {
  const state = getWorkoutState();
  const newIndex = state.currentExerciseIndex + 1;

  if (newIndex >= state.exerciseQueue.length) {
    updateState({ status: 'finished' });
  } else {
    const nextExercise = state.exerciseQueue[newIndex];
    // Full state reset to defaults, then apply next exercise's info
    const currentState = getWorkoutState(); // get current queue
    resetState(); // Reset to initial state
    updateState({
      exerciseQueue: currentState.exerciseQueue, // Restore queue
      currentExerciseIndex: newIndex,
      status: 'idle',
      currentSet: 1,
      executionMode: nextExercise.execution_mode || 'tempo_guided',
    });
  }
}
