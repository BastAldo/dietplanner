import { getWorkoutState, updateState } from './state.js';
import { log } from '../../utils/logger.js';

let animationFrameId = null;
let currentAnimationPromiseResolver = null;

/**
 * The specialized "Animator" function.
 * Its only job is to run a timer for a given duration and update the UI,
 * while correctly handling pause and resume.
 * @param {number} durationMs - The total duration of the animation.
 * @returns {Promise<void>}
 */
export function runTimerAnimation(durationMs) {
  return new Promise(resolve => {
    currentAnimationPromiseResolver = resolve;
    let startTime = 0;
    let timePaused = 0;
    let pauseStartTime = 0;

    function tick(timestamp) {
      // Hard stop for termination
      if (getWorkoutState().status === 'finished') {
        stopAllAnimations();
        return;
      }

      if (startTime === 0) {
        startTime = timestamp;
      }

      // Handle Pause State
      if (getWorkoutState().status === 'paused') {
        if (pauseStartTime === 0) {
          pauseStartTime = timestamp; // Record when pause began
        }
        // Keep ticking but do nothing else
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      // Handle Resuming from Pause
      if (pauseStartTime > 0) {
        timePaused += (timestamp - pauseStartTime); // Add paused duration
        pauseStartTime = 0; // Reset pause marker
      }

      const elapsed = timestamp - startTime - timePaused;

      if (elapsed >= durationMs) {
        updateState({ phaseTimeElapsed: durationMs, lastTimerDuration: durationMs });
        animationFrameId = null;
        if (currentAnimationPromiseResolver) {
          currentAnimationPromiseResolver();
          currentAnimationPromiseResolver = null;
        }
      } else {
        updateState({ phaseTimeElapsed: elapsed, lastTimerDuration: elapsed });
        document.dispatchEvent(new CustomEvent('workoutStateChange'));
        animationFrameId = requestAnimationFrame(tick);
      }
    }

    animationFrameId = requestAnimationFrame(tick);
    log('Trainer-Animation', `Animation started for ${durationMs}ms.`);
  });
}

/**
 * Stops any currently active animation frame loop and resolves its promise.
 * This is a hard stop, used for workout termination.
 */
export function stopAllAnimations() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    log('Trainer-Animation', 'Animation frame cancelled.');
  }
  if (currentAnimationPromiseResolver) {
    log('Trainer-Animation', 'Resolving pending animation promise for termination.');
    currentAnimationPromiseResolver();
    currentAnimationPromiseResolver = null;
  }
}