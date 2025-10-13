import { getWorkoutState, updateState } from './state.js';
import { collectSetData, endWorkout } from '../trainer.js';
import { playTick, playStartCue, playStopCue, speak } from '../../utils/audioFeedback.js';
import { log } from '../../utils/logger.js';

let animationFrameId = null;
let lastTickTimestamp = 0;

function advanceQueue() {
    const state = getWorkoutState();
    const newIndex = state.currentQueueIndex + 1;
    updateState({
        currentQueueIndex: newIndex,
        phaseStartTime: Date.now(),
        phaseTimeElapsed: 0
    });
}

async function handleNonTimedPhase(phase) {
  if (!phase) return;

  log('Trainer-Animation', `Handling non-timed phase:`, phase);

  if (phase.type === 'set_completed') {
      collectSetData();
  } else {
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
  }

  const currentState = getWorkoutState();
  if (currentState.status === 'running') {
      advanceQueue();
  }
}

async function tick(timestamp) {
  if (lastTickTimestamp === 0) {
    lastTickTimestamp = timestamp;
  }
  const deltaTime = timestamp - lastTickTimestamp;
  lastTickTimestamp = timestamp;

  const state = getWorkoutState();
  if (state.status !== 'running') {
    stopAnimation();
    return;
  }

  const { fullExecutionQueue, currentQueueIndex } = state;
  const currentPhase = fullExecutionQueue[currentQueueIndex];

  if (!currentPhase) {
    log('Trainer-Animation', 'Queue finished. Ending workout.');
    endWorkout();
    return;
  }

  const phaseType = currentPhase.type;

  if (phaseType === 'movement' || phaseType === 'rest' || phaseType === 'static_hold') {
    const newPhaseTimeElapsed = state.phaseTimeElapsed + deltaTime;
    if (newPhaseTimeElapsed >= currentPhase.duration_ms) {
      advanceQueue();
    } else {
      updateState({ phaseTimeElapsed: newPhaseTimeElapsed });
    }
  } else if (phaseType === 'manual_rep') {
      // This phase is advanced by incrementManualRep(), tick does nothing.
  } else {
    await handleNonTimedPhase(currentPhase);
  }

  // Must dispatch state change for UI to update timer rings
  if (phaseType === 'movement' || phaseType === 'rest' || phaseType === 'static_hold' || phaseType === 'manual_rep') {
    document.dispatchEvent(new CustomEvent('workoutStateChange'));
  }

  animationFrameId = requestAnimationFrame(tick);
}

export function startAnimation() {
  if (animationFrameId) return;
  lastTickTimestamp = 0;
  animationFrameId = requestAnimationFrame(tick);
  log('Trainer-Animation', 'Animation started.');
}

export function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  log('Trainer-Animation', 'Animation stopped.');
}
