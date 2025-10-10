import { getWorkoutState } from './state.js';
import { getState as getGlobalState } from '../state.js';
import { UI_TEXT } from '../../config/uiText.js';

export function buildExecutionQueueForCurrentSet() {
  const state = getWorkoutState();
  const currentExercise = state.exerciseQueue[state.currentExerciseIndex];
  if (!currentExercise || currentExercise.type !== 'reps') return [];

  const queue = [];
  const reps = currentExercise.defaultReps;
  const tempo = currentExercise.defaultTempo;

  queue.push({ type: 'speech', text: `${UI_TEXT.VOICE_GUIDE_SET_START}` });

  for (let i = 0; i < reps; i++) {
    if (tempo) {
      // UP
      queue.push({ type: 'speech', text: UI_TEXT.VOICE_GUIDE_PHASE_UP });
      queue.push({ name: 'pre-up', rep: i + 1, duration: 700 });
      queue.push({ name: 'up', rep: i + 1, duration: tempo.up * 1000 });
      queue.push({ type: 'audio', cue: 'tick' });

      // HOLD
      if (tempo.hold > 0) {
        queue.push({ type: 'speech', text: UI_TEXT.VOICE_GUIDE_PHASE_HOLD });
        queue.push({ name: 'pre-hold', rep: i + 1, duration: 700 });
        queue.push({ name: 'hold', rep: i + 1, duration: tempo.hold * 1000 });
        queue.push({ type: 'audio', cue: 'tick' });
      }

      // DOWN
      queue.push({ type: 'speech', text: UI_TEXT.VOICE_GUIDE_PHASE_DOWN });
      queue.push({ name: 'pre-down', rep: i + 1, duration: 700 });
      queue.push({ name: 'down', rep: i + 1, duration: tempo.down * 1000 });
      queue.push({ type: 'audio', cue: 'tick' });
    }
  }
  queue.push({ type: 'audio', cue: 'stop' });

  const { debugMode } = getGlobalState();
  if (debugMode) {
    console.groupCollapsed(`[Trainer-Queue] Execution Queue for: ${currentExercise.name} - Set ${state.currentSet}`);
    console.table(queue);
    console.groupEnd();
  }

  return queue;
}
