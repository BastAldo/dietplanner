function getIngredientById(id, ingredients) {
  return ingredients.find(ing => ing.id === id);
}

function calculateIngredientCalories(ingredientItem, ingredientData) {
  if (!ingredientData || typeof ingredientData.kcal_per_100g !== 'number') return 0;

  let quantityG = 0;
  if (ingredientItem.quantita_g) {
    quantityG = ingredientItem.quantita_g;
  } else if (ingredientItem.quantita_g_min) {
    quantityG = ingredientItem.quantita_g_min;
  } else if (ingredientItem.quantita_pezzi) {
    // Nota: questa è una semplificazione. Per una maggiore precisione,
    // il peso per pezzo dovrebbe essere definito negli ingredienti.
    // Per ora, assumiamo un peso medio se non specificato altrimenti.
    // Dato che non abbiamo un peso per pezzo, non possiamo calcolare le calorie.
    return 0;
  }

  return (ingredientData.kcal_per_100g / 100) * quantityG;
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
  } else if (ingredientItem.quantita_pezzi) {
     // Per ora, il calcolo per "pezzi" non è supportato se non c'è un peso associato.
     // In futuro, l'oggetto ingrediente potrebbe avere 'g_per_pezzo'.
     min = max = 0; // O un valore di default se preferito
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
