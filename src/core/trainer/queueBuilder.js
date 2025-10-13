import { getState as getGlobalState } from '../state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { TEMPO_GUIDED_FLOW } from '../../config/trainerFlows.js';

function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function interpretTemplate(template, exercise, context) {
  // Use a deep copy of the template to prevent mutation of the original object
  const deepCopiedTemplate = JSON.parse(JSON.stringify(template));
  const queue = [];

  for (const command of deepCopiedTemplate) {
    const newCommand = { ...command, context: { ...context, exercise } };

    if (newCommand.type === 'loop') {
      const loopCount = getNestedProperty(exercise, newCommand.target) || 0;
      for (let i = 0; i < loopCount; i++) {
        const loopContext = { ...context, rep: i + 1 };
        // Recursively call with the actions part of the command
        queue.push(...interpretTemplate(command.actions, exercise, loopContext));
      }
    } else if (newCommand.type === 'conditional') {
      const [prop, value] = newCommand.condition.split(' > ');
      const propValue = getNestedProperty(exercise, prop);
      if (propValue > parseInt(value, 10)) {
        queue.push(...interpretTemplate(command.actions, exercise, context));
      }
    } else {
      if (newCommand.text_key) {
        newCommand.text = UI_TEXT[newCommand.text_key] || '';
      }
      if (newCommand.text_value) {
          newCommand.text = `${newCommand.text} ${getNestedProperty(exercise, newCommand.text_value)}`;
      }
      if (newCommand.duration_from) {
        newCommand.duration_ms = (getNestedProperty(exercise, newCommand.duration_from) || 0) * 1000;
      }
      queue.push(newCommand);
    }
  }
  return queue;
}

export function buildFullWorkoutQueue(exercisePlan) {
  const fullQueue = [];

  exercisePlan.forEach((exercise, exerciseIndex) => {
    const execution_mode = exercise.execution_mode || 'tempo_guided';

    for (let set = 1; set <= exercise.defaultSets; set++) {
      const context = {
        exercise,
        set,
        reps: exercise.defaultReps,
        weight: exercise.defaultWeight
      };

      if (execution_mode === 'tempo_guided') {
          fullQueue.push(...interpretTemplate(TEMPO_GUIDED_FLOW, exercise, context));
      } else if (execution_mode === 'static_hold') {
          fullQueue.push({ type: 'static_hold', duration_ms: exercise.defaultDuration * 1000, context });
          fullQueue.push({ type: 'set_completed', context });
      } else if (execution_mode === 'manual_reps') {
          fullQueue.push({ type: 'manual_rep', context });
          fullQueue.push({ type: 'set_completed', context });
      }

      // Add rest period if it's not the last set of the exercise
      if (set < exercise.defaultSets && exercise.defaultRest > 0) {
        fullQueue.push({ type: 'speech', text_key: 'VOICE_GUIDE_REST_START', await: true, context });
        fullQueue.push({ type: 'rest', duration_ms: exercise.defaultRest * 1000, context });

        const nextExercise = exercisePlan[exerciseIndex + 1];
        // Announce next exercise only on the last rest before a new exercise starts
        if (set === exercise.defaultSets && nextExercise) {
            fullQueue.push({ type: 'speech', text_key: 'VOICE_GUIDE_NEXT_EXERCISE', text_value: 'name', await: true, context: { exercise: nextExercise } });
        }
      }
    }
  });

  const finalContext = exercisePlan.length > 0 ? { exercise: exercisePlan[exercisePlan.length - 1] } : {};
  fullQueue.push({ type: 'speech', text_key: 'VOICE_GUIDE_WORKOUT_COMPLETED', await: true, context: finalContext });

  const { debugMode } = getGlobalState();
  if (debugMode) {
    console.groupCollapsed(`[Trainer-Queue] Full Workout Execution Queue Built`);
    console.table(fullQueue.map(item => ({...item, context: `Ex: ${item.context?.exercise?.name || 'N/A'} | Set: ${item.context?.set || '-'} | Rep: ${item.context?.rep || '-'}`})));
    console.groupEnd();
  }

  return fullQueue;
}
