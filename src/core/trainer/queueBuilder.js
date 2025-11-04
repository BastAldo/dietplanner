import { getState as getGlobalState } from '../state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { TEMPO_GUIDED_FLOW, INTRO_FLOW, FINAL_FLOW, REST_FLOW, NEXT_EXERCISE_ANNOUNCEMENT_FLOW } from '../../config/trainerFlows.js';

function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function interpretTemplate(template, exercise, context) {
  // Use a deep copy of the template to prevent mutation of the original object
  const deepCopiedTemplate = JSON.parse(JSON.stringify(template));
  const queue = [];

  for (const command of deepCopiedTemplate) {
    // The context for this command instance
    const instanceContext = { ...context, exercise };

    if (command.type === 'loop') {
      const loopCount = getNestedProperty(exercise, command.target) || 0;
      for (let i = 0; i < loopCount; i++) {
        const loopContext = { ...context, rep: i + 1 };
        // Recursively call with the actions part of the command
        queue.push(...interpretTemplate(command.actions, exercise, loopContext));
      }
    } else if (command.type === 'conditional') {
      const [prop, value] = command.condition.split(' > ');
      const propValue = getNestedProperty(exercise, prop);
      if (propValue > parseInt(value, 10)) {
        queue.push(...interpretTemplate(command.actions, exercise, context));
      }
    } else {
      // Resolve text keys now, during the build phase
      if (command.text_key) {
        command.text = UI_TEXT[command.text_key] || '';
      }
      if (command.text_value) {
          // Use the instance context to get the correct exercise name
          command.text = `${command.text} ${getNestedProperty(instanceContext.exercise, command.text_value)}`;
      }
      if (command.duration_from) {
        command.duration_ms = (getNestedProperty(exercise, command.duration_from) || 0) * 1000;
      }
      // Add the context to the final command object
      command.context = instanceContext;
      queue.push(command);
    }
  }
  return queue;
}

export function buildFullWorkoutQueue(exercisePlan) {
  const fullQueue = [];

  // Add the initial announcement
  if (exercisePlan.length > 0) {
      fullQueue.push(...interpretTemplate(INTRO_FLOW, exercisePlan[0], {}));
  }

  exercisePlan.forEach((exercise, exerciseIndex) => {
    const execution_mode = exercise.execution_mode || 'guided_tempo'; // Default a 'guided_tempo'

    for (let set = 1; set <= exercise.defaultSets; set++) {
      const context = {
        exercise,
        set,
        reps: exercise.defaultReps, // Usato da guided_tempo
        repsMin: exercise.defaultRepsMin, // Usato da logging
        repsMax: exercise.defaultRepsMax, // Usato da logging
        weight: exercise.defaultWeight
      };

      if (execution_mode === 'guided_tempo') {
          fullQueue.push(...interpretTemplate(TEMPO_GUIDED_FLOW, exercise, context));
      } else if (execution_mode === 'guided_static') {
          fullQueue.push({ type: 'static_hold', duration_ms: exercise.defaultDuration * 1000, context });
          fullQueue.push({ type: 'set_completed', context });
      } else if (execution_mode === 'logging') { // Sostituisce 'manual_reps'
          fullQueue.push({ type: 'logging', context }); // Nuova fase 'logging'
          fullQueue.push({ type: 'set_completed', context });
      }

      // Add rest period
      const isLastSetOfExercise = set === exercise.defaultSets;
      const isLastExercise = exerciseIndex === exercisePlan.length - 1;

      if (!isLastSetOfExercise || !isLastExercise) {
          if (exercise.defaultRest > 0) {
              fullQueue.push(...interpretTemplate(REST_FLOW, exercise, context));
          }
      }

      // Announce next exercise on the last rest before a new one starts
      if (isLastSetOfExercise && !isLastExercise) {
          const nextExercise = exercisePlan[exerciseIndex + 1];
          fullQueue.push(...interpretTemplate(NEXT_EXERCISE_ANNOUNCEMENT_FLOW, nextExercise, {}));
      }
    }
  });

  // Add the final announcement
  fullQueue.push(...interpretTemplate(FINAL_FLOW, exercisePlan[exercisePlan.length -1] || {}, {}));

  const { debugMode } = getGlobalState();
  if (debugMode) {
    console.groupCollapsed(`[Trainer-Queue] Full Workout Execution Queue Built`);
    console.table(fullQueue.map(item => ({...item, text: item.text, context: `Ex: ${item.context?.exercise?.name || 'N/A'} | Set: ${item.context?.set || '-'} | Rep: ${item.context?.rep || '-'}`})));
    console.groupEnd();
  }

  return fullQueue;
}
