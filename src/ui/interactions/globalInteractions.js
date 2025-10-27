import { setView, getState } from '../../core/state.js';
import { log } from '../../utils/logger.js';

function handleHamburgerClick() {
    const nav = document.getElementById('main-nav');
    nav.classList.toggle('is-open');
    nav.classList.toggle('is-mobile');
}

export function initializeGlobalListeners() {
  document.getElementById('hamburger-btn').addEventListener('click', handleHamburgerClick);

  document.getElementById('nav-planner').addEventListener('click', () => setView('planner'));
  document.getElementById('nav-library').addEventListener('click', () => setView('library'));
  document.getElementById('nav-progress').addEventListener('click', () => setView('progress'));
  document.getElementById('nav-charts').addEventListener('click', () => setView('charts'));
  document.getElementById('nav-recipes').addEventListener('click', () => setView('recipes'));
  document.getElementById('nav-goals').addEventListener('click', () => setView('goals'));
  document.getElementById('nav-profile').addEventListener('click', () => setView('profile'));

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const modalId = e.currentTarget.dataset.target;
      if (modalId) { document.getElementById(modalId).classList.add('modal-hidden'); }
    });
  });

  // Robust modal closing logic
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
      let mouseDownTarget = null;
      overlay.addEventListener('mousedown', e => {
          if (e.target === overlay) {
              mouseDownTarget = e.target;
          }
      });
      overlay.addEventListener('mouseup', e => {
          if (e.target === mouseDownTarget) {
              overlay.classList.add('modal-hidden');
          }
          mouseDownTarget = null;
      });
  });

  document.getElementById('global-alert-close').addEventListener('click', () => { document.getElementById('global-alert').classList.add('hidden'); });
}
