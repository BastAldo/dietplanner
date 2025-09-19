export function isSoyMealAllowed(day, mealToAdd, weeklyPlan, masterMealList) {
  if (!mealToAdd.etichette || !mealToAdd.etichette.includes('contiene-soia')) {
    return true;
  }
  const lunchSlotId = `${day}-Pranzo`;
  const dinnerSlotId = `${day}-Cena`;
  const lunchMealId = weeklyPlan[lunchSlotId];
  const dinnerMealId = weeklyPlan[dinnerSlotId];
  if (lunchMealId) {
      const meal = masterMealList.find(m => m.id === lunchMealId);
      if (meal && meal.etichette && meal.etichette.includes('contiene-soia')) return false;
  }
  if (dinnerMealId) {
      const meal = masterMealList.find(m => m.id === dinnerMealId);
      if (meal && meal.etichette && meal.etichette.includes('contiene-soia')) return false;
  }
  return true;
}
