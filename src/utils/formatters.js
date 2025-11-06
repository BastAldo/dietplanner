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

function formatMacroRange(min, max, label) {
  if (min === undefined || min === null) min = 0;
  if (max === undefined || max === null) max = min;
  
  // Arrotonda ai decimali solo se necessario
  min = Math.round(min * 10) / 10;
  max = Math.round(max * 10) / 10;

  if (min === 0 && max === 0) return '';
  const value = (min === max) ? `${min}g` : `${min}-${max}g`;
  let className = '';
  if (label === 'P') className = 'macro-prot';
  if (label === 'C') className = 'macro-carb';
  if (label === 'F') className = 'macro-fat';
  return `<span class="${className}">${label}: ${value}</span>`;
}

function formatMacros(meal) {
  const p = formatMacroRange(meal.prot_min, meal.prot_max, 'P');
  const c = formatMacroRange(meal.carb_min, meal.carb_max, 'C');
  const f = formatMacroRange(meal.fat_min, meal.fat_max, 'F');
  return [p, c, f].filter(Boolean).join(' | ');
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
  const summary = formatIngredientsSummary(meal);
  const calories = formatMealCalories(meal);
  const macros = formatMacros(meal);

  let html = '';
  if (summary) {
    html += `<div class="meal-item-details">${summary}</div>`;
  }
  
  const stats = [calories, macros].filter(Boolean).join(' | ');
  if (stats) {
     html += `<div class="meal-item-stats">${stats}</div>`;
  }
  return html;
}

export function formatIngredientsSummary(meal) {
  const state = getState();
  const mealDetails = state.masterMealList.find(m => m.id === meal.id);

  if (!mealDetails || !Array.isArray(mealDetails.ingredienti)) {
    // Fallback for older data structures or simple string ingredients
    if (typeof meal.ingredienti === 'string') return meal.ingredienti;
    return '';
  }

  const ingredientsSummary = mealDetails.ingredienti.map(item => {
    const ingredientData = state.masterIngredientList.find(ing => ing.id === item.id);
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
