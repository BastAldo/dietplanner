function getIngredientById(id, ingredients) {
  return ingredients.find(ing => ing.id === id);
}

function calculateIngredientCaloriesRange(ingredientItem, ingredientData) {
  if (!ingredientData || typeof ingredientData.kcal_per_100g !== 'number') return { min: 0, max: 0 };

  const kcalPerGram = ingredientData.kcal_per_100g / 100;
  let min = 0, max = 0;

  if (ingredientItem.quantita_g) {
    min = max = kcalPerGram * ingredientItem.quantita_g;
  } else if (ingredientItem.quantita_g_min && ingredientItem.quantita_g_max) {
    min = kcalPerGram * ingredientItem.quantita_g_min;
    max = kcalPerGram * ingredientItem.quantita_g_max;
  } else if (ingredientItem.quantita_g_min) {
    min = max = kcalPerGram * ingredientItem.quantita_g_min;
  } else if (ingredientItem.quantita_pezzi && typeof ingredientData.g_per_pezzo === 'number') {
    const totalGrams = ingredientItem.quantita_pezzi * ingredientData.g_per_pezzo;
    min = max = kcalPerGram * totalGrams;
  }
  
  return { min, max };
}


export function processMealsWithCalories(meals, ingredients) {
  if (!meals || !ingredients) return [];

  return meals.map(meal => {
    let totalMinCalories = 0;
    let totalMaxCalories = 0;

    if (meal.ingredienti && Array.isArray(meal.ingredienti)) {
      meal.ingredienti.forEach(item => {
        const ingredientData = getIngredientById(item.id, ingredients);
        if (ingredientData) {
          const range = calculateIngredientCaloriesRange(item, ingredientData);
          totalMinCalories += range.min;
          totalMaxCalories += range.max;
        }
      });
    }

    return {
      ...meal,
      calories_min: Math.round(totalMinCalories),
      calories_max: Math.round(totalMaxCalories)
    };
  });
}
