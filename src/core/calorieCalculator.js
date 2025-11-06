function getIngredientById(id, ingredients) {
  return ingredients.find(ing => ing.id === id);
}

function calculateIngredientMacrosRange(ingredientItem, ingredientData) {
  if (!ingredientData) return { min: 0, max: 0, prot: 0, carb: 0, fat: 0 };

  const kcalPerGram = (ingredientData.kcal_per_100g || 0) / 100;
  const protPerGram = (ingredientData.prot_per_100g || 0) / 100;
  const carbPerGram = (ingredientData.carb_per_100g || 0) / 100;
  const fatPerGram = (ingredientData.fat_per_100g || 0) / 100;

  let minGrams = 0, maxGrams = 0;

  if (ingredientItem.quantita_g) {
    minGrams = maxGrams = ingredientItem.quantita_g;
  } else if (ingredientItem.quantita_g_min && ingredientItem.quantita_g_max) {
    minGrams = ingredientItem.quantita_g_min;
    maxGrams = ingredientItem.quantita_g_max;
  } else if (ingredientItem.quantita_g_min) {
    minGrams = maxGrams = ingredientItem.quantita_g_min;
  } else if (ingredientItem.quantita_pezzi && typeof ingredientData.g_per_pezzo === 'number') {
    minGrams = maxGrams = ingredientItem.quantita_pezzi * ingredientData.g_per_pezzo;
  } else {
    // Se non possiamo determinare i grammi, restituiamo 0 per tutto
    return { min: 0, max: 0, prot: 0, carb: 0, fat: 0 };
  }
  
  // Se maxGrams non è stato impostato (es. solo quantita_g_min), uguaglialo a minGrams
  if (maxGrams === 0) maxGrams = minGrams;

  return {
    min: kcalPerGram * minGrams,
    max: kcalPerGram * maxGrams,
    prot_min: protPerGram * minGrams,
    prot_max: protPerGram * maxGrams,
    carb_min: carbPerGram * minGrams,
    carb_max: carbPerGram * maxGrams,
    fat_min: fatPerGram * minGrams,
    fat_max: fatPerGram * maxGrams
  };
}


export function processMealsWithMacros(meals, ingredients) {
  if (!meals || !ingredients) return [];

  return meals.map(meal => {
    let totalMinCalories = 0;
    let totalMaxCalories = 0;
    let totalMinProt = 0;
    let totalMaxProt = 0;
    let totalMinCarb = 0;
    let totalMaxCarb = 0;
    let totalMinFat = 0;
    let totalMaxFat = 0;

    if (meal.ingredienti && Array.isArray(meal.ingredienti)) {
      meal.ingredienti.forEach(item => {
        const ingredientData = getIngredientById(item.id, ingredients);
        if (ingredientData) {
          const macros = calculateIngredientMacrosRange(item, ingredientData);
          totalMinCalories += macros.min;
          totalMaxCalories += macros.max;
          totalMinProt += macros.prot_min;
          totalMaxProt += macros.prot_max;
          totalMinCarb += macros.carb_min;
          totalMaxCarb += macros.carb_max;
          totalMinFat += macros.fat_min;
          totalMaxFat += macros.fat_max;
        }
      });
    }

    return {
      ...meal,
      calories_min: Math.round(totalMinCalories),
      calories_max: Math.round(totalMaxCalories),
      prot_min: Math.round(totalMinProt),
      prot_max: Math.round(totalMaxProt),
      carb_min: Math.round(totalMinCarb),
      carb_max: Math.round(totalMaxCarb),
      fat_min: Math.round(totalMinFat),
      fat_max: Math.round(totalMaxFat)
    };
  });
}
