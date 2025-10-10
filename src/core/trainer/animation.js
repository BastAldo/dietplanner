import { getWorkoutState, updateState } from './state.js';
import { advanceToNextSet } from './machine.js';
import { completeSet } from '../trainer.js';
import { playTick, playStartCue, playStopCue, speak } from '../../utils/audioFeedback.js';
import { log } from '../../utils/logger.js';

let animationFrameId = null;
let lastTickTimestamp = 0;
let isProcessing = false; // Lock to prevent re-entrant processing

async function processCurrentPhase() {
  if (isProcessing) return;
  const state = getWorkoutState();
  if (state.status !== 'running') return;

  const { executionQueue, currentPhaseIndex } = state;
  const phase = executionQueue[currentPhaseIndex];

  if (!phase) {
    completeSet();
    return;
  }

  // If the phase is timed, stop processing and let tick() handle it
  if (phase.type === 'movement') {
    return;
  }

  isProcessing = true;
  log('Trainer-Animation', `Handling phase:`, phase);
  
  if (state.isAudioEnabled) {
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
  
  // Check status again, as it might have changed during an awaited speech
  if (getWorkoutState().status === 'running') {
      const newIndex = getWorkoutState().currentPhaseIndex + 1;
      updateState({ 
        currentPhaseIndex: newIndex,
        currentRep: getWorkoutState().executionQueue[newIndex]?.rep || getWorkoutState().currentRep,
      });
      isProcessing = false;
      // Immediately process the next phase if it's also not a timed event
      await processCurrentPhase();
  } else {
      isProcessing = false;
  }
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
      const { executionQueue, currentPhaseIndex } = state;
      const currentPhase = executionQueue[currentPhaseIndex];

      if (!currentPhase) {
        completeSet();
        stopAnimation();
        return;
      }

      if (currentPhase.type === 'movement') {
        const newPhaseTimeElapsed = state.phaseTimeElapsed + deltaTime;
        if (newPhaseTimeElapsed >= currentPhase.duration_ms) {
          updateState({ currentPhaseIndex: currentPhaseIndex + 1, phaseTimeElapsed: 0 });
          processCurrentPhase(); // Process what comes after the movement
        } else {
          updateState({ phaseTimeElapsed: newPhaseTimeElapsed });
        }
      } else {
        // Non-timed events are handled by processCurrentPhase, which is called
        // either after a movement or at the start.
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
  // Initial call to start processing non-timed events at the beginning of the queue
  processCurrentPhase();
  animationFrameId = requestAnimationFrame(tick);
}

export function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  isProcessing = false; // Reset lock on stop
}
