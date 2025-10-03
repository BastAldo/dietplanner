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

export function getWorkoutState() {
  return workoutState;
}

export function updateState(newState) {
  workoutState = { ...workoutState, ...newState };
}

export function resetState() {
  workoutState = { ...initialWorkoutState };
}
