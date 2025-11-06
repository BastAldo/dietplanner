import { addIngredient, updateIngredient, getState } from '../../core/state.js';
import { INGREDIENT_FIELDS } from '../../config/forms.js';
import { UI_TEXT } from '../../config/uiText.js';
import { showNotification } from '../notifications.js';
import { log } from '../../utils/logger.js';

export function openIngredientEditorModal(ingredient = null) {
  const isEditing = ingredient !== null;
  log('Modals', isEditing ? 'Opening ingredient editor modal (edit mode)' : 'Opening ingredient editor modal (create mode)', { ingredient });

  const modal = document.getElementById('ingredient-editor-modal');
  const form = modal.querySelector('#ingredient-editor-form');
  const title = modal.querySelector('#ingredient-editor-title');
  const saveBtn = modal.querySelector('#ingredient-editor-save-btn');

  title.textContent = isEditing ? UI_TEXT.INGREDIENT_EDIT_TITLE : UI_TEXT.INGREDIENT_NEW_TITLE;
  saveBtn.textContent = UI_TEXT.INGREDIENT_SAVE_BTN;

  form.innerHTML = INGREDIENT_FIELDS.map(field => `
    <div class="form-group">
      <label for="ing-edit-${field.id}">${UI_TEXT[field.label] || field.label}</label>
      <input
        type="${field.type}"
        id="ing-edit-${field.id}"
        name="${field.id}"
        value="${ingredient && ingredient[field.id] ? ingredient[field.id] : ''}"
        ${field.props || ''}
        ${(isEditing && field.id === 'id') ? 'readonly' : ''}
      >
    </div>
  `).join('');

  form.onsubmit = e => {
    e.preventDefault();
    const formData = new FormData(form);
    const ingredientData = {};
    let isValid = true;

    for (const field of INGREDIENT_FIELDS) {
      let value = formData.get(field.id);
      if (field.type === 'number') {
        value = value ? parseFloat(value) : null;
      }
      if (field.props && field.props.includes('required') && !value) {
        isValid = false;
        showNotification(`Il campo '${UI_TEXT[field.label] || field.label}' è obbligatorio.`, 'error');
        break;
      }
      ingredientData[field.id] = value;
    }

    if (!isValid) return;

    if (isEditing) {
      updateIngredient(ingredient.id, ingredientData);
      showNotification(UI_TEXT.INGREDIENT_UPDATE_SUCCESS, 'success');
    } else {
      const state = getState();
      if (state.masterIngredientList.some(ing => ing.id === ingredientData.id)) {
        showNotification(UI_TEXT.INGREDIENT_ID_CONFLICT, 'error');
        return;
      }
      addIngredient(ingredientData);
      showNotification(UI_TEXT.INGREDIENT_CREATE_SUCCESS, 'success');
    }

    modal.classList.add('modal-hidden');
  };

  modal.classList.remove('modal-hidden');
}
