import { ICONS } from './icons.js';
import { formatIngredients } from '../utils/formatters.js';

export function renderRecipes(recipes) {
    if (!recipes || recipes.length === 0) {
        return '<p>Nessuna ricetta trovata. Aggiungi ricette tramite la configurazione.</p>';
    }

    let html = `
        <div class="recipes-container">
            <div class="add-recipe-card" id="add-recipe-btn">
                <div class="add-recipe-icon">${ICONS.add}</div>
                <div class="add-recipe-text">Aggiungi Ricetta</div>
            </div>
    `;

    recipes.forEach(recipe => {
        html += `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-card-header">
                    <h3>${recipe.nomePasto}</h3>
                    <div class="recipe-card-actions">
                        <button class="icon-btn edit-recipe-btn" data-recipe-id="${recipe.id}">${ICONS.edit}</button>
                        <button class="icon-btn delete-recipe-btn" data-recipe-id="${recipe.id}">${ICONS.delete}</button>
                    </div>
                </div>
                <div class="recipe-card-body">
                    <p><strong>Tipo:</strong> ${recipe.tipoPasto}</p>
                    <p><strong>Calorie:</strong> ${recipe.calories_min}${recipe.calories_max ? ' - ' + recipe.calories_max : ''} kcal</p>
                    <div>
                        <strong>Ingredienti:</strong>
                        ${formatIngredients(recipe.ingredienti)}
                    </div>
                    <p><strong>Etichette:</strong> ${recipe.etichette ? recipe.etichette.join(', ') : 'N/A'}</p>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}
