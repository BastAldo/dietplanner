import { getState } from '../core/state.js';

function formatMealCalories(meal) {
  if (!meal || typeof meal.calories_min !== 'number') return '';
  const minCals = Number(meal.calories_min) || 0;
  const maxCals = Number(meal.calories_max) || minCals;
  if (minCals === 0 && maxCals === 0) return '';
  const kcalLabel = 'Kcal';
  if (minCals === maxCals) return `${minCals} ${kcalLabel}`;
  return `${minCals} - ${maxCals} ${kcalLabel}`;
}

export function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

export function formatShortDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month].join('/');
}

export function formatDateWithYear(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month, year].join('/');
}

export function formatIngredients(meal) {
    const state = getState();
    const ingredientsList = state.masterMealList.find(m => m.id === meal.id)?.ingredienti;
    if (!ingredientsList || !Array.isArray(ingredientsList)) {
        return '';
    }
    const summary = formatIngredientsSummary(meal);
    const calories = formatMealCalories(meal);
    const details = `<div class="meal-item-details">${summary} | ${calories}</div>`;
    return details;
}

export function formatIngredientsSummary(meal) {
  const state = getState();
  const mealDetails = state.masterMealList.find(m => m.id === meal.id);

  if (!mealDetails || !Array.isArray(mealDetails.ingredienti)) {
    return meal.ingredienti || '';
  }

  const ingredientsSummary = mealDetails.ingredienti.map(item => {
    const ingredientData = state.masterMealList.find(ing => ing.id === item.id);
    const name = ingredientData ? ingredientData.nome : item.id;
    let quantity = '';
    if (item.quantita_g) quantity = `${item.quantita_g}g`;
    else if (item.quantita_g_min && item.quantita_g_max) quantity = `${item.quantita_g_min}-${item.quantita_g_max}g`;
    else if (item.quantita_g_min) quantity = `${item.quantita_g_min}g`;
    else if (item.quantita_pezzi) quantity = `${item.quantita_pezzi} pz`;
    return `${name}: ${quantity}`;
  }).join(', ');

  return ingredientsSummary;
}
