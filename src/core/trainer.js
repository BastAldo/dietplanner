import { setView, setLastWorkoutSummary, addWorkoutToHistory } from './state.js';
import { log } from '../utils/logger.js';
import { getWorkoutState as getState, resetState, updateState } from './trainer/state.js';
import { startAnimation, stopAnimation } from './trainer/animation.js';
import { buildExecutionQueueForCurrentSet } from './trainer/queueBuilder.js';
import { advanceToNextSet } from './trainer/machine.js';

export { getState as getWorkoutState };

const toISODateString = (date) => date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

export function resetWorkoutState() {
  log('Trainer', 'Resetting workout state.');
  document.removeEventListener('workoutFinished', handleWorkoutFinished);
  stopAnimation();
  resetState();
}

function handleWorkoutFinished() {
  const finalState = getState();
  const summary = createWorkoutSummary(finalState);
  setLastWorkoutSummary(summary);
  addWorkoutToHistory(summary);

  updateState({ status: 'finished' });
  stopAnimation();
  setView('debriefing');
}

export function initializeWorkout(plannedExercises) {
  if (!plannedExercises || plannedExercises.length === 0) {
    return;
  }
  resetWorkoutState();
  const firstExercise = plannedExercises[0];
  const initialState = {
    exerciseQueue: JSON.parse(JSON.stringify(plannedExercises)),
    currentExerciseIndex: 0,
    currentSet: 1,
    currentRep: 1,
    executionMode: firstExercise.execution_mode || 'tempo_guided',
    startTime: Date.now()
  };
  updateState(initialState);
  document.addEventListener('workoutFinished', handleWorkoutFinished, { once: true });
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function startWorkout() {
  const state = getState();
  log('Trainer', 'Attempting to start workout.', { status: state.status, mode: state.executionMode });
  if (state.status !== 'idle') return;

  let startState = { status: 'running' };

  if (state.executionMode === 'tempo_guided') {
      startState.executionQueue = buildExecutionQueueForCurrentSet();
      startState.currentPhaseIndex = 0;
      startState.phaseTimeElapsed = 0;
      startState.currentRep = 1;
  } else if (state.executionMode === 'static_hold') {
      const currentExercise = state.exerciseQueue[state.currentExerciseIndex];
      startState.setTimeRemaining = currentExercise.defaultDuration * 1000;
  } else if (state.executionMode === 'manual_reps') {
      startState.manualRepCount = 0;
  }
  
  updateState(startState);
  startAnimation();
  log('Trainer', 'Workout started. New state:', getState());
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function pauseWorkout() {
  const state = getState();
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
  const state = getState();
  if (state.status === 'paused') {
    updateState({
      status: state.prePauseStatus,
      prePauseStatus: '',
    });
    startAnimation();
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }
}

export function incrementManualRep() {
    const state = getState();
    if (state.status === 'running' && state.executionMode === 'manual_reps') {
        const newRepCount = state.manualRepCount + 1;
        updateState({ manualRepCount: newRepCount });

        const currentExercise = state.exerciseQueue[state.currentExerciseIndex];
        const targetReps = currentExercise.defaultReps;

        if (targetReps && newRepCount >= targetReps) {
            updateState({
              status: 'resting',
              restTimeRemaining: currentExercise.defaultRest * 1000,
            });
            startAnimation(); // Avvia l'animazione per il countdown del riposo
        }
        document.dispatchEvent(new CustomEvent('workoutStateChange'));
    }
}

function createWorkoutSummary(finalState) {
    const totalTime = Date.now() - finalState.startTime;
    let totalSets = 0;
    
    const exercises = finalState.exerciseQueue.map((exercise, index) => {
        const setsCompleted = index < finalState.currentExerciseIndex
            ? exercise.defaultSets
            : (index === finalState.currentExerciseIndex ? Math.max(0, finalState.currentSet - 1) : 0);
        totalSets += setsCompleted;
        return { ...exercise, setsCompleted };
    });

    return {
        date: toISODateString(new Date(finalState.startTime)),
        totalTime,
        totalSets,
        exercises
    };
}

export function endWorkout() {
  const finalState = getState();
  const summary = createWorkoutSummary(finalState);
  setLastWorkoutSummary(summary);
  addWorkoutToHistory(summary);

  updateState({ status: 'finished' });
  stopAnimation();
  setView('debriefing');
}
