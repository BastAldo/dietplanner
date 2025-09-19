/**
 * Renderizza la libreria dei pasti disponibili.
 * @param {HTMLElement} element - L'elemento contenitore della libreria.
 * @param {Object} state - Lo stato corrente dell'applicazione.
 */
export function renderMealLibrary(element, state) {
  element.innerHTML = ''; // Pulisce la libreria
  state.masterMealList.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.setAttribute('draggable', 'true');
    card.dataset.mealId = meal.id;
    
    card.innerHTML = `
      <h4>${meal.nomePasto}</h4>
      <p>(${meal.tipoPasto})</p>
    `;
    
    element.appendChild(card);
  });
}
