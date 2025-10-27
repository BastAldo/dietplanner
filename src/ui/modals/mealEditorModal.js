import { getState, addMeal, updateMeal } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { showNotification } from '../notifications.js';
import { log } from '../../utils/logger.js';
import { MEAL_TYPES } from '../../utils/constants.js';
import { renderIcon } from '../icons.js';
import { processMealsWithCalories } from '../../core/calorieCalculator.js';

let tempIngredients = [];
let isEditingMode = false;

function renderIngredientRows() {
  const listContainer = document.getElementById('meal-editor-ingredients-list');
  const { masterIngredientList } = getState();
  const optionsHtml = masterIngredientList.map(ing => `<option value="${ing.id}">${ing.nome}</option>`).join('');

  if (tempIngredients.length === 0) {
    listContainer.innerHTML = `<p class="placeholder-text">Aggiungi il primo ingrediente al tuo pasto.</p>`;
  } else {
    listContainer.innerHTML = tempIngredients.map((item, index) => `
      <div class="meal-editor-ingredient-row" data-index="${index}">
        <select name="ingredient_${index}" required>${optionsHtml}</select>
        <input type="number" name="quantita_g_${index}" placeholder="Grammi" min="0" value="${item.quantita_g || ''}">
        <input type="number" name="quantita_pezzi_${index}" placeholder="Pezzi" min="0" value="${item.quantita_pezzi || ''}">
        <button type="button" class="btn-remove-ingredient">${renderIcon('TRASH', { width: 18, height: 18 })}</button>
      </div>
    `).join('');

    // Set selected options
    tempIngredients.forEach((item, index) => {
      const select = listContainer.querySelector(`select[name="ingredient_${index}"]`);
      if (select) {
        select.value = item.id;
      }
    });
  }
  updateTotals();
}

function updateTotals() {
  const totalsEl = document.getElementById('meal-editor-totals');
  const mealForCalc = {
    id: 'temp',
    ingredienti: tempIngredients,
  };

  const [processedMeal] = processMealsWithCalories([mealForCalc], getState().masterIngredientList);

  if (processedMeal.calories_min > 0) {
    if (processedMeal.calories_min === processedMeal.calories_max) {
      totalsEl.textContent = `Totale: ${processedMeal.calories_min} Kcal`;
    } else {
      totalsEl.textContent = `Totale: ${processedMeal.calories_min} - ${processedMeal.calories_max} Kcal`;
    }
  } else {
    totalsEl.textContent = '';
  }
}

function handleIngredientChange(e) {
  const target = e.target;
  const row = target.closest('.meal-editor-ingredient-row');
  if (!row) return;
  const index = parseInt(row.dataset.index, 10);

  if (target.name.startsWith('ingredient')) {
    tempIngredients[index].id = target.value;
  } else if (target.name.startsWith('quantita_g')) {
    tempIngredients[index].quantita_g = parseFloat(target.value) || null;
  } else if (target.name.startsWith('quantita_pezzi')) {
    tempIngredients[index].quantita_pezzi = parseFloat(target.value) || null;
  }
  updateTotals();
}

export function openMealEditorModal(meal = null) {
  isEditingMode = meal !== null;
  log('Modals', isEditingMode ? 'Opening meal editor (edit)' : 'Opening meal editor (new)', { meal });

  tempIngredients = isEditingMode ? JSON.parse(JSON.stringify(meal.ingredienti || [])) : [];

  const modal = document.getElementById('meal-editor-modal');
  const form = modal.querySelector('#meal-editor-form');
  const title = modal.querySelector('#meal-editor-title');
  const saveBtn = modal.querySelector('#meal-editor-save-btn');

  title.textContent = isEditingMode ? UI_TEXT.MEAL_EDIT_TITLE : UI_TEXT.MEAL_NEW_TITLE;
  saveBtn.textContent = UI_TEXT.MEAL_SAVE_BTN;

  // Populate main form fields
  form.elements.id.value = meal?.id || '';
  form.elements.nomePasto.value = meal?.nomePasto || '';
  form.elements.id.readOnly = isEditingMode;

  // Populate meal type checkboxes
  const tipoPastoContainer = document.getElementById('meal-edit-tipoPasto-container');
  tipoPastoContainer.innerHTML = MEAL_TYPES.map(type => `
    <label>
      <input type="checkbox" name="tipoPasto" value="${type}" ${meal?.tipoPasto?.includes(type) ? 'checked' : ''}>
      ${type}
    </label>
  `).join('');

  renderIngredientRows();

  // Attach listeners
  const ingredientsList = document.getElementById('meal-editor-ingredients-list');
  const addIngredientBtn = document.getElementById('meal-add-ingredient-btn');

  const ingredientChangeHandler = (e) => handleIngredientChange(e);
  const addIngredientHandler = () => {
    tempIngredients.push({ id: getState().masterIngredientList[0]?.id || '', quantita_g: null, quantita_pezzi: null });
    renderIngredientRows();
  };
  const removeIngredientHandler = (e) => {
    if (e.target.closest('.btn-remove-ingredient')) {
      const row = e.target.closest('.meal-editor-ingredient-row');
      if (row) {
        tempIngredients.splice(parseInt(row.dataset.index, 10), 1);
        renderIngredientRows();
      }
    }
  };
  const formSubmitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const mealData = {
      id: formData.get('id'),
      nomePasto: formData.get('nomePasto'),
      tipoPasto: formData.getAll('tipoPasto'),
      ingredienti: tempIngredients.filter(ing => ing.id), // Filter out empty ones
    };

    if (!mealData.id || !mealData.nomePasto) {
      showNotification('ID e Nome Pasto sono obbligatori.', 'error');
      return;
    }

    if (isEditingMode) {
      updateMeal(meal.id, mealData);
      showNotification(UI_TEXT.MEAL_UPDATE_SUCCESS, 'success');
    } else {
      if (getState().masterMealList.some(m => m.id === mealData.id)) {
        showNotification(UI_TEXT.MEAL_ID_CONFLICT, 'error');
        return;
      }
      addMeal(mealData);
      showNotification(UI_TEXT.MEAL_CREATE_SUCCESS, 'success');
    }

    modal.classList.add('modal-hidden');
  };

  // Use cloning to remove old listeners
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  newForm.addEventListener('submit', formSubmitHandler);

  const newAddBtn = addIngredientBtn.cloneNode(true);
  addIngredientBtn.parentNode.replaceChild(newAddBtn, addIngredientBtn);
  newAddBtn.addEventListener('click', addIngredientHandler);

  const newList = ingredientsList.cloneNode(true);
  ingredientsList.parentNode.replaceChild(newList, ingredientsList);
  newList.addEventListener('change', ingredientChangeHandler);
  newList.addEventListener('click', removeIngredientHandler);

  modal.classList.remove('modal-hidden');
}
