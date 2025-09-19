import { loadStateFromLocalStorage, getState, setPlannerConfig } from './core/state.js';
import { renderApp } from './ui/renderer.js';
import { initializeEventListeners } from './ui/interactions.js';
import { DEFAULT_CONFIG_URL } from './utils/constants.js';
import { fetchAndParseConfig } from './api/configService.js';
import { showNotification } from './ui/notifications.js';

/**
 * Carica la configurazione iniziale se un URL è già presente nello stato.
 * @param {string} url - L'URL della configurazione da caricare.
 */
async function loadInitialConfig(url) {
  if (!url) return;
  try {
    const config = await fetchAndParseConfig(url);
    setPlannerConfig(config);
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

/**
 * Funzione di inizializzazione dell'applicazione.
 */
function init() {
  // Imposta il listener che lega le modifiche di stato al rendering.
  document.addEventListener('stateChange', renderApp);

  // Carica dati da localStorage e imposta l'UI iniziale.
  loadStateFromLocalStorage();
  const initialState = getState();
  document.getElementById('config-url-input').value = initialState.configUrl || DEFAULT_CONFIG_URL;
  
  // Attiva tutti gli altri event listener (clicks, drag & drop, etc.).
  initializeEventListeners();

  // Triggera un rendering iniziale e carica i dati se l'URL esiste già.
  renderApp();
  loadInitialConfig(initialState.configUrl);
}

document.addEventListener('DOMContentLoaded', init);
