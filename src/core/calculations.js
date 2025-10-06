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

export function calculateWorkoutCalories(workoutSummary, userWeight) {
  if (!workoutSummary || !userWeight || !workoutSummary.exercises || workoutSummary.exercises.length === 0) {
    return 0;
  }

  const weightKg = parseFloat(userWeight);
  if (isNaN(weightKg) || weightKg <= 0) return 0;

  let totalCalories = 0;

  workoutSummary.exercises.forEach(exercise => {
    const met = exercise.met_value;
    // totalTime for each exercise is in milliseconds
    const durationHours = exercise.totalTime / (1000 * 60 * 60);

    if (typeof met === 'number' && met > 0 && durationHours > 0) {
      // Formula: Kcal = MET * Peso(kg) * Durata(ore)
      const caloriesBurned = met * weightKg * durationHours;
      totalCalories += caloriesBurned;
    }
  });

  return Math.round(totalCalories);
}
