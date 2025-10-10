import { getWorkoutState, updateState } from './state.js';
import { advanceToNextSet } from './machine.js';
import { completeSet } from '../trainer.js';
import { playTick, playStartCue, playStopCue, speak } from '../../utils/audioFeedback.js';
import { log } from '../../utils/logger.js';

let animationFrameId = null;
let lastTickTimestamp = 0;

async function processQueue() {
  const state = getWorkoutState();
  if (state.status !== 'running') return;

  const { executionQueue, currentPhaseIndex, isAudioEnabled } = state;
  const currentPhase = executionQueue[currentPhaseIndex];

  log('Trainer-Animation', `Processing queue index: ${currentPhaseIndex}`, currentPhase);

  if (currentPhase && currentPhase.type) {
    if (isAudioEnabled) {
      if (currentPhase.type === 'audio') {
        if (currentPhase.cue === 'tick') playTick();
        else if (currentPhase.cue === 'start') playStartCue();
        else if (currentPhase.cue === 'stop') playStopCue();
      } else if (currentPhase.type === 'speech') {
        if (currentPhase.await) {
          await speak(currentPhase.text);
        } else {
          speak(currentPhase.text);
        }
      }
    }

    const newPhaseIndex = currentPhaseIndex + 1;
    if (newPhaseIndex < executionQueue.length) {
      updateState({ currentPhaseIndex: newPhaseIndex });
      await processQueue();
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
    if (state.executionMode === 'tempo_guided') {
      const { executionQueue, currentPhaseIndex } = state;
      const currentPhase = executionQueue[currentPhaseIndex];

      if (currentPhase && currentPhase.duration_ms) {
        const newPhaseTimeElapsed = state.phaseTimeElapsed + deltaTime;

        if (newPhaseTimeElapsed >= currentPhase.duration_ms) {
          const newPhaseIndex = currentPhaseIndex + 1;
          updateState({
            currentPhaseIndex: newPhaseIndex,
            phaseTimeElapsed: 0,
            currentRep: executionQueue[newPhaseIndex]?.rep || state.currentRep,
          });
          processQueue();
        } else {
          updateState({ phaseTimeElapsed: newPhaseTimeElapsed });
        }
      } else if (!currentPhase) {
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
  processQueue();
  animationFrameId = requestAnimationFrame(tick);
}

export function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
