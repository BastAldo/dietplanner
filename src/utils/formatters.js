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

export function formatIngredients(ingredientsString) {
    if (!ingredientsString || typeof ingredientsString !== 'string') {
        return '';
    }
    const ingredients = ingredientsString.split(',').map(item => item.trim());
    if (ingredients.length === 0) {
        return '';
    }
    return `
        <ul>
            ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
    `;
}
