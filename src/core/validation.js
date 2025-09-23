export function isPlacementValid(mealToAdd, slotId, weeklyPlan, masterMealList, rules) {
  for (const rule of rules) {
    if (mealToAdd.etichette && mealToAdd.etichette.includes(rule.tag)) {
      const result = applyRule(rule, mealToAdd, slotId, weeklyPlan, masterMealList);
      if (!result.isValid) return result;
    }
  }
  return { isValid: true, message: null };
}

function applyRule(rule, mealToAdd, slotId, weeklyPlan, masterMealList) {
  if (rule.type === 'daily-block') {
    const dayISO = slotId.substring(0, 10); // Extracts "YYYY-MM-DD" from "YYYY-MM-DD-MealType"
    let count = 0;
    for (const key in weeklyPlan) {
      if (key.startsWith(dayISO) && key !== slotId) {
        const meal = masterMealList.find(m => m.id === weeklyPlan[key]);
        if (meal && meal.etichette && meal.etichette.includes(rule.tag)) count++;
      }
    }
    if (count >= rule.limit) return { isValid: false, message: rule.message };
  }
  return { isValid: true, message: null };
}
