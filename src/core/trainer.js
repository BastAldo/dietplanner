import { setView, setLastWorkoutSummary, addWorkoutToHistory, getState as getGlobalState } from './state.js';
import { log } from '../utils/logger.js';
import { getWorkoutState as getState, resetState, updateState } from './trainer/state.js';
import { startAnimation, stopAnimation } from './trainer/animation.js';
import { buildFullWorkoutQueue } from './trainer/queueBuilder.js';
import { calculateWorkoutCalories } from './calculations.js';
import { speak, playStartCue } from '../utils/audioFeedback.js';
import { UI_TEXT } from '../config/uiText.js';

export { getState as getWorkoutState };

export function resetWorkoutState() {
  log('Trainer', 'Resetting workout state.');
  document.removeEventListener('workoutFinished', handleWorkoutFinished, { once: true });
  stopAnimation();
  resetState();
}

function handleWorkoutFinished() {
  endWorkout();
}

export function initializeWorkout(plannedExercises, isoDate) {
  if (!plannedExercises || plannedExercises.length === 0) {
    return;
  }
  resetWorkoutState();

  const fullExecutionQueue = buildFullWorkoutQueue(plannedExercises);

  const initialState = {
    workoutDate: isoDate,
    exerciseQueue: JSON.parse(JSON.stringify(plannedExercises)), // Keep original for reference
    fullExecutionQueue: fullExecutionQueue,
    currentQueueIndex: 0,
    status: 'idle',
    startTime: 0,
    phaseStartTime: 0,
    phaseTimeElapsed: 0,
    setsData: []
  };
  updateState(initialState);
  document.addEventListener('workoutFinished', handleWorkoutFinished, { once: true });
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function collectSetData() {
    const state = getState();
    const currentPhase = state.fullExecutionQueue[state.currentQueueIndex];
    if (!currentPhase || !currentPhase.context) return;

    const { exercise, set, reps, weight } = currentPhase.context;

    const setData = {
        exerciseId: exercise.instanceId,
        set: set,
        reps: reps,
        duration: Date.now() - state.phaseStartTime,
        rest: exercise.defaultRest,
        weight: weight || 0
    };

    const newSetsData = [...state.setsData, setData];
    updateState({ setsData: newSetsData });
    log('Trainer', 'Set data collected', { setData });
}


export async function startWorkout() {
  const state = getState();
  log('Interactions', 'Start workout button clicked', { date: state.workoutDate });
  if (state.status !== 'idle') return;

  const firstExerciseName = state.exerciseQueue[0].name;

  if (state.isAudioEnabled) {
    playStartCue();
    await speak(`${UI_TEXT.VOICE_GUIDE_NOW_STARTING} ${firstExerciseName}`);
  }
  
  // Re-check state in case user navigated away during announcement
  if (getState().status !== 'idle') {
    log('Trainer', 'Workout start aborted, status changed during announcement.');
    return;
  }

  const startState = {
    status: 'running',
    startTime: Date.now(),
    phaseStartTime: Date.now(),
    phaseTimeElapsed: 0,
    currentQueueIndex: 0
  };

  updateState(startState);
  startAnimation();
  log('Trainer', 'Workout started. New state:', getState());
}

export function pauseWorkout() {
  const state = getState();
  if (state.status === 'running') {
    updateState({
      status: 'paused',
    });
    stopAnimation();
  }
}

export function resumeWorkout() {
  const state = getState();
  if (state.status === 'paused') {
    updateState({
      status: 'running',
      phaseStartTime: Date.now() - state.phaseTimeElapsed,
     });
    startAnimation();
  }
}

export function incrementManualRep() {
    const state = getState();
    if (state.status !== 'running') return;

    const currentPhase = state.fullExecutionQueue[state.currentQueueIndex];
    if (currentPhase && currentPhase.type === 'manual_rep') {
        const newRepCount = (currentPhase.repsCompleted || 0) + 1;
        currentPhase.repsCompleted = newRepCount;

        if (newRepCount >= currentPhase.context.reps) {
            // Advance to next phase
            updateState({ currentQueueIndex: state.currentQueueIndex + 1, phaseStartTime: Date.now(), phaseTimeElapsed: 0 });
        } else {
            // Just update UI
            document.dispatchEvent(new CustomEvent('workoutStateChange'));
        }
    }
}

function createWorkoutSummary(finalState) {
    const totalTime = Date.now() - finalState.startTime;
    let totalTonnage = 0;

    const exercisesWithDetails = finalState.exerciseQueue.map(exercise => {
        const setsForThisExercise = finalState.setsData.filter(d => d.exerciseId === exercise.instanceId);
        const setsCompleted = setsForThisExercise.length;
        const totalExerciseTime = setsForThisExercise.reduce((acc, set) => acc + (set.duration || 0), 0);
        const exerciseTonnage = setsForThisExercise.reduce((acc, set) => acc + ((set.reps || 0) * (set.weight || 0)), 0);
        totalTonnage += exerciseTonnage;

        return {
            ...exercise,
            setsCompleted: setsCompleted,
            setsData: setsForThisExercise,
            totalTime: totalExerciseTime,
            tonnage: exerciseTonnage
        };
    });

    const totalSets = exercisesWithDetails.reduce((acc, ex) => acc + ex.setsCompleted, 0);
    const totalExerciseTime = exercisesWithDetails.reduce((acc, ex) => acc + ex.totalTime, 0);
    const totalRestTime = finalState.setsData.reduce((acc, set) => acc + (set.rest || 0) * 1000, 0);

    const summary = {
        date: finalState.workoutDate,
        totalTime,
        totalSets,
        totalExerciseTime,
        totalRestTime,
        totalTonnage,
        exercises: exercisesWithDetails,
        startTime: finalState.startTime,
        totalCaloriesBurned: 0
    };

    const globalState = getGlobalState();
    const latestWeight = globalState.biometricData.length > 0 ? globalState.biometricData[0].weight : null;
    if (latestWeight) {
      summary.totalCaloriesBurned = calculateWorkoutCalories(summary, latestWeight);
    }

    return summary;
}

export function endWorkout() {
  const finalState = getState();
  if (finalState.status === 'finished') {
      log('Trainer', 'Workout already finished, not saving again.');
      return;
  }
  if (finalState.startTime === 0) {
      log('Trainer', 'Workout ended prematurely, not saving summary.');
      setView('planner');
      return;
  }
  const summary = createWorkoutSummary(finalState);
  setLastWorkoutSummary(summary);
  addWorkoutToHistory(summary);

  updateState({ status: 'finished' });
  stopAnimation();
  setView('debriefing');
}
