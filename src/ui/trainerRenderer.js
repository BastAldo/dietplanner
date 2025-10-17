import { getWorkoutState, resetState } from '../core/trainer/state.js';
import { TrainerComponent } from './components/TrainerComponent.js';
import { log } from '../utils/logger.js';
import { resetWorkoutState as resetWorkoutController } from '../core/trainer.js';

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
        setTimeout(() => window.scrollTo(0, 0), 0); // Defer scroll to after render cycle
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
    resetWorkoutController(); // Use the controller's reset function which also handles state
    log('TrainerRenderer', 'TrainerComponent destroyed.');
}
