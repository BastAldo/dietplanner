import { getWorkoutState, updateState } from './state.js';
import { log } from '../../utils/logger.js';

let animationFrameId = null;

/**
 * The specialized "Animator" function.
 * Its only job is to run a timer for a given duration and update the UI.
 * It returns a Promise that resolves when the timer is complete.
 * @param {number} durationMs - The total duration of the animation.
 * @returns {Promise<void>}
 */
export function runTimerAnimation(durationMs) {
  return new Promise(resolve => {
    let startTime = 0;
    let lastTickTimestamp = 0;

    function tick(timestamp) {
      if (getWorkoutState().status !== 'running') {
        stopAllAnimations();
        resolve(); // Resolve promise if workout is paused/ended
        return;
      }

      if (startTime === 0) {
        startTime = timestamp;
        lastTickTimestamp = timestamp;
      }

      const elapsed = timestamp - startTime;
      const deltaTime = timestamp - lastTickTimestamp;
      lastTickTimestamp = timestamp;

      if (elapsed >= durationMs) {
        updateState({ phaseTimeElapsed: durationMs, lastTimerDuration: durationMs });
        animationFrameId = null;
        resolve();
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
 * Stops any currently active animation frame loop.
 */
export function stopAllAnimations() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    log('Trainer-Animation', 'All animations stopped.');
  }
}
