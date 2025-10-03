import { getWorkoutState, updateState } from './state.js';
import { buildExecutionQueueForCurrentSet } from './queueBuilder.js';
import { endWorkout } from '../trainer.js';

export function advanceToNextSet() {
  const state = getWorkoutState();
  const newSet = state.currentSet + 1;
  const currentExercise = state.exerciseQueue[state.currentExerciseIndex];

  if (newSet > currentExercise.defaultSets) {
    advanceToNextExercise();
  } else {
    updateState({
      status: 'running',
      currentSet: newSet,
      executionQueue: buildExecutionQueueForCurrentSet(),
      currentPhaseIndex: 0,
      phaseTimeElapsed: 0,
      currentRep: 1,
    });
  }
}

export function advanceToNextExercise() {
  const state = getWorkoutState();
  const newIndex = state.currentExerciseIndex + 1;

  if (newIndex >= state.exerciseQueue.length) {
    endWorkout();
  } else {
    updateState({
      currentExerciseIndex: newIndex,
      status: 'idle',
      currentSet: 1,
      currentRep: 1,
      executionQueue: [],
      currentPhaseIndex: -1,
    });
  }
}
