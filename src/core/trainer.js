import { setView, setLastWorkoutSummary, addWorkoutToHistory, getState as getGlobalState } from './state.js';
import { log } from '../utils/logger.js';
import { getWorkoutState, resetState, updateState } from './trainer/state.js';
import { runTimerAnimation, stopAllAnimations } from './trainer/animation.js';
import { buildFullWorkoutQueue } from './trainer/queueBuilder.js';
import { calculateWorkoutCalories } from './calculations.js';
import { speak, playStartCue, playTick } from '../utils/audioFeedback.js';
import { UI_TEXT } from '../config/uiText.js';

// This is the "Director d'Orchestra"
async function runWorkoutLoop() {
  const initialState = getWorkoutState();
  if (initialState.status !== 'running') return;

  let i = initialState.currentQueueIndex;

  while (i < initialState.fullExecutionQueue.length) {
      let currentState = getWorkoutState();
      if (currentState.status !== 'running') {
          log('Trainer', 'Workout loop terminated (paused or finished).');
          return;
      }
      
      // Assicura che l'indice dello stato sia aggiornato
      if (i !== currentState.currentQueueIndex) {
        i = currentState.currentQueueIndex;
      }

      updateState({ currentQueueIndex: i });
      const phase = currentState.fullExecutionQueue[i];

      log('Trainer-Loop', `Executing phase ${i}:`, phase.type);

      switch (phase.type) {
          case 'speech':
              if (getWorkoutState().isAudioEnabled && phase.text) {
                  if(phase.await) await speak(phase.text);
                  else speak(phase.text);
              }
              break;
          case 'audio':
              if (getWorkoutState().isAudioEnabled) {
                  if (phase.cue === 'tick') playTick();
              }
              break;
          case 'movement':
          case 'rest':
          case 'static_hold':
              await runTimerAnimation(phase.duration_ms);
              break;
          case 'set_completed':
              // Per le modalità guidate, raccoglie i dati pianificati
              collectSetData();
              break;
          case 'logging':
              // Pausa il loop e attende la conferma manuale dalla UI
              await new Promise(resolve => {
                  updateState({ resolveCurrentSetPromise: resolve });
              });
              // Quando la promise si risolve (tramite confirmCurrentSet),
              // i dati sono GIÀ stati raccolti da confirmCurrentSet.
              break;
      }
      
      // Avanza all'indice successivo solo se lo stato è ancora 'running'
      // Questo previene un doppio incremento se `skipPhase` è stato chiamato
      if (getWorkoutState().status === 'running' && getWorkoutState().currentQueueIndex === i) {
        i++;
      }
  }
  
  // Se il loop completa naturalmente, termina l'allenamento
  if (getWorkoutState().status === 'running') {
      endWorkout();
  }
}

export function resetWorkoutState() {
  log('Trainer', 'Resetting workout state.');
  stopAllAnimations();
  resetState();
}

export function initializeWorkout(plannedExercises, isoDate) {
  if (!plannedExercises || plannedExercises.length === 0) {
      return;
  }
  resetWorkoutState();

  const fullExecutionQueue = buildFullWorkoutQueue(plannedExercises);

  const initialState = {
      workoutDate: isoDate,
      exerciseQueue: JSON.parse(JSON.stringify(plannedExercises)),
      fullExecutionQueue: fullExecutionQueue,
      currentQueueIndex: 0,
      status: 'idle',
      startTime: 0,
      setsData: []
  };
  updateState(initialState);
  document.dispatchEvent(new CustomEvent('workoutStateChange'));
}

export function collectSetData(setDataFromUI = null) {
    const state = getWorkoutState();
    const currentPhase = state.fullExecutionQueue[state.currentQueueIndex];
    if (!currentPhase || !currentPhase.context) return;

    const { exercise, set } = currentPhase.context;

    let setData;
    if (setDataFromUI) {
      // Modalità Logging: Dati arrivano dalla UI
      setData = {
        exerciseId: exercise.instanceId,
        set: set,
        reps: setDataFromUI.reps,
        duration: 0, // La modalità logging non è basata sul tempo
        rest: exercise.defaultRest,
        weight: setDataFromUI.weight,
        to_failure: setDataFromUI.to_failure || false
      };
    } else {
      // Modalità Guidata: Dati arrivano dal context (piano)
      setData = {
        exerciseId: exercise.instanceId,
        set: set,
        reps: currentPhase.context.reps, // Reps pianificate
        duration: state.lastTimerDuration || 0, // Durata dall'animation engine
        rest: exercise.defaultRest,
        weight: currentPhase.context.weight || 0
      };
    }

    const newSetsData = [...state.setsData, setData];
    updateState({ setsData: newSetsData, lastTimerDuration: 0 }); // Resetta lastTimerDuration
    log('Trainer', 'Set data collected', { setData });
}

export async function startWorkout() {
  const state = getWorkoutState();
  log('Interactions', 'Start workout button clicked', { date: state.workoutDate });
  if (state.status !== 'idle') return;

  if (getWorkoutState().isAudioEnabled) {
      playStartCue();
  }

  // Small delay to allow the sound cue to play before any potential UI lag
  await new Promise(resolve => setTimeout(resolve, 50));
  
  if (getWorkoutState().status !== 'idle') {
      log('Trainer', 'Workout start aborted, status changed during start cue.');
      return;
  }

  updateState({ status: 'running', startTime: Date.now() });
  runWorkoutLoop(); // Start the master loop
  log('Trainer', 'Workout started.');
}

