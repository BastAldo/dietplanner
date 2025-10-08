import { getWorkoutState, updateState } from './state.js';
import { advanceToNextSet } from './machine.js';
import { setView } from '../state.js';
import { completeSet } from '../trainer.js';
import { playTick, playStartCue, playStopCue, speak } from '../../utils/audioFeedback.js';
import { UI_TEXT } from '../../config/uiText.js';

let animationFrameId = null;
let lastTickTimestamp = 0;

function tick(timestamp) {
  if (lastTickTimestamp === 0) {
    lastTickTimestamp = timestamp;
  }
  const deltaTime = timestamp - lastTickTimestamp;
  lastTickTimestamp = timestamp;

  const state = getWorkoutState();
  const { isAudioEnabled } = state;

  if (state.status === 'finished') {
    stopAnimation();
    return;
  }

  if (state.status === 'running') {
      if (state.executionMode === 'tempo_guided') {
          const newPhaseTimeElapsed = state.phaseTimeElapsed + deltaTime;
          const currentPhase = state.executionQueue[state.currentPhaseIndex];

          if (newPhaseTimeElapsed >= currentPhase.duration) {
            const newPhaseIndex = state.currentPhaseIndex + 1;
            const nextPhase = state.executionQueue[newPhaseIndex];

            if (isAudioEnabled) {
              playTick();
              if(nextPhase && nextPhase.name.startsWith('pre-')) {
                const phaseName = nextPhase.name.replace('pre-', '');
                let speechText = '';
                if (phaseName === 'up') speechText = UI_TEXT.VOICE_GUIDE_PHASE_UP;
                else if (phaseName === 'hold') speechText = UI_TEXT.VOICE_GUIDE_PHASE_HOLD;
                else if (phaseName === 'down') speechText = UI_TEXT.VOICE_GUIDE_PHASE_DOWN;
                if(speechText) speak(speechText);
              }
            }

            if (nextPhase) {
              updateState({
                currentPhaseIndex: newPhaseIndex,
                phaseTimeElapsed: 0,
                currentRep: nextPhase.rep,
              });
            } else {
              if (isAudioEnabled) playStopCue();
              completeSet();
            }
          } else {
            updateState({ phaseTimeElapsed: newPhaseTimeElapsed });
          }
      } else if (state.executionMode === 'static_hold') {
          const newSetTimeRemaining = state.setTimeRemaining - deltaTime;
          if (newSetTimeRemaining <= 0) {
              if (isAudioEnabled) playStopCue();
              completeSet();
          } else {
              updateState({ setTimeRemaining: newSetTimeRemaining });
          }
      }
  } else if (state.status === 'resting') {
    const newRestTimeRemaining = state.restTimeRemaining - deltaTime;
    if (newRestTimeRemaining <= 0) {
      const { exerciseQueue, currentExerciseIndex, currentSet } = state;
      const currentExercise = exerciseQueue[currentExerciseIndex];
      const isLastSet = currentSet >= currentExercise.defaultSets;

      if (isAudioEnabled) {
          playStartCue();
          if (isLastSet) {
              const nextExercise = exerciseQueue[currentExerciseIndex + 1];
              if (nextExercise) {
                  speak(`${UI_TEXT.VOICE_GUIDE_NEXT_EXERCISE}: ${nextExercise.name}`);
              }
          }
      }
      advanceToNextSet();
    } else {
      updateState({ restTimeRemaining: newRestTimeRemaining });
    }
  }

  document.dispatchEvent(new CustomEvent('workoutStateChange'));

  if (getWorkoutState().status !== 'paused' && getWorkoutState().status !== 'idle') {
    animationFrameId = requestAnimationFrame(tick);
  }
}

export function startAnimation() {
  if (animationFrameId) return;
  lastTickTimestamp = 0;
  animationFrameId = requestAnimationFrame(tick);
}

export function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
