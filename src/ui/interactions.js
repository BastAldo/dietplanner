import { getState, updateWeeklyPlan, resetWeeklyPlan, setMasterMealList, setCsvUrl } from '../core/state.js';
import { isSoyMealAllowed } from '../core/validation.js';
import { fetchAndParseMeals } from '../api/mealService.js';
let draggedMealId = null;
export function initializeEventListeners() {
  document.getElementById('reset-btn').addEventListener('click', () => { if(confirm('Sei sicuro?')) resetWeeklyPlan(); });
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('load-csv-btn').addEventListener('click', handleLoadCsv);
  const modal = document.getElementById('info-modal');
  document.getElementById('info-icon').addEventListener('click', () => modal.classList.remove('modal-hidden'));
  document.getElementById('modal-close-btn').addEventListener('click', () => modal.classList.add('modal-hidden'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('modal-hidden'); });
  const library = document.getElementById('meal-library');
  const calendar = document.getElementById('calendar-grid');
  library.addEventListener('dragstart', e => { if (e.target.classList.contains('meal-card')) { draggedMealId = e.target.dataset.mealId; e.target.classList.add('dragging'); }});
  library.addEventListener('dragend', e => e.target.classList.remove('dragging'));
  calendar.addEventListener('dragover', e => { if(e.target.closest('.calendar-slot')) { e.preventDefault(); e.target.closest('.calendar-slot').classList.add('drop-target'); }});
  calendar.addEventListener('dragleave', e => e.target.closest('.calendar-slot')?.classList.remove('drop-target'));
  calendar.addEventListener('drop', handleDrop);
}
async function handleLoadCsv() {
  const url = document.getElementById('csv-url-input').value.trim();
  setCsvUrl(url);
  const meals = await fetchAndParseMeals(url);
  if (meals.length > 0) {
    setMasterMealList(meals);
  }
}
function handleDrop(e) {
  e.preventDefault();
  const slot = e.target.closest('.calendar-slot');
  if (!slot || !draggedMealId) return;
  slot.classList.remove('drop-target');
  const { masterMealList, weeklyPlan } = getState();
  const mealToAdd = masterMealList.find(m => m.id === draggedMealId);
  if (!mealToAdd) return;
  const day = slot.dataset.slotId.split('-')[0];
  if (isSoyMealAllowed(day, mealToAdd, weeklyPlan, masterMealList)) {
    updateWeeklyPlan(slot.dataset.slotId, draggedMealId);
  } else {
    alert('Regola violata: Non è possibile consumare due pasti con soia nello stesso giorno.');
  }
}
