/**
 * Motore di validazione generico.
 * @returns {{isValid: boolean, message: string|null}}
 */
export function isPlacementValid(mealToAdd, slotId, weeklyPlan, masterMealList, rules) {
  for (const rule of rules) {
    if (mealToAdd.etichette && mealToAdd.etichette.includes(rule.tag)) {
      const result = applyRule(rule, mealToAdd, slotId, weeklyPlan, masterMealList);
      if (!result.isValid) {
        return result;
      }
    }
  }
  return { isValid: true, message: null };
}

function applyRule(rule, mealToAdd, slotId, weeklyPlan, masterMealList) {
  switch (rule.type) {
    case 'daily-block':
      return validateDailyBlock(rule, mealToAdd, slotId, weeklyPlan, masterMealList);
    // Altri tipi di regole possono essere aggiunti qui
    default:
      return { isValid: true, message: null };
  }
}

function validateDailyBlock(rule, mealToAdd, slotId, weeklyPlan, masterMealList) {
  const day = slotId.split('-')[0];
  let count = 0;
  for (const key in weeklyPlan) {
    if (key.startsWith(day) && key !== slotId) {
      const mealId = weeklyPlan[key];
      const meal = masterMealList.find(m => m.id === mealId);
      if (meal && meal.etichette && meal.etichette.includes(rule.tag)) {
        count++;
      }
    }
  }
  if (count >= rule.limit) {
    return { isValid: false, message: rule.message };
  }
  return { isValid: true, message: null };
}
