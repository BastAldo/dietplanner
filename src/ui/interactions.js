import { getState, updateWeeklyPlan, resetWeeklyPlan, setMasterMealList, setCsvUrl } from '../core/state.js';
import { isSoyMealAllowed } from '../core/validation.js';
import { fetchAndParseMeals } from '../api/mealService.js';

let draggedMealId = null;

export function initializeEventListeners() {
  // Pulsanti Principali
  document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm('Sei sicuro di voler svuotare l\'intero piano settimanale?')) resetWeeklyPlan();
  });
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('load-csv-btn').addEventListener('click', handleLoadCsv);
  
  // Modal
  document.getElementById('info-icon').addEventListener('click', toggleModal);
  document.getElementById('modal-close-btn').addEventListener('click', toggleModal);
  document.getElementById('info-modal').addEventListener('click', (e) => {
    if (e.target.id === 'info-modal') toggleModal(); // Chiude se si clicca sull'overlay
  });

  // Drag & Drop
  const mealLibrary = document.getElementById('meal-library');
  const calendarGrid = document.getElementById('calendar-grid');

  mealLibrary.addEventListener('dragstart', handleDragStart);
  mealLibrary.addEventListener('dragend', handleDragEnd);
  calendarGrid.addEventListener('dragover', handleDragOver);
  calendarGrid.addEventListener('dragleave', handleDragLeave);
  calendarGrid.addEventListener('drop', handleDrop);
}

async function handleLoadCsv() {
  const urlInput = document.getElementById('csv-url-input');
  const url = urlInput.value.trim();
  setCsvUrl(url);
  const meals = await fetchAndParseMeals(url);
  setMasterMealList(meals);
}

function toggleModal() {
  document.getElementById('info-modal').classList.toggle('modal-hidden');
}

function handleDragStart(e) {
  if (e.target.classList.contains('meal-card')) {
    draggedMealId = e.target.dataset.mealId;
    e.target.classList.add('dragging');
  }
}

function handleDragEnd(e) {
  if (e.target.classList.contains('meal-card')) {
    draggedMealId = null;
    e.target.classList.remove('dragging');
  }
}

function handleDragOver(e) {
  const slot = e.target.closest('.calendar-slot');
  if (slot) {
    e.preventDefault();
    slot.classList.add('drop-target');
  }
}

function handleDragLeave(e) {
  const slot = e.target.closest('.calendar-slot');
  if (slot) slot.classList.remove('drop-target');
}

function handleDrop(e) {
  e.preventDefault();
  const slot = e.target.closest('.calendar-slot');
  if (!slot || !draggedMealId) return;

  slot.classList.remove('drop-target');
  const { masterMealList, weeklyPlan } = getState();
  const mealToAdd = masterMealList.find(m => m.id === draggedMealId);
  const day = slot.dataset.slotId.split('-')[0];

  if (isSoyMealAllowed(day, mealToAdd, weeklyPlan, masterMealList)) {
    updateWeeklyPlan(slot.dataset.slotId, draggedMealId);
  } else {
    alert('Regola violata: Non è possibile consumare due pasti con soia nello stesso giorno.');
  }
}
