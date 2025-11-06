import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { showNotification } from '../notifications.js';

export function showConfirmModal(options) {
  const {
    title,
    message,
    input, // Nuovo: { placeholder, value, required }
    buttons = [], // Default to an empty array
    // The following are fallbacks for the old API signature
    onConfirm,
    onCancel,
    type = 'secondary',
    confirmText = UI_TEXT.CONFIRM_MODAL_CONFIRM_BTN,
    cancelText = UI_TEXT.CONFIRM_MODAL_CANCEL_BTN,
  } = options;

  log('Modals', 'Showing confirm modal', { title, hasInput: !!input });
  const confirmModal = document.getElementById('confirm-modal');
  confirmModal.querySelector('#confirm-modal-title').textContent = title;
  
  const modalBody = confirmModal.querySelector('.modal-body');
  modalBody.innerHTML = `<p id="confirm-modal-message">${message}</p>`; // Pulisci e imposta messaggio

  // Aggiungi input se richiesto
  if (input) {
    modalBody.innerHTML += `
      <div class="form-group">
        <input type="text" id="confirm-modal-input" placeholder="${input.placeholder || ''}" value="${input.value || ''}">
      </div>
    `;
  }
  
  const footer = confirmModal.querySelector('.modal-footer');
  footer.innerHTML = ''; // Clear previous buttons

  let buttonConfigs = buttons;

  // Handle backward compatibility for old 2-button calls
  if (buttonConfigs.length === 0 && onConfirm) {
    buttonConfigs.push({
      text: confirmText,
      className: `btn btn-${type}`,
      callback: onConfirm
    });
    buttonConfigs.push({
      text: cancelText,
      className: 'btn btn-secondary',
      callback: onCancel
    });
  }

  const cleanup = () => {
    confirmModal.classList.add('modal-hidden');
    // Rimuovi l'input per sicurezza
    const inputEl = modalBody.querySelector('#confirm-modal-input');
    if (inputEl) {
      inputEl.parentElement.remove();
    }
  };

  buttonConfigs.forEach(btnConfig => {
    const button = document.createElement('button');
    button.textContent = btnConfig.text;
    button.className = btnConfig.className || 'btn btn-secondary';
    button.addEventListener('click', () => {
      let inputValue = null;
      if (input) {
        const inputEl = document.getElementById('confirm-modal-input');
        inputValue = inputEl.value;

        if (input.required && (!inputValue || inputValue.trim() === '')) {
          showNotification('Questo campo è obbligatorio.', 'error');
          inputEl.focus();
          return; // Non chiudere il modale, non eseguire il callback
        }
      }
      
      if (btnConfig.callback) {
        btnConfig.callback(inputValue); // Passa il valore dell'input al callback
      }
      cleanup();
    }, { once: false }); // Rimosso 'once: true' per permettere la validazione
    footer.appendChild(button);
  });

  // Add a default cancel button if the user only provides one button via the old API
  // This is a safety measure to ensure modals can always be closed.
  if (buttons.length === 0 && onConfirm && !onCancel && buttonConfigs.length === 1) {
      const cancelButton = document.createElement('button');
      cancelButton.textContent = UI_TEXT.CONFIRM_MODAL_CANCEL_BTN;
      cancelButton.className = 'btn btn-secondary';
      cancelButton.addEventListener('click', cleanup, { once: true });
      footer.appendChild(cancelButton);
  }

  confirmModal.classList.remove('modal-hidden');
  if (input) {
    document.getElementById('confirm-modal-input').focus();
  }
}
