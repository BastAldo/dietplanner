export function calculateAge(dateString) {
  if (!dateString) return null;
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function calculateBMR(userProfile, weight) {
  if (!userProfile || !weight || !userProfile.dateOfBirth || !userProfile.height || !userProfile.gender) {
    return null;
  }

  const age = calculateAge(userProfile.dateOfBirth);
  const height = parseFloat(userProfile.height);
  const weightFloat = parseFloat(weight);

  if (isNaN(age) || isNaN(height) || isNaN(weightFloat)) return null;

  let bmr;
  // Formula Mifflin-St Jeor: P = 10m + 6.25h - 5a + s
  // m = peso in kg, h = altezza in cm, a = età in anni, s è +5 per uomini e -161 per donne.
  if (userProfile.gender === 'male') {
    bmr = (10 * weightFloat) + (6.25 * height) - (5 * age) + 5;
  } else if (userProfile.gender === 'female') {
    bmr = (10 * weightFloat) + (6.25 * height) - (5 * age) - 161;
  } else {
    return null; // Gender not specified or invalid
  }

  return Math.round(bmr);
}

export function calculateWorkoutCalories(workoutSummary, userProfile, userWeight) {
  if (!workoutSummary || !userWeight || !workoutSummary.exercises || workoutSummary.exercises.length === 0) {
    return 0;
  }

  const weightKg = parseFloat(userWeight);
  if (isNaN(weightKg) || weightKg <= 0) return 0;
  
  // Calcola il BMR per usarlo come base se il MET non è disponibile
  const bmr = calculateBMR(userProfile, userWeight);
  const metBaseline = bmr ? (bmr / 24) / weightKg : 1; // MET a riposo (approssimato)

  let totalCalories = 0;

  workoutSummary.exercises.forEach(exercise => {
    // Usa il MET specifico dell'esercizio se disponibile, altrimenti un MET generico per "strength training"
    const met = exercise.met_value || (metBaseline * 3.5); // 3.5 è un MET generico per pesi
    
    // totalTime for each exercise is in milliseconds (solo per modalità guidate)
    let durationHours = exercise.totalTime / (1000 * 60 * 60);

    // Per la modalità 'logging', la durata non è tracciata, quindi stimiamo
    if (durationHours === 0 && exercise.setsData.length > 0) {
      // Stima: 2.5 secondi per rep + riposo
      const activeTimeSeconds = exercise.setsData.reduce((acc, set) => acc + (set.reps * 2.5), 0);
      const restTimeSeconds = (exercise.setsData.length - 1) * exercise.defaultRest;
      durationHours = (activeTimeSeconds + restTimeSeconds) / 3600;
    }

    if (typeof met === 'number' && met > 0 && durationHours > 0) {
      // Formula: Kcal = MET * Peso(kg) * Durata(ore)
      const caloriesBurned = met * weightKg * durationHours;
      totalCalories += caloriesBurned;
    }
  });

  return Math.round(totalCalories);
}