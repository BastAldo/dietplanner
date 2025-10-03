import { getWorkoutState } from './state.js';

export function buildExecutionQueueForCurrentSet() {
  const state = getWorkoutState();
  const currentExercise = state.exerciseQueue[state.currentExerciseIndex];
  if (!currentExercise || currentExercise.type !== 'reps') return [];

  const queue = [];
  const reps = currentExercise.defaultReps;
  const tempo = currentExercise.defaultTempo;

  for (let i = 0; i < reps; i++) {
    if (tempo) {
      queue.push({ name: 'pre-up', rep: i + 1, duration: 700 });
      queue.push({ name: 'up', rep: i + 1, duration: tempo.up * 1000 });
      if (tempo.hold > 0) {
        queue.push({ name: 'pre-hold', rep: i + 1, duration: 700 });
        queue.push({ name: 'hold', rep: i + 1, duration: tempo.hold * 1000 });
      }
      queue.push({ name: 'pre-down', rep: i + 1, duration: 700 });
      queue.push({ name: 'down', rep: i + 1, duration: tempo.down * 1000 });
    }
  }
  return queue;
}
