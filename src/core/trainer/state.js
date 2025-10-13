const initialWorkoutState = {
  workoutDate: null,
  exerciseQueue: [], // The original plan of exercises
  fullExecutionQueue: [], // The single queue for the whole workout
  currentQueueIndex: -1,
  status: 'idle', // idle, running, paused, finished
  phaseTimeElapsed: 0,
  startTime: 0,
  phaseStartTime: 0,
  setsData: [], // Array to store data for each completed set
  isAudioEnabled: true,
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
  workoutState = { ...initialWorkoutState };
}
