import { getWorkoutState, updateState, resetState } from './state.js';
import { buildExecutionQueueForCurrentSet } from './queueBuilder.js';

function startNextExercise() {
    const state = getWorkoutState();
    const nextExercise = state.exerciseQueue[state.currentExerciseIndex];
    const executionMode = nextExercise.execution_mode || 'tempo_guided';
    
    let nextState = {
        status: 'running',
        currentSet: 1,
        currentRep: 1,
        manualRepCount: 0,
        executionMode: executionMode
    };

    if (executionMode === 'tempo_guided') {
        nextState.executionQueue = buildExecutionQueueForCurrentSet();
        nextState.currentPhaseIndex = 0;
        nextState.phaseTimeElapsed = 0;
    } else if (executionMode === 'static_hold') {
        nextState.setTimeRemaining = nextExercise.defaultDuration * 1000;
    }
    
    updateState(nextState);
}

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
    document.dispatchEvent(new CustomEvent('workoutFinished'));
  } else {
    updateState({
      currentExerciseIndex: newIndex
    });
    startNextExercise();
  }
}
