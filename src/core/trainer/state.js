const initialWorkoutState = {
  workoutDate: null,
  exerciseQueue: [], // The original plan of exercises
  fullExecutionQueue: [], // The single queue for the whole workout
  currentQueueIndex: 0,
  status: 'idle', // idle, running, paused, finished
  phaseTimeElapsed: 0,
  lastTimerDuration: 0, // Stores the actual elapsed time from the last timer animation
  startTime: 0,
  setsData: [], // Array to store data for each completed set
  isAudioEnabled: true,
  resolveCurrentSetPromise: null, // Promise resolver per la modalità logging
};

let workoutState = { ...initialWorkoutState };

export function getWorkoutState() {
  return workoutState;
}

export function updateState(newState) {
  workoutState = { ...workoutState, ...newState };
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function resetState() {
  // Mutate the existing object to ensure all references are updated,
  // and explicitly clear arrays/objects to prevent old data from persisting.
  Object.assign(workoutState, initialWorkoutState);
  workoutState.exerciseQueue = [];
  workoutState.fullExecutionQueue = [];
  workoutState.setsData = [];
}
