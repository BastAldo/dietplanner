import { getWorkoutState, updateState } from './state.js';
import { advanceToNextSet } from './machine.js';

let animationFrameId = null;
let lastTickTimestamp = 0;

function tick(timestamp) {
  if (lastTickTimestamp === 0) {
    lastTickTimestamp = timestamp;
  }
  const deltaTime = timestamp - lastTickTimestamp;
  lastTickTimestamp = timestamp;

  const state = getWorkoutState();

  if (state.status === 'running') {
    const newPhaseTimeElapsed = state.phaseTimeElapsed + deltaTime;
    const currentPhase = state.executionQueue[state.currentPhaseIndex];

    if (newPhaseTimeElapsed >= currentPhase.duration) {
      const newPhaseIndex = state.currentPhaseIndex + 1;
      const nextPhase = state.executionQueue[newPhaseIndex];

      if (nextPhase) {
        updateState({
          currentPhaseIndex: newPhaseIndex,
          phaseTimeElapsed: 0,
          currentRep: nextPhase.rep,
        });
      } else {
        const currentExercise = state.exerciseQueue[state.currentExerciseIndex];
        updateState({
          status: 'resting',
          restTimeRemaining: currentExercise.defaultRest * 1000,
        });
      }
    } else {
      updateState({ phaseTimeElapsed: newPhaseTimeElapsed });
    }
  } else if (state.status === 'resting') {
    const newRestTimeRemaining = state.restTimeRemaining - deltaTime;
    if (newRestTimeRemaining <= 0) {
      advanceToNextSet();
    } else {
      updateState({ restTimeRemaining: newRestTimeRemaining });
    }
  }
  
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
  
  const newState = getWorkoutState();
  if (newState.status !== 'paused' && newState.status !== 'idle' && newState.status !== 'finished') {
    animationFrameId = requestAnimationFrame(tick);
  }
}

export function startAnimation() {
  if (animationFrameId) return;
  lastTickTimestamp = 0;
  animationFrameId = requestAnimationFrame(tick);
}

export function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
