import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';

export function showConfirmModal(title, message, onConfirm, type = 'secondary') {
  log('Modals', 'Showing confirm modal', { title });
  const confirmModal = document.getElementById('confirm-modal');
  confirmModal.querySelector('#confirm-modal-title').textContent = title;
  confirmModal.querySelector('#confirm-modal-message').textContent = message;
  const confirmBtn = confirmModal.querySelector('#confirm-modal-confirm-btn');
  const cancelBtn = confirmModal.querySelector('#confirm-modal-cancel-btn');
  confirmBtn.className = `btn btn-${type}`;
  confirmBtn.textContent = UI_TEXT.CONFIRM_MODAL_CONFIRM_BTN;
  cancelBtn.textContent = UI_TEXT.CONFIRM_MODAL_CANCEL_BTN;
  const cleanup = () => {
    confirmModal.classList.add('modal-hidden');
    cancelBtn.removeEventListener('click', cancelHandler);
    confirmBtn.removeEventListener('click', confirmHandler);
  };
  const cancelHandler = () => cleanup();
  const confirmHandler = () => { onConfirm(); cleanup(); };
  cancelBtn.addEventListener('click', cancelHandler, { once: true });
  confirmBtn.addEventListener('click', confirmHandler, { once: true });
  confirmModal.classList.remove('modal-hidden');
}
