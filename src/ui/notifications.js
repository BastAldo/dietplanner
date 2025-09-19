const modal = document.getElementById('notification-modal');
const messageElement = document.getElementById('notification-message');
const modalContent = modal.querySelector('.modal-content');
export function showNotification(message, type = 'info') {
  messageElement.textContent = message;
  modalContent.className = 'modal-content notification-box';
  if (type === 'success' || type === 'error') {
    modalContent.classList.add(`is-${type}`);
  }
  modal.classList.remove('modal-hidden');
}
