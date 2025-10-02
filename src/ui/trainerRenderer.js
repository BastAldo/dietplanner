import { getWorkoutState, resetWorkoutState } from '../core/trainer.js';
import { TrainerComponent } from './components/TrainerComponent.js';

let trainerComponent = null;

function handleWorkoutStateChange() {
    if (trainerComponent) {
        trainerComponent.render(getWorkoutState());
    }
}

export function initializeTrainerController() {
    const container = document.getElementById('trainer-page');
    if (container && !trainerComponent) {
        trainerComponent = new TrainerComponent(container);
        trainerComponent.mount();
        document.addEventListener('workoutStateChange', handleWorkoutStateChange);
        // Render iniziale
        handleWorkoutStateChange();
    }
}

export function destroyTrainerController() {
    if (trainerComponent) {
        trainerComponent.destroy();
        trainerComponent = null;
    }
    document.removeEventListener('workoutStateChange', handleWorkoutStateChange);
    resetWorkoutState();
}
