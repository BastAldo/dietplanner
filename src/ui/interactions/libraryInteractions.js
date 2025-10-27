import { log } from '../../utils/logger.js';
import { openIngredientEditorModal } from '../modals.js';
import { showConfirmModal } from '../modals.js';
import { deleteIngredient, getState } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { showNotification } from '../notifications.js';

function handleLibraryClick(e) {
  const addBtn = e.target.closest('#add-ingredient-btn');
  if (addBtn) {
    log('Interactions-Library', 'Add new ingredient button clicked');
    openIngredientEditorModal();
    return;
  }

  const item = e.target.closest('.library-item');
  if (!item) return;

  const ingredientId = item.dataset.id;
  const state = getState();
  const ingredient = state.masterIngredientList.find(ing => ing.id === ingredientId);

  if (!ingredient) return;

  const editBtn = e.target.closest('.btn-edit');
  if (editBtn) {
    log('Interactions-Library', 'Edit ingredient button clicked', { ingredientId });
    openIngredientEditorModal(ingredient);
    return;
  }

  const deleteBtn = e.target.closest('.btn-delete');
  if (deleteBtn) {
    log('Interactions-Library', 'Delete ingredient button clicked', { ingredientId });
    showConfirmModal({
      title: UI_TEXT.INGREDIENT_DELETE_CONFIRM_TITLE,
      message: `${UI_TEXT.INGREDIENT_DELETE_CONFIRM_MSG} "${ingredient.nome}"?`,
      onConfirm: () => {
        deleteIngredient(ingredientId);
        showNotification(UI_TEXT.INGREDIENT_DELETE_SUCCESS, 'success');
      },
      type: 'danger'
    });
    return;
  }
}

export function initializeLibraryListeners() {
  log('Interactions', 'Initializing library listeners');
  const libraryPage = document.getElementById('library-page');
  if (libraryPage) {
    libraryPage.addEventListener('click', handleLibraryClick);
  }
}
