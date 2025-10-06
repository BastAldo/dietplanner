import { getWorkoutState, resetWorkoutState } from '../core/trainer.js';
import { TrainerComponent } from './components/TrainerComponent.js';
import { log } from '../utils/logger.js';

let trainerComponent = null;

function handleWorkoutStateChange() {
    if (trainerComponent) {
        trainerComponent.render(getWorkoutState());
    }
}

export function initializeTrainerController() {
    log('TrainerRenderer', 'Initializing TrainerComponent...');
    const container = document.getElementById('trainer-page');
    if (container && !trainerComponent) {
        trainerComponent = new TrainerComponent(container);
        trainerComponent.mount();
        document.addEventListener('workoutStateChange', handleWorkoutStateChange);
        handleWorkoutStateChange();
        log('TrainerRenderer', 'TrainerComponent initialized.');
    }
}

export function destroyTrainerController() {
    log('TrainerRenderer', 'Destroying TrainerComponent...');
    if (trainerComponent) {
        trainerComponent.destroy();
        trainerComponent = null;
    }
    document.removeEventListener('workoutStateChange', handleWorkoutStateChange);
    log('TrainerRenderer', 'TrainerComponent destroyed.');
}
