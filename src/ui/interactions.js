import { getState, updateWeeklyPlan, resetWeeklyPlan } from '../core/state.js';
import { isSoyMealAllowed } from '../core/validation.js';

let draggedMealId = null;

/**
 * Inizializza tutti gli event listener dell'interfaccia.
 */
export function initializeEventListeners() {
  const mealLibrary = document.getElementById('meal-library');
  const calendarGrid = document.getElementById('calendar-grid');
  const resetBtn = document.getElementById('reset-btn');
  const printBtn = document.getElementById('print-btn');

  // Eventi Drag & Drop sulla libreria
  mealLibrary.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('meal-card')) {
      draggedMealId = e.target.dataset.mealId;
      e.target.classList.add('dragging');
    }
  });

  mealLibrary.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('meal-card')) {
      draggedMealId = null;
      e.target.classList.remove('dragging');
    }
  });

  // Eventi Drag & Drop sul calendario
  calendarGrid.addEventListener('dragover', (e) => {
    if (e.target.classList.contains('calendar-slot')) {
      e.preventDefault();
      e.target.classList.add('drop-target');
    }
  });
  
  calendarGrid.addEventListener('dragleave', (e) => {
    if (e.target.classList.contains('calendar-slot')) {
      e.target.classList.remove('drop-target');
    }
  });

  calendarGrid.addEventListener('drop', (e) => {
    e.preventDefault();
    const slot = e.target.closest('.calendar-slot');
    if (slot && draggedMealId) {
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
  });
  
  // Eventi Pulsanti
  resetBtn.addEventListener('click', () => {
    if(confirm('Sei sicuro di voler svuotare l\'intero piano settimanale?')) {
      resetWeeklyPlan();
    }
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });
}