export function pauseWorkout() {
  const state = getWorkoutState();
  if (state.status === 'running') {
      updateState({ status: 'paused' });
      log('Trainer', 'Workout paused.');
  }
}

export function resumeWorkout() {
  const state = getWorkoutState();
  if (state.status === 'paused') {
      updateState({ status: 'running' });
      log('Trainer', 'Workout resumed.');
      // Il loop `runWorkoutLoop` riprenderà automaticamente
      // perché `state.status` è di nuovo 'running'.
      // Ma se era in attesa di una promise (animazione),
      // l'animazione riprenderà da sola.
      // Se era in attesa della promise `logging`,
      // non fa nulla finché l'utente non conferma.
      // Se era tra le fasi, il loop `while` riprende.
      // Per sicurezza, se non è in attesa di nulla, facciamo ripartire il loop.
      if (!state.resolveCurrentSetPromise) {
        runWorkoutLoop();
      }
  }
}

export function confirmCurrentSet(setDataFromUI) {
    const state = getWorkoutState();
    if (state.status !== 'running') return;

    // Raccogli i dati del set appena completato
    collectSetData(setDataFromUI);

    // Sblocca il `runWorkoutLoop` che è in `await`
    if (state.resolveCurrentSetPromise) {
        state.resolveCurrentSetPromise();
        updateState({ resolveCurrentSetPromise: null });
    }
}

export function skipPhase(direction = 1) {
    stopAllAnimations(); // Interrompe qualsiasi timer (es. riposo)
    const state = getWorkoutState();
    if (state.status !== 'running') return;

    log('Trainer', 'Skipping phase', { direction });

    // Se siamo in attesa di conferma set, sblocca la promise
    if (state.resolveCurrentSetPromise) {
        log('Trainer', 'Skipping an awaiting set confirmation');
        state.resolveCurrentSetPromise();
        updateState({ resolveCurrentSetPromise: null });
    }

    let newIndex = state.currentQueueIndex + direction;

    // Logica per saltare al prossimo *set* o *esercizio*
    // In modalità guidata, potremmo voler saltare alla prossima fase "importante"
    // Per ora, saltiamo solo alla fase successiva/precedente
    
    if (newIndex >= state.fullExecutionQueue.length) {
        endWorkout(); // Se skippiamo l'ultima fase, finisce l'allenamento
    } else if (newIndex < 0) {
        newIndex = 0; // Non andare prima dell'inizio
        updateState({ currentQueueIndex: newIndex });
    } else {
        updateState({ currentQueueIndex: newIndex });
    }
}


function createWorkoutSummary(finalState) {
    const totalTime = Date.now() - finalState.startTime;
    let totalTonnage = 0;

    const exercisesWithDetails = finalState.exerciseQueue.map(exercise => {
        const setsForThisExercise = finalState.setsData.filter(d => d.exerciseId === exercise.instanceId);
        const setsCompleted = setsForThisExercise.length;
        const totalExerciseTime = setsForThisExercise.reduce((acc, set) => acc + (set.duration || 0), 0);
        const exerciseTonnage = setsForThisExercise.reduce((acc, set) => acc + ((set.reps || 0) * (set.weight || 0)), 0);
        totalTonnage += exerciseTonnage;

        return {
            ...exercise,
            setsCompleted: setsCompleted,
            setsData: setsForThisExercise,
            totalTime: totalExerciseTime,
            tonnage: exerciseTonnage
        };
    });

    const totalSets = exercisesWithDetails.reduce((acc, ex) => acc + ex.setsCompleted, 0);
    const totalExerciseTime = exercisesWithDetails.reduce((acc, ex) => acc + ex.totalTime, 0);
    const totalRestTime = finalState.setsData.reduce((acc, set) => acc + (set.rest || 0) * 1000, 0);

    const summary = {
        date: finalState.workoutDate,
        totalTime,
        totalSets,
        totalExerciseTime,
        totalRestTime,
        totalTonnage,
        exercises: exercisesWithDetails,
        startTime: finalState.startTime,
        totalCaloriesBurned: 0
    };

    const globalState = getGlobalState();
    const latestWeight = globalState.biometricData.length > 0 ? globalState.biometricData[0].weight : null;
    if (latestWeight) {
      summary.totalCaloriesBurned = calculateWorkoutCalories(summary, latestWeight);
    }

    return summary;
}

export function endWorkout() {
  const finalState = getWorkoutState();
  if (finalState.status === 'finished') {
      log('Trainer', 'Workout already finished, not saving again.');
      return;
  }
  stopAllAnimations();
  updateState({ status: 'finished' });

  if (finalState.startTime === 0) {
      log('Trainer', 'Workout ended prematurely, not saving summary.');
      setView('planner');
      return;
  }
  const summary = createWorkoutSummary(finalState);
  setLastWorkoutSummary(summary);
  addWorkoutToHistory(summary);

  setView('debriefing');
}

export function discardWorkout() {
  log('Trainer', 'Discarding workout.');
  stopAllAnimations();
  resetWorkoutState();
  setView('planner');
}