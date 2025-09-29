import { UI_TEXT } from '../utils/constants.js';

function formatIngredients(meal) {
    if (!meal.ingredienti || !Array.isArray(meal.ingredienti)) return '';
    
    const ingredientsList = meal.ingredienti.map(item => {
        let quantity = '';
        if (item.quantita_g) quantity = `${item.quantita_g}g`;
        else if (item.quantita_g_min && item.quantita_g_max) quantity = `${item.quantita_g_min}-${item.quantita_g_max}g`;
        else if (item.quantita_g_min) quantity = `${item.quantita_g_min}g`;
        else if (item.quantita_pezzi) quantity = `x${item.quantita_pezzi}`;
        
        return `${item.id.replace(/_/g, ' ')} ${quantity}`.trim();
    }).join(', ');
    
    return `<p>${ingredientsList}</p>`;
}

export function renderRecipesPage(state) {
    const listContainer = document.getElementById('recipes-list');
    const mealsWithRecipes = state.masterMealList.filter(meal => meal.recipeId);

    if (mealsWithRecipes.length > 0) {
        listContainer.innerHTML = mealsWithRecipes.map(meal => `
            <div class="recipe-list-item" data-meal-id="${meal.id}">
                <h4>${meal.nomePasto}</h4>
                ${formatIngredients(meal)}
            </div>
        `).join('');
    } else {
        listContainer.innerHTML = `<p class="placeholder-text">${UI_TEXT.RECIPES_EMPTY}</p>`;
    }
}
