import { getWorkoutState } from './state.js';
import { getState as getGlobalState } from '../state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { TEMPO_GUIDED_FLOW } from '../../config/trainerFlows.js';

function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function interpretTemplate(template, exercise, loopContext) {
  const queue = [];
  for (const command of template) {
    if (command.type === 'loop') {
      const loopCount = getNestedProperty(exercise, command.target);
      for (let i = 0; i < loopCount; i++) {
        const newLoopContext = { ...loopContext, rep: i + 1 };
        queue.push(...interpretTemplate(command.actions, exercise, newLoopContext));
      }
    } else if (command.type === 'conditional') {
      const [prop, value] = command.condition.split(' > ');
      const propValue = getNestedProperty(exercise, prop);
      if (propValue > parseInt(value, 10)) {
        queue.push(...interpretTemplate(command.actions, exercise, loopContext));
      }
    } else {
      const newCommand = { ...command };
      if (newCommand.text_key) {
        newCommand.text = UI_TEXT[newCommand.text_key] || '';
      }
      if (newCommand.duration_from) {
        newCommand.duration_ms = getNestedProperty(exercise, newCommand.duration_from) * 1000;
      }
      if (newCommand.phase) {
        newCommand.rep = loopContext.rep;
      }
      queue.push(newCommand);
    }
  }
  return queue;
}

export function buildExecutionQueueForCurrentSet() {
  const state = getWorkoutState();
  const currentExercise = state.exerciseQueue[state.currentExerciseIndex];
  const { execution_mode } = currentExercise;

  let queue = [];
  if (execution_mode === 'tempo_guided') {
    queue = interpretTemplate(TEMPO_GUIDED_FLOW, currentExercise, { set: state.currentSet });
  }

  const { debugMode } = getGlobalState();
  if (debugMode) {
    console.groupCollapsed(`[Trainer-Queue] Execution Queue for: ${currentExercise.name} - Set ${state.currentSet}`);
    console.table(queue);
    console.groupEnd();
  }

  return queue;
}
