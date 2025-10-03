import { UI_TEXT } from '../utils/constants.js';
import { formatIngredients } from '../utils/formatters.js';

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
