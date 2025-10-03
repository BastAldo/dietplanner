import { getWorkoutState, updateState, resetState } from './state.js';
import { buildExecutionQueueForCurrentSet } from './queueBuilder.js';

function logSetData(isNaturalCompletion = false) {
    const state = getWorkoutState();
    const currentExercise = state.exerciseQueue[state.currentExerciseIndex];
    
    const setData = {
        exerciseId: currentExercise.instanceId,
        set: state.currentSet
    };
    
    if (state.status === 'running') {
        setData.duration = Date.now() - state.phaseStartTime;
    }

    if (isNaturalCompletion) {
       const restDuration = Date.now() - state.restStartTime;
       const lastSetIndex = state.setsData.length -1;
       if(lastSetIndex >= 0) {
          state.setsData[lastSetIndex].restDuration = restDuration;
       }
    }

    if (state.executionMode === 'manual_reps') {
        setData.reps = state.manualRepCount;
    } else if (state.executionMode === 'tempo_guided') {
        setData.reps = currentExercise.defaultReps;
    } else if (state.executionMode === 'static_hold') {
        setData.duration = currentExercise.defaultDuration * 1000;
    }
    
    const newSetsData = state.status === 'running' ? [...state.setsData, setData] : [...state.setsData];
    updateState({ setsData: newSetsData });
}

function startNextExercise() {
    logSetData(true);
    const state = getWorkoutState();
    const nextExercise = state.exerciseQueue[state.currentExerciseIndex];
    const executionMode = nextExercise.execution_mode || 'tempo_guided';
    
    let nextState = {
        status: 'running',
        currentSet: 1,
        currentRep: 1,
        manualRepCount: 0,
        executionMode: executionMode,
        phaseStartTime: Date.now(),
    };

    if (executionMode === 'tempo_guided') {
        nextState.executionQueue = buildExecutionQueueForCurrentSet();
        nextState.currentPhaseIndex = 0;
        nextState.phaseTimeElapsed = 0;
    } else if (executionMode === 'static_hold') {
        nextState.setTimeRemaining = nextExercise.defaultDuration * 1000;
    }
    
    updateState(nextState);
}

export function advanceToNextSet() {
  logSetData();
  const state = getWorkoutState();
  const newSet = state.currentSet + 1;
  const currentExercise = state.exerciseQueue[state.currentExerciseIndex];

  if (newSet > currentExercise.defaultSets) {
    advanceToNextExercise();
  } else {
    let nextState = {
      status: 'running',
      currentSet: newSet,
      phaseTimeElapsed: 0,
      currentRep: 1,
      manualRepCount: 0,
      phaseStartTime: Date.now()
    };
    if (state.executionMode === 'tempo_guided') {
      nextState.executionQueue = buildExecutionQueueForCurrentSet();
      nextState.currentPhaseIndex = 0;
    } else if (state.executionMode === 'static_hold') {
      nextState.setTimeRemaining = currentExercise.defaultDuration * 1000;
    }
    updateState(nextState);
  }
}

export function advanceToNextExercise() {
  const state = getWorkoutState();
  const newIndex = state.currentExerciseIndex + 1;

  if (newIndex >= state.exerciseQueue.length) {
    document.dispatchEvent(new CustomEvent('workoutFinished'));
  } else {
    updateState({
      currentExerciseIndex: newIndex
    });
    startNextExercise();
  }
}
