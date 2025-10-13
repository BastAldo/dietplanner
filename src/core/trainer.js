import { setView, setLastWorkoutSummary, addWorkoutToHistory, getState as getGlobalState } from './state.js';
import { log } from '../utils/logger.js';
import { getWorkoutState as getState, resetState, updateState } from './trainer/state.js';
import { runTimerAnimation, stopAllAnimations } from './trainer/animation.js';
import { buildFullWorkoutQueue } from './trainer/queueBuilder.js';
import { calculateWorkoutCalories } from './calculations.js';
import { speak, playStartCue, playTick } from '../utils/audioFeedback.js';
import { UI_TEXT } from '../config/uiText.js';

export { getState as getWorkoutState };

// This is the "Director d'Orchestra"
async function runWorkoutLoop() {
  const state = getState();
  if (state.status !== 'running') return;

  for (let i = state.currentQueueIndex; i < state.fullExecutionQueue.length; i++) {
      // The pause is now handled inside runTimerAnimation, so this top-level check is no longer needed
      // a while loop here would also block the main thread.
      if (getState().status !== 'running') {
          log('Trainer', 'Workout loop terminated.');
          return;
      }

      updateState({ currentQueueIndex: i });
      const phase = state.fullExecutionQueue[i];

      log('Trainer-Loop', `Executing phase ${i}:`, phase.type);

      // Resolve text_key to text if needed
      if (phase.text_key && !phase.text) {
          phase.text = UI_TEXT[phase.text_key] || '';
      }

      switch (phase.type) {
          case 'speech':
              if (state.isAudioEnabled && phase.text) {
                  if(phase.await) await speak(phase.text);
                  else speak(phase.text);
              }
              break;
          case 'audio':
               if (state.isAudioEnabled) {
                  if (phase.cue === 'tick') playTick();
               }
              break;
          case 'movement':
          case 'rest':
          case 'static_hold':
              await runTimerAnimation(phase.duration_ms);
              break;
          case 'set_completed':
              collectSetData();
              break;
          case 'manual_rep':
              // This phase is handled by user interaction via incrementManualRep
              // We wait here until the rep count is met
              await new Promise(resolve => {
                  const checkReps = () => {
                      const currentState = getState();
                      const currentPhase = currentState.fullExecutionQueue[currentState.currentQueueIndex];
                      if (!currentPhase || currentPhase.repsCompleted >= currentPhase.context.reps) {
                          document.removeEventListener('workoutStateChange', checkReps);
                          resolve();
                      }
                  };
                  document.addEventListener('workoutStateChange', checkReps);
              });
              break;
      }
  }
  // If the loop completes naturally, end the workout
  if (getState().status === 'running') {
      endWorkout();
  }
}

export function resetWorkoutState() {
  log('Trainer', 'Resetting workout state.');
  stopAllAnimations();
  resetState();
}

export function initializeWorkout(plannedExercises, isoDate) {
  if (!plannedExercises || plannedExercises.length === 0) {
      return;
  }
  resetWorkoutState();

  const fullExecutionQueue = buildFullWorkoutQueue(plannedExercises);

  const initialState = {
      workoutDate: isoDate,
      exerciseQueue: JSON.parse(JSON.stringify(plannedExercises)),
      fullExecutionQueue: fullExecutionQueue,
      currentQueueIndex: 0,
      status: 'idle',
      startTime: 0,
      setsData: []
  };
  updateState(initialState);
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
        duration: state.lastTimerDuration || 0, // Duration from animation engine
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
  
  if (getState().status !== 'idle') {
      log('Trainer', 'Workout start aborted, status changed during announcement.');
      return;
  }

  updateState({ status: 'running', startTime: Date.now() });
  runWorkoutLoop(); // Start the master loop
  log('Trainer', 'Workout started.');
}

export function pauseWorkout() {
  const state = getState();
  if (state.status === 'running') {
      updateState({ status: 'paused' });
      log('Trainer', 'Workout paused.');
  }
}

export function resumeWorkout() {
  const state = getState();
  if (state.status === 'paused') {
      updateState({ status: 'running' });
      log('Trainer', 'Workout resumed.');
  }
}

export function incrementManualRep() {
    const state = getState();
    if (state.status !== 'running') return;

    const currentPhase = state.fullExecutionQueue[state.currentQueueIndex];
    if (currentPhase && currentPhase.type === 'manual_rep') {
        const newRepCount = (currentPhase.repsCompleted || 0) + 1;
        currentPhase.repsCompleted = newRepCount;
        // Dispatch change to notify the waiting promise in the loop
        document.dispatchEvent(new CustomEvent('workoutStateChange'));
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
  stopAllAnimations();
  updateState({ status: 'finished' });

  if (finalState.startTime === 0) {
      log('Trainer', 'Workout ended prematurely, not saving summary.');
      setView('planner');
      return;
  }
  const summary = createWorkoutSummary(finalState);
  setLastWorkoutSummary(summary);
  addWorkoutToHistory(summary);

  setView('debriefing');
}
