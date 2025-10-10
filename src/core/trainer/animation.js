import { getWorkoutState, updateState } from './state.js';
import { advanceToNextSet } from './machine.js';
import { completeSet } from '../trainer.js';
import { playTick, playStartCue, playStopCue, speak } from '../../utils/audioFeedback.js';
import { log } from '../../utils/logger.js';

let animationFrameId = null;
let lastTickTimestamp = 0;
let isProcessing = false; // Lock to prevent re-entrant processing

async function handleNonTimedPhase(phase) {
  if (!phase || isProcessing) return;

  isProcessing = true;
  log('Trainer-Animation', `Handling phase:`, phase);

  const { isAudioEnabled } = getWorkoutState();
  if (isAudioEnabled) {
    if (phase.type === 'audio') {
      if (phase.cue === 'tick') playTick();
      else if (phase.cue === 'start') playStartCue();
      else if (phase.cue === 'stop') playStopCue();
    } else if (phase.type === 'speech') {
      if (phase.await) {
        await speak(phase.text);
      } else {
        speak(phase.text);
      }
    }
  }

  const currentState = getWorkoutState();
  if (currentState.status === 'running') {
      const newIndex = currentState.currentPhaseIndex + 1;
      updateState({ 
        currentPhaseIndex: newIndex,
        currentRep: currentState.executionQueue[newIndex]?.rep || currentState.currentRep 
      });
  }
  isProcessing = false;
}

function tick(timestamp) {
  if (lastTickTimestamp === 0) {
    lastTickTimestamp = timestamp;
  }
  const deltaTime = timestamp - lastTickTimestamp;
  lastTickTimestamp = timestamp;

  const state = getWorkoutState();
  if (state.status !== 'running' && state.status !== 'resting') {
    stopAnimation();
    return;
  }

  if (state.status === 'running') {
    if (state.executionMode === 'tempo_guided') {
      if (isProcessing) {
        animationFrameId = requestAnimationFrame(tick);
        return; // Wait for async operation to complete
      }

      const { executionQueue, currentPhaseIndex } = state;
      const currentPhase = executionQueue[currentPhaseIndex];

      if (!currentPhase) {
        completeSet();
        return; // Stop this tick, state will change to 'resting'
      }

      if (currentPhase.type === 'movement') {
        const newPhaseTimeElapsed = state.phaseTimeElapsed + deltaTime;
        if (newPhaseTimeElapsed >= currentPhase.duration_ms) {
          updateState({ currentPhaseIndex: currentPhaseIndex + 1, phaseTimeElapsed: 0 });
        } else {
          updateState({ phaseTimeElapsed: newPhaseTimeElapsed });
        }
      } else {
        handleNonTimedPhase(currentPhase);
      }

    } else if (state.executionMode === 'static_hold') {
      const newSetTimeRemaining = state.setTimeRemaining - deltaTime;
      if (newSetTimeRemaining <= 0) {
        if (state.isAudioEnabled) playStopCue();
        completeSet();
      } else {
        updateState({ setTimeRemaining: newSetTimeRemaining });
      }
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
  animationFrameId = requestAnimationFrame(tick);
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
  isProcessing = false;
}
