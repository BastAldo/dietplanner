import { getWorkoutState } from './state.js';
import { getState as getGlobalState } from '../state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { TEMPO_GUIDED_FLOW } from '../../config/trainerFlows.js';

function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function interpretTemplate(template, exercise, reps, currentSet) {
  const queue = [];
  for (const command of template) {
    if (command.type === 'loop') {
      const loopCount = command.target === 'reps' ? reps : 1;
      for (let i = 0; i < loopCount; i++) {
        const repNumber = i + 1;
        const subQueue = interpretTemplate(command.actions, exercise, repNumber, currentSet);
        subQueue.forEach(subCmd => {
          if (subCmd.rep) subCmd.rep = repNumber; // Ensure rep number is correctly assigned
        });
        queue.push(...subQueue);
      }
    } else if (command.type === 'conditional') {
      const conditionValue = getNestedProperty(exercise.defaultTempo, command.condition.split(' > ')[0]);
      if (conditionValue > 0) {
        queue.push(...interpretTemplate(command.actions, exercise, reps, currentSet));
      }
    } else {
      const newCommand = { ...command };
      if (newCommand.text_key) {
        newCommand.text = UI_TEXT[newCommand.text_key] || '';
      }
      if (newCommand.duration_from) {
        newCommand.duration_ms = getNestedProperty(exercise.defaultTempo, newCommand.duration_from) * 1000;
      }
      if (newCommand.phase) {
        newCommand.rep = reps; // Assign current rep number to movement phases
      }
      queue.push(newCommand);
    }
  }
  return queue;
}

export function buildExecutionQueueForCurrentSet() {
  const state = getWorkoutState();
  const currentExercise = state.exerciseQueue[state.currentExerciseIndex];
  const { execution_mode, defaultReps, defaultTempo } = currentExercise;

  let queue = [];
  if (execution_mode === 'tempo_guided') {
    queue = interpretTemplate(TEMPO_GUIDED_FLOW, { defaultTempo }, defaultReps, state.currentSet);
  }

  const { debugMode } = getGlobalState();
  if (debugMode) {
    console.groupCollapsed(`[Trainer-Queue] Execution Queue for: ${currentExercise.name} - Set ${state.currentSet}`);
    console.table(queue);
    console.groupEnd();
  }

  return queue;
}
