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
    const ingredientsString = meal.ingredienti;
    if (!ingredientsString || typeof ingredientsString !== 'string') {
        return '';
    }
    const ingredients = ingredientsString.split(',').map(item => item.trim());
    if (ingredients.length === 0) {
        return '';
    }
    const details = `<div class="meal-item-details">${formatIngredientsSummary(meal)} | ${formatMealCalories(meal)}</div>`;
    return details;
}

export function formatIngredientsSummary(meal) {
  const ingredientsString = meal.ingredienti;
  if (!ingredientsString || typeof ingredientsString !== 'string') {
    return '';
  }
  return ingredientsString;
}
