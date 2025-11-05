import { log } from '../../utils/logger.js';
import { openIngredientEditorModal, openMealEditorModal } from '../modals.js';
import { showConfirmModal } from '../modals.js';
import { deleteIngredient, deleteMeal, getState, setUiState, deleteWorkoutTemplate } from '../../core/state.js';
import { UI_TEXT } from '../../config/uiText.js';
import { showNotification } from '../notifications.js';

function handleLibraryClick(e) {
  const state = getState();

  // Tab switching
  const tabBtn = e.target.closest('.btn-view');
  if (tabBtn && tabBtn.dataset.view) {
    const newView = tabBtn.dataset.view;
    log('Interactions-Library', 'Tab changed', { newView });
    setUiState({
      ...state.ui,
      activeLibraryTab: newView,
      libraryActiveFilter: null,
    });
    return;
  }

  // Package Tag filter
  const tagFilterBtn = e.target.closest('.tag-filter-btn');
  if (tagFilterBtn && tagFilterBtn.dataset.tag) {
    const tag = tagFilterBtn.dataset.tag;
    const newFilter = tag === 'all' ? null : tag;
    log('Interactions-Library', 'Package filter changed', { newFilter });
    setUiState({
      ...state.ui,
      libraryActiveFilter: newFilter,
    });
    return;
  }

  // --- Ingredient Actions ---
  if (state.ui.activeLibraryTab === 'ingredients') {
    const addBtn = e.target.closest('#add-ingredient-btn');
    if (addBtn) {
      log('Interactions-Library', 'Add new ingredient button clicked');
      openIngredientEditorModal();
      return;
    }

    const item = e.target.closest('.library-item');
    if (!item) return;

    const ingredientId = item.dataset.id;
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

  // --- Meal Actions ---
  if (state.ui.activeLibraryTab === 'meals') {
    const addMealBtn = e.target.closest('#add-meal-btn');
    if (addMealBtn) {
      log('Interactions-Library', 'Add new meal button clicked');
      openMealEditorModal();
      return;
    }

    const mealItem = e.target.closest('.library-item');
    if (!mealItem) return;

    const mealId = mealItem.dataset.id;
    const meal = state.masterMealList.find(m => m.id === mealId);
    if (!meal) return;

    const editMealBtn = e.target.closest('.btn-edit');
    if (editMealBtn) {
      log('Interactions-Library', 'Edit meal button clicked', { mealId });
      openMealEditorModal(meal);
      return;
    }

    const deleteMealBtn = e.target.closest('.btn-delete');
    if (deleteMealBtn) {
      log('Interactions-Library', 'Delete meal button clicked', { mealId });
      showConfirmModal({
        title: UI_TEXT.MEAL_DELETE_CONFIRM_TITLE,
        message: `${UI_TEXT.MEAL_DELETE_CONFIRM_MSG} "${meal.nomePasto}"?`,
        onConfirm: () => {
          deleteMeal(mealId);
          showNotification(UI_TEXT.MEAL_DELETE_SUCCESS, 'success');
        },
        type: 'danger'
      });
      return;
    }
  }

  // --- Template Actions ---
  if (state.ui.activeLibraryTab === 'templates') {
    const templateItem = e.target.closest('.library-item');
    if (!templateItem) return;

    const templateId = parseFloat(templateItem.dataset.id);
    const template = state.masterWorkoutTemplateList.find(t => t.id === templateId);
    if (!template) return;

    const deleteTemplateBtn = e.target.closest('.btn-delete-template');
    if (deleteTemplateBtn) {
      log('Interactions-Library', 'Delete template button clicked', { templateId });
      showConfirmModal({
        title: UI_TEXT.TEMPLATE_DELETE_CONFIRM_TITLE,
        message: `${UI_TEXT.TEMPLATE_DELETE_CONFIRM_MSG} "${template.name}"?`,
        onConfirm: () => {
          deleteWorkoutTemplate(templateId);
          showNotification(UI_TEXT.TEMPLATE_DELETE_SUCCESS, 'success');
        },
        type: 'danger'
      });
      return;
    }
  }
}

function handleSearchInput(e) {
  const searchTerm = e.target.value;
  const currentState = getState();
  setUiState({
    ...currentState.ui,
    librarySearchTerm: searchTerm
  });
}

export function initializeLibraryListeners() {
  log('Interactions', 'Initializing library listeners');
  const libraryPage = document.getElementById('library-page');
  if (libraryPage) {
    libraryPage.addEventListener('click', handleLibraryClick);
    const searchInput = document.getElementById('library-search-input');
    searchInput.addEventListener('input', handleSearchInput);
  }
}
