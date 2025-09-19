const modal = document.getElementById('notification-modal');
const messageElement = document.getElementById('notification-message');
const modalContent = modal.querySelector('.modal-content');

/**
 * Mostra una notifica modale.
 * @param {string} message - Il messaggio da visualizzare.
 * @param {'success' | 'error' | 'info'} type - Il tipo di notifica.
 */
export function showNotification(message, type = 'info') {
  messageElement.textContent = message;
  modalContent.className = 'modal-content notification-box'; // Reset classes
  if (type === 'success' || type === 'error') {
    modalContent.classList.add(`is-${type}`);
  }
  modal.classList.remove('modal-hidden');
}
