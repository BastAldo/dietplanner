/**
 * Formatta l'elenco degli ingredienti di un pasto in una stringa leggibile.
 * @param {object} meal - L'oggetto pasto contenente un array di ingredienti.
 * @returns {string} - Una stringa HTML con l'elenco formattato.
 */
export function formatIngredients(meal) {
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
