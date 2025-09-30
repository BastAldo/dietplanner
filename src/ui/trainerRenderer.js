import { getWorkoutState } from '../core/trainer.js';

function formatExerciseDetails(exercise, set) {
  if (!exercise) return '';
  const sets = exercise.defaultSets;
  let details = `Serie ${set} di ${sets}`;

  if (exercise.type === 'reps') {
    const reps = exercise.defaultReps;
    details += ` | ${reps} Ripetizioni`;
  } else if (exercise.type === 'time') {
    const duration = exercise.defaultDuration;
    details += ` | ${duration}s`;
  }
  return details;
}

export function renderTrainerView() {
  const state = getWorkoutState();
  const { exerciseQueue, currentExerciseIndex, status, currentSet } = state;

  if (status === 'idle' && currentExerciseIndex < 0) {
    // Stato iniziale prima che l'allenamento venga caricato, non fare nulla.
    return;
  }

  const currentExercise = exerciseQueue[currentExerciseIndex];

  // Popola i dati statici dell'allenamento
  document.getElementById('current-exercise-name').textContent = currentExercise.name;
  document.getElementById('current-exercise-details').textContent = formatExerciseDetails(currentExercise, currentSet);

  const upcomingList = document.getElementById('upcoming-exercises-list');
  upcomingList.innerHTML = ''; // Pulisci la lista
  exerciseQueue.slice(currentExerciseIndex + 1).forEach(ex => {
    const li = document.createElement('li');
    li.textContent = ex.name;
    upcomingList.appendChild(li);
  });

  // Qui, in futuro, andrà la logica per mostrare la modalità corretta
  // e aggiornare dinamicamente i timer, i contatori, etc.
  // Per ora, mostriamo solo lo stato iniziale.
}
