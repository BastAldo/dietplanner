import { log } from '../../utils/logger.js';
import { openIngredientEditorModal, openMealEditorModal, openExerciseEditorModal, openWorkoutEditorModal } from '../modals.js';
import { showConfirmModal } from '../modals.js';
import { deleteIngredient, deleteMeal, getState, setUiState, deleteWorkoutTemplate, deleteExercise } from '../../core/state.js';
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
      library: { // Reset all filters on tab change
        ...state.ui.library,
        packageFilter: null,
        mealTypeFilter: 'all',
        execModeFilter: 'all'
      },
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
      library: {
        ...state.ui.library,
        packageFilter: newFilter
      },
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

  // --- Exercise Actions ---
  if (state.ui.activeLibraryTab === 'exercises') {
    const addBtn = e.target.closest('#add-exercise-btn');
    if (addBtn) {
      log('Interactions-Library', 'Add new exercise button clicked');
      openExerciseEditorModal({ context: 'library', exercise: null });
      return;
    }

    const item = e.target.closest('.library-item');
    if (!item) return;

    const exerciseId = item.dataset.id;
    const exercise = state.masterWorkoutList.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
      log('Interactions-Library', 'Edit exercise button clicked', { exerciseId });
      openExerciseEditorModal({ context: 'library', exercise: exercise });
      return;
    }

    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
      log('Interactions-Library', 'Delete exercise button clicked', { exerciseId });
      showConfirmModal({
        title: UI_TEXT.EXERCISE_DELETE_CONFIRM_TITLE,
        message: `${UI_TEXT.EXERCISE_DELETE_CONFIRM_MSG} "${exercise.name}"?`,
        onConfirm: () => {
          deleteExercise(exerciseId);
          showNotification(UI_TEXT.EXERCISE_DELETE_SUCCESS, 'success');
        },
        type: 'danger'
      });
      return;
    }
  }

  // --- Template Actions ---
  if (state.ui.activeLibraryTab === 'templates') {
    const addTemplateBtn = e.target.closest('#add-template-btn');
    if (addTemplateBtn) {
      log('Interactions-Library', 'Add new template button clicked');
      openWorkoutEditorModal({ type: 'template', templateId: null });
      return;
    }

    const templateItem = e.target.closest('.library-item');
    if (!templateItem) return;

    const templateId = parseFloat(templateItem.dataset.id);
    const template = state.masterWorkoutTemplateList.find(t => t.id === templateId);
    if (!template) return;

    const editTemplateBtn = e.target.closest('.btn-edit-template');
    if (editTemplateBtn) {
      log('Interactions-Library', 'Edit template button clicked', { templateId });
      openWorkoutEditorModal({ type: 'template', templateId: template.id });
      return;
    }

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
    library: {
      ...currentState.ui.library,
      searchTerm: searchTerm
    }
  });
}

function handleMealTypeFilterChange(e) {
  const currentState = getState();
  setUiState({
    ...currentState.ui,
    library: {
      ...currentState.ui.library,
      mealTypeFilter: e.target.value
    }
  });
}

function handleExecModeFilterChange(e) {
  const currentState = getState();
  setUiState({
    ...currentState.ui,
    library: {
      ...currentState.ui.library,
      execModeFilter: e.target.value
    }
  });
}

export function initializeLibraryListeners() {
  log('Interactions', 'Initializing library listeners');
  const libraryPage = document.getElementById('library-page');
  if (libraryPage) {
    libraryPage.addEventListener('click', handleLibraryClick);

    const searchInput = document.getElementById('library-search-input');
    searchInput.addEventListener('input', handleSearchInput);

    const specificFilters = document.getElementById('library-specific-filters');
    if (specificFilters) {
      specificFilters.addEventListener('change', (e) => {
        if (e.target.id === 'library-meal-type-filter') {
          handleMealTypeFilterChange(e);
        }
        if (e.target.id === 'library-exec-mode-filter') {
          handleExecModeFilterChange(e);
        }
      });
    }
  }
}
