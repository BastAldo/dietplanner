const initialWorkoutState = {
  exerciseQueue: [],
  currentExerciseIndex: -1,
  status: 'idle', // idle, running, paused, resting, finished
  executionMode: 'tempo_guided', // tempo_guided, static_hold, manual_reps
  prePauseStatus: '',
  currentSet: 0,
  currentRep: 0,
  manualRepCount: 0,
  executionQueue: [],
  currentPhaseIndex: -1,
  phaseTimeElapsed: 0,
  restTimeRemaining: 0,
  setTimeRemaining: 0,
  startTime: 0,
  setsData: [] // Array to store data for each completed set
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
