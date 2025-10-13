import { getWorkoutState, updateState } from './state.js';
import { log } from '../../utils/logger.js';

let animationFrameId = null;
let currentAnimationPromiseResolver = null; // Shared resolver

/**
 * The specialized "Animator" function.
 * Its only job is to run a timer for a given duration and update the UI.
 * It returns a Promise that resolves when the timer is complete.
 * @param {number} durationMs - The total duration of the animation.
 * @returns {Promise<void>}
 */
export function runTimerAnimation(durationMs) {
  return new Promise(resolve => {
    // Store the resolver so it can be called externally to stop the animation
    currentAnimationPromiseResolver = resolve;
    let startTime = 0;

    function tick(timestamp) {
      if (startTime === 0) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;

      if (elapsed >= durationMs) {
        updateState({ phaseTimeElapsed: durationMs, lastTimerDuration: durationMs });
        animationFrameId = null;
        if (currentAnimationPromiseResolver) {
          currentAnimationPromiseResolver();
          currentAnimationPromiseResolver = null;
        }
      } else {
        updateState({ phaseTimeElapsed: elapsed, lastTimerDuration: elapsed });
        // Dispatch event for UI to update timer rings
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
 */
export function stopAllAnimations() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    log('Trainer-Animation', 'Animation frame cancelled.');
  }
  // If there's a pending promise from an animation, resolve it now.
  if (currentAnimationPromiseResolver) {
    log('Trainer-Animation', 'Resolving pending animation promise.');
    currentAnimationPromiseResolver();
    currentAnimationPromiseResolver = null;
  }
}