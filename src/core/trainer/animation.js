import { getWorkoutState, updateState } from './state.js';
import { advanceToNextSet } from './machine.js';
import { completeSet } from '../trainer.js';
import { playTick, playStartCue, playStopCue, speak } from '../../utils/audioFeedback.js';

let animationFrameId = null;
let lastTickTimestamp = 0;

function processQueue() {
  const state = getWorkoutState();
  if (state.status !== 'running') return;

  const { executionQueue, currentPhaseIndex, isAudioEnabled } = state;
  const currentPhase = executionQueue[currentPhaseIndex];

  // If it's an instantaneous command (like audio), execute and advance
  if (currentPhase && currentPhase.type) {
    if (isAudioEnabled) {
      if (currentPhase.type === 'audio') {
        if (currentPhase.cue === 'tick') playTick();
        else if (currentPhase.cue === 'start') playStartCue();
        else if (currentPhase.cue === 'stop') playStopCue();
      } else if (currentPhase.type === 'speech') {
        speak(currentPhase.text);
      }
    }
    const newPhaseIndex = currentPhaseIndex + 1;
    if (newPhaseIndex < executionQueue.length) {
      updateState({ currentPhaseIndex: newPhaseIndex });
      processQueue(); // Process next item immediately
    } else {
      completeSet();
    }
  }
}

function tick(timestamp) {
  if (lastTickTimestamp === 0) {
    lastTickTimestamp = timestamp;
  }
  const deltaTime = timestamp - lastTickTimestamp;
  lastTickTimestamp = timestamp;

  const state = getWorkoutState();
  if (state.status === 'finished' || state.status === 'paused' || state.status === 'idle') {
    stopAnimation();
    return;
  }

  if (state.status === 'running') {
      const { executionQueue, currentPhaseIndex } = state;
      const currentPhase = executionQueue[currentPhaseIndex];

      // It must be a timed phase (movement)
      if (currentPhase && currentPhase.duration) {
        const newPhaseTimeElapsed = state.phaseTimeElapsed + deltaTime;

        if (newPhaseTimeElapsed >= currentPhase.duration) {
          const newPhaseIndex = currentPhaseIndex + 1;
          updateState({
            currentPhaseIndex: newPhaseIndex,
            phaseTimeElapsed: 0,
            currentRep: executionQueue[newPhaseIndex]?.rep || state.currentRep,
          });
          processQueue(); // Check if the next item is a command
        } else {
          updateState({ phaseTimeElapsed: newPhaseTimeElapsed });
        }
      } else if (!currentPhase) {
          // End of queue
          completeSet();
      }

  } else if (state.executionMode === 'static_hold') {
      const newSetTimeRemaining = state.setTimeRemaining - deltaTime;
      if (newSetTimeRemaining <= 0) {
          if (state.isAudioEnabled) playStopCue();
          completeSet();
      } else {
          updateState({ setTimeRemaining: newSetTimeRemaining });
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

  if (getWorkoutState().status !== 'paused' && getWorkoutState().status !== 'idle') {
    animationFrameId = requestAnimationFrame(tick);
  }
}

export function startAnimation() {
  if (animationFrameId) return;
  lastTickTimestamp = 0;
  processQueue(); // Initial check for commands at the start
  animationFrameId = requestAnimationFrame(tick);
}

export function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
