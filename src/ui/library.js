export function renderMealLibrary(element, state) {
  if (state.masterMealList.length === 0) {
    return;
  }
  element.innerHTML = state.masterMealList.map(meal => `
    <div class="meal-card" draggable="true" data-meal-id="${meal.id}">
      <h4>${meal.nomePasto}</h4>
      <p>(${meal.tipoPasto})</p>
    </div>
  `).join('');
}
