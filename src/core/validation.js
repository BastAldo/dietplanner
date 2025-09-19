/**
 * Controlla se un pasto contenente soia può essere aggiunto in un dato giorno.
 * @param {string} day - Il giorno in cui si vuole aggiungere il pasto (es. 'Lunedì').
 * @param {Object} mealToAdd - L'oggetto pasto che si sta cercando di aggiungere.
 * @param {Object} weeklyPlan - Lo stato attuale del piano settimanale.
 * @param {Array<Object>} masterMealList - La lista completa dei pasti.
 * @returns {boolean} - True se il pasto può essere aggiunto, altrimenti false.
 */
export function isSoyMealAllowed(day, mealToAdd, weeklyPlan, masterMealList) {
  // Se il pasto da aggiungere non contiene soia, è sempre permesso.
  if (!mealToAdd.etichette.includes('contiene-soia')) {
    return true;
  }

  // Cerca un altro pasto con soia nello stesso giorno.
  const lunchSlotId = `${day}-Pranzo`;
  const dinnerSlotId = `${day}-Cena`;

  const lunchMealId = weeklyPlan[lunchSlotId];
  const dinnerMealId = weeklyPlan[dinnerSlotId];

  if (lunchMealId) {
      const lunchMeal = masterMealList.find(m => m.id === lunchMealId);
      if (lunchMeal && lunchMeal.etichette.includes('contiene-soia')) return false;
  }

  if (dinnerMealId) {
      const dinnerMeal = masterMealList.find(m => m.id === dinnerMealId);
      if (dinnerMeal && dinnerMeal.etichette.includes('contiene-soia')) return false;
  }

  return true;
}
