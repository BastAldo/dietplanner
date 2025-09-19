import { getState, updateWeeklyPlan } from '../core/state.js';
import { DAYS, MEAL_TYPES } from '../utils/constants.js';

const selectionModal = document.getElementById('selection-modal');
const selectionModalTitle = document.getElementById('selection-modal-title');
const selectionModalList = document.getElementById('selection-modal-list');

function renderDesktopCalendar(element, state) { /* ... (logica precedente invariata, ora rinominata) ... */ }

function renderMobileCalendar(element, state) {
  element.innerHTML = '';
  DAYS.forEach(day => {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.innerHTML = `<div class="day-header">${day}</div><div class="day-slots"></div>`;
    const slotsContainer = dayCard.querySelector('.day-slots');
    
    MEAL_TYPES.forEach(mealType => {
      const slotId = `${day}-${mealType}`;
      const mealId = state.weeklyPlan[slotId];
      const meal = mealId ? state.masterMealList.find(m => m.id === mealId) : null;
      let mealCardHTML = '';
      if (meal) { /* ... (logica card invariata) ... */ }
      
      slotsContainer.innerHTML += `
        <div class="meal-type-label-mobile">${mealType}</div>
        <div class="calendar-slot" data-slot-id="${slotId}">${mealCardHTML}</div>
      `;
    });
    element.appendChild(dayCard);
  });
}

export function openSelectionModal(slotId) {
  const state = getState();
  const [day, mealType] = slotId.split('-');
  selectionModalTitle.textContent = `Scegli ${mealType} per ${day}`;
  
  const relevantMeals = state.masterMealList.filter(m => m.tipoPasto === mealType);
  selectionModalList.innerHTML = relevantMeals.map(meal => 
    `<div class="selection-item" data-meal-id="${meal.id}">
       <h4>${meal.nomePasto}</h4>
       <p>${meal.ingredienti || ''}</p>
     </div>`
  ).join('');
  
  selectionModalList.onclick = (e) => {
    const item = e.target.closest('.selection-item');
    if(item) {
      updateWeeklyPlan(slotId, item.dataset.mealId);
      selectionModal.classList.add('modal-hidden');
    }
  };

  selectionModal.classList.remove('modal-hidden');
}

export function renderApp() {
  const state = getState();
  const calendarGrid = document.getElementById('calendar-grid');
  
  if (window.matchMedia('(min-width: 768px)').matches) {
    renderDesktopCalendar(calendarGrid, state);
  } else {
    renderMobileCalendar(calendarGrid, state);
  }
  // ... (resto della logica di render (libreria, filtri, etc.) invariata)
}
