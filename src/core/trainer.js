let workoutState = {
  exerciseQueue: [],
  currentExerciseIndex: -1,
  status: 'idle', // idle, running, paused, resting, finished
  currentSet: 0,
  currentRep: 0,
  executionQueue: [],
  currentPhaseIndex: -1
};

export function getWorkoutState() {
  return { ...workoutState };
}

export function initializeWorkout(plannedExercises) {
  if (!plannedExercises || plannedExercises.length === 0) {
    console.error("Tentativo di inizializzare un allenamento senza esercizi.");
    return;
  }

  workoutState = {
    exerciseQueue: JSON.parse(JSON.stringify(plannedExercises)), // Deep copy
    currentExerciseIndex: 0,
    status: 'idle',
    currentSet: 1,
    currentRep: 1,
    executionQueue: [],
    currentPhaseIndex: -1
  };

  // Potremmo pre-compilare la prima coda di esecuzione qui o farlo al momento dell'avvio.
  // Per ora, lo stato è semplicemente inizializzato.
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function startWorkout() {
  if (workoutState.status === 'idle') {
    workoutState.status = 'running';
    // Qui andrà la logica per compilare la `executionQueue` e avviare il timer.
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function pauseWorkout() {
  if (workoutState.status === 'running' || workoutState.status === 'resting') {
    workoutState.status = 'paused';
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function resumeWorkout() {
  if (workoutState.status === 'paused') {
    // La logica dovrà determinare se riprendere una fase di esercizio o un riposo.
    workoutState.status = 'running'; // o 'resting'
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function endWorkout() {
  workoutState.status = 'finished';
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}
