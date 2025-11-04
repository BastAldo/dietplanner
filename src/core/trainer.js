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
  while (getWorkoutState().status === 'running') {
      let currentState = getWorkoutState();
      let currentIndex = currentState.currentQueueIndex;

      if (currentIndex >= currentState.fullExecutionQueue.length) {
          log('Trainer-Loop', 'Coda di esecuzione terminata.');
          break; // Esce dal loop se abbiamo finito
      }

      const phase = currentState.fullExecutionQueue[currentIndex];
      log('Trainer-Loop', `Executing phase ${currentIndex}:`, phase.type);

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
      
      // Controlla lo stato DOPO qualsiasi operazione 'await'
      const stateAfterAwait = getWorkoutState();
      if (stateAfterAwait.status !== 'running') {
          log('Trainer', 'Workout loop terminated (paused or finished).');
          return; // Esce dalla funzione
      }

      // Incrementa l'indice solo se non è stato modificato da un'altra funzione (es. skipPhase)
      if (stateAfterAwait.currentQueueIndex === currentIndex) {
          updateState({ currentQueueIndex: currentIndex + 1 });
      }
      // Se l'indice è stato modificato (es. skip), il loop while ricomincerà
      // e leggerà il nuovo 'currentQueueIndex' all'inizio.
  }
  
  // Se il loop completa naturalmente (uscendo dal while), termina l'allenamento
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
    // Usa l'indice corrente, o l'indice precedente se 'set_completed' segue una fase
    let phaseIndex = state.currentQueueIndex;
    let currentPhase = state.fullExecutionQueue[phaseIndex];

    // Se la fase corrente è 'set_completed', i dati sono nella fase precedente
    if (currentPhase && currentPhase.type === 'set_completed') {
      phaseIndex = Math.max(0, phaseIndex - 1);
      currentPhase = state.fullExecutionQueue[phaseIndex];
    }
    
    if (!currentPhase || !currentPhase.context) {
      log('Trainer', 'collectSetData failed: phase or context not found.', { currentPhase });
      return;
    }

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
      // Rilancia il loop principale. Questo è sicuro perché il loop
      // stesso leggerà lo stato 'currentQueueIndex' e riprenderà da lì.
      // Se era in attesa di una promise, l'animazione riprenderà da sola.
      runWorkoutLoop();
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