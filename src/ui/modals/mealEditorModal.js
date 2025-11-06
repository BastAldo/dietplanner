import { getState, addMeal, updateMeal } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { showNotification } from '../notifications.js';
import { log } from '../../utils/logger.js';
import { ALL_MEAL_TYPES } from '../../utils/constants.js';
import { renderIcon } from '../icons.js';
import { processMealsWithMacros } from '../../core/calorieCalculator.js';

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
        <input type="number" name="quantita_g_${index}" placeholder="Grammi" min="0" value="${item.quantita_g || ''}" class="quantita_g">
        <input type="number" name="quantita_pezzi_${index}" placeholder="Pezzi" min="0" value="${item.quantita_pezzi || ''}" class="quantita_pezzi">
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

function formatMacroRange(min, max, label) {
  if (min === 0 && max === 0) return '';
  const value = (min === max) ? `${min}g` : `${min}-${max}g`;
  let className = '';
  if (label === 'P') className = 'macro-p';
  if (label === 'C') className = 'macro-c';
  if (label === 'F') className = 'macro-f';
  return `<span class="${className}">${label}: ${value}</span>`;
}

function updateTotals() {
  const totalsEl = document.getElementById('meal-editor-totals');
  const mealForCalc = {
    id: 'temp',
    ingredienti: tempIngredients,
  };

  const [processedMeal] = processMealsWithMacros([mealForCalc], getState().masterIngredientList);

  let totalsHTML = '';
  if (processedMeal.calories_min > 0) {
    if (processedMeal.calories_min === processedMeal.calories_max) {
      totalsHTML += `Totale: ${processedMeal.calories_min} Kcal`;
    } else {
      totalsHTML += `Totale: ${processedMeal.calories_min} - ${processedMeal.calories_max} Kcal`;
    }
  }

  const protHTML = formatMacroRange(processedMeal.prot_min, processedMeal.prot_max, 'P');
  const carbHTML = formatMacroRange(processedMeal.carb_min, processedMeal.carb_max, 'C');
  const fatHTML = formatMacroRange(processedMeal.fat_min, processedMeal.fat_max, 'F');

  if (protHTML || carbHTML || fatHTML) {
    totalsHTML += ` | ${protHTML} ${carbHTML} ${fatHTML}`;
  }

  totalsEl.innerHTML = totalsHTML;
}

function handleModalBodyClick(e) {
  // Add new ingredient
  if (e.target.closest('#meal-add-ingredient-btn')) {
    tempIngredients.push({ id: getState().masterIngredientList[0]?.id || '', quantita_g: null, quantita_pezzi: null });
    renderIngredientRows();
    return;
  }

  // Remove an ingredient
  const removeBtn = e.target.closest('.btn-remove-ingredient');
  if (removeBtn) {
    const row = e.target.closest('.meal-editor-ingredient-row');
    if (row) {
      tempIngredients.splice(parseInt(row.dataset.index, 10), 1);
      renderIngredientRows();
    }
    return;
  }

  // Toggle meal type chip
  const chip = e.target.closest('.meal-type-chip');
  if (chip) {
    chip.classList.toggle('active');
    return;
  }
}

function handleIngredientInputChange(e) {
  const target = e.target;
  const row = target.closest('.meal-editor-ingredient-row');
  if (!row) return;
  const index = parseInt(row.dataset.index, 10);

  if (target.matches('select')) {
    tempIngredients[index].id = target.value;
  } else if (target.matches('input[name^="quantita_g"]')) {
    tempIngredients[index].quantita_g = parseFloat(target.value) || null;
  } else if (target.matches('input[name^="quantita_pezzi"]')) {
    tempIngredients[index].quantita_pezzi = parseFloat(target.value) || null;
  }
  updateTotals();
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const mealData = {
    id: form.elements['id'].value,
    nomePasto: form.elements['nomePasto'].value,
    tipoPasto: [],
    ingredienti: tempIngredients.filter(ing => ing.id), // Filter out empty ones
  };

  document.querySelectorAll('#meal-edit-tipoPasto-container .meal-type-chip.active').forEach(chip => {
    mealData.tipoPasto.push(chip.dataset.value);
  });

  if (!mealData.id || !mealData.nomePasto) {
    showNotification('ID e Nome Pasto sono obbligatori.', 'error');
    return;
  }

  if (isEditingMode) {
    updateMeal(form.elements['id'].value, mealData);
    showNotification(UI_TEXT.MEAL_UPDATE_SUCCESS, 'success');
  } else {
    if (getState().masterMealList.some(m => m.id === mealData.id)) {
      showNotification(UI_TEXT.MEAL_ID_CONFLICT, 'error');
      return;
    }
    addMeal(mealData);
    showNotification(UI_TEXT.MEAL_CREATE_SUCCESS, 'success');
  }

  document.getElementById('meal-editor-modal').classList.add('modal-hidden');
}


export function openMealEditorModal(meal = null) {
  isEditingMode = meal !== null;
  log('Modals', isEditingMode ? 'Opening meal editor (edit)' : 'Opening meal editor (new)', { meal });

  tempIngredients = isEditingMode ? JSON.parse(JSON.stringify(meal.ingredienti || [])) : [];

  const modal = document.getElementById('meal-editor-modal');
  const form = modal.querySelector('#meal-editor-form');
  const title = modal.querySelector('#meal-editor-title');
  const saveBtn = modal.querySelector('#meal-editor-save-btn');
  const modalBody = modal.querySelector('.modal-body');

  title.textContent = isEditingMode ? UI_TEXT.MEAL_EDIT_TITLE : UI_TEXT.MEAL_NEW_TITLE;
  saveBtn.textContent = UI_TEXT.MEAL_SAVE_BTN;

  // Populate main form fields
  form.elements.id.value = meal?.id || '';
  form.elements.nomePasto.value = meal?.nomePasto || '';
  form.elements.id.readOnly = isEditingMode;

  // Populate meal type chips
  const tipoPastoContainer = document.getElementById('meal-edit-tipoPasto-container');
  tipoPastoContainer.innerHTML = ALL_MEAL_TYPES.map(type => `
    <div class="meal-type-chip ${meal?.tipoPasto?.includes(type) ? 'active' : ''}" data-value="${type}">
      ${type}
    </div>
  `).join('');

  renderIngredientRows();

  // --- Event Listener Management ---
  // Remove old listeners to prevent duplication
  modalBody.removeEventListener('click', handleModalBodyClick);
  modalBody.removeEventListener('input', handleIngredientInputChange);
  form.removeEventListener('submit', handleFormSubmit);

  // Add fresh listeners
  modalBody.addEventListener('click', handleModalBodyClick);
  modalBody.addEventListener('input', handleIngredientInputChange);
  form.addEventListener('submit', handleFormSubmit);

  modal.classList.remove('modal-hidden');
}
