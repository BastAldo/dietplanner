const toastContainer = document.getElementById('toast-container');

export function showNotification(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast is-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // If it's not an error, set a timeout to remove it
  if (type !== 'error') {
    setTimeout(() => {
      toast.classList.remove('show');
      // Remove the element from the DOM after the transition ends
      toast.addEventListener('transitionend', () => {
        if (toast.parentElement) {
          toastContainer.removeChild(toast);
        }
      });
    }, duration);
  }

  // Allow manual closing for all types
  toast.addEventListener('click', () => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      if (toast.parentElement) {
        toastContainer.removeChild(toast);
      }
    });
  });
}
