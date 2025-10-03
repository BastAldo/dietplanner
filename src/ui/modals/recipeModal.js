import { getState } from '../../core/state.js';
import { showNotification } from '../notifications.js';
import { UI_TEXT } from '../../utils/constants.js';
import { log } from '../../utils/logger.js';

export async function showRecipeModal(meal) {
  if (!meal) return;
  log('Modals', 'Showing recipe modal', { mealId: meal.id });
  const state = getState();
  const recipeModal = document.getElementById('recipe-modal');
  const url = `${state.recipeBaseUrl}${meal.recipeId}.md`;
  recipeModal.querySelector('#recipe-modal-title').textContent = meal.nomePasto;
  const body = recipeModal.querySelector('#recipe-modal-body');
  body.innerHTML = `<p>${UI_TEXT.RECIPE_MODAL_LOADING}</p>`;
  recipeModal.classList.remove('modal-hidden');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Errore di rete: ${response.status}`);
    body.innerHTML = DOMPurify.sanitize(marked.parse(await response.text()));
  } catch (error) {
    body.innerHTML = `<p>${UI_TEXT.RECIPE_MODAL_LOAD_ERROR}</p>`;
    showNotification(UI_TEXT.RECIPE_LOAD_FAIL_MSG, 'error');
  }
}
