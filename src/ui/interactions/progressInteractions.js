import { getState, addOrUpdateBiometricEntry, deleteBiometricEntry, addMultipleBiometricEntries } from '../../core/state.js';
import { calculateBMR } from '../../core/calculations.js';
import { showNotification } from '../notifications.js';
import { showConfirmModal } from '../modals.js';
import { UI_TEXT } from '../../config/uiText.js';
import { log } from '../../utils/logger.js';
import { parseBiometricsCSV } from '../../core/importer.js';

function handleBiometricsForm(e) {
  e.preventDefault();
  log('Interactions', 'Biometrics form submitted');
  const formData = new FormData(e.target);
  const entry = {};
  for (let [key, value] of formData.entries()) { entry[key] = value; }
  addOrUpdateBiometricEntry(entry);
  showNotification(UI_TEXT.BIOMETRICS_SAVE_SUCCESS, 'success');
  e.target.reset();
  document.getElementById('bio-date').value = new Date().toISOString().slice(0, 10);
}

function handleImportCSV() {
  log('Interactions', 'Import CSV button clicked');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv,text/csv';
  fileInput.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = readerEvent => {
          try {
              const csvText = readerEvent.target.result;
              const existingEntries = getState().biometricData;
              const newEntries = parseBiometricsCSV(csvText).filter(newEntry =>
                !existingEntries.some(existing => existing.date === newEntry.date)
              );

              if (newEntries.length > 0) {
                  showConfirmModal(
                      UI_TEXT.IMPORT_CONFIRM_TITLE,
                      `Trovate ${newEntries.length} nuove misurazioni. Vuoi importarle?`,
                      () => {
                          addMultipleBiometricEntries(newEntries);
                          showNotification(UI_TEXT.IMPORT_SUCCESS, 'success');
                      },
                      'primary'
                  );
              } else {
                  showNotification(UI_TEXT.IMPORT_NO_NEW_DATA, 'info');
              }
          } catch (err) {
              showNotification(err.message, 'error');
          }
      };
      reader.onerror = () => showNotification(UI_TEXT.IMPORT_ERROR_FILE, 'error');
      reader.readAsText(file);
  };
  fileInput.click();
}

function handleBiometricsListClick(e) {
  const btnMenu = e.target.closest('.btn-actions-menu');
  if (btnMenu) {
      log('Interactions', 'Biometrics actions menu toggled');
      const dropdown = btnMenu.nextElementSibling;
      const allDropdowns = document.querySelectorAll('.actions-dropdown');
      allDropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
      dropdown.classList.toggle('show');
      return;
  }

  const btnEdit = e.target.closest('.btn-edit-biometrics');
  if (btnEdit) {
      const date = btnEdit.dataset.date;
      log('Interactions', 'Edit biometrics button clicked', { date });
      const entry = getState().biometricData.find(e => e.date === date);
      if (entry) {
          const form = document.getElementById('biometrics-form');
          for (const key in entry) {
              if (form.elements[key]) { form.elements[key].value = entry[key]; }
          }
          form.scrollIntoView({ behavior: 'smooth' });
      }
      const dropdown = btnEdit.closest('.actions-dropdown');
      if (dropdown) dropdown.classList.remove('show');
      return;
  }

  const btnDelete = e.target.closest('.btn-delete-biometrics');
  if (btnDelete) {
      const date = btnDelete.dataset.date;
      log('Interactions', 'Delete biometrics button clicked', { date });
      showConfirmModal(
          UI_TEXT.BIOMETRICS_DELETE_CONFIRM_TITLE, UI_TEXT.BIOMETRICS_DELETE_CONFIRM_MSG,
          () => { deleteBiometricEntry(date); showNotification(UI_TEXT.BIOMETRICS_DELETE_SUCCESS, 'info'); }, 'danger'
      );
      const dropdown = btnDelete.closest('.actions-dropdown');
      if (dropdown) dropdown.classList.remove('show');
      return;
  }

  if (!e.target.closest('.biometrics-actions')) {
      document.querySelectorAll('.actions-dropdown').forEach(d => d.classList.remove('show'));
  }
}

function handleWeightInputChange(e) {
  const weight = e.target.value;
  const { userProfile } = getState();
  const bmrField = document.getElementById('bio-basalMetabolism');
  const bmr = calculateBMR(userProfile, weight);
  if (bmr !== null) {
    bmrField.value = bmr;
  } else {
    bmrField.value = '';
    bmrField.placeholder = UI_TEXT.BIOMETRICS_BMR_PLACEHOLDER;
  }
}

export function initializeProgressListeners() {
  document.getElementById('biometrics-form').addEventListener('submit', handleBiometricsForm);
  const progressPage = document.getElementById('progress-page');
  progressPage.addEventListener('click', handleBiometricsListClick);
  progressPage.addEventListener('input', e => {
    if (e.target.id === 'bio-weight') { handleWeightInputChange(e); }
  });
  document.getElementById('import-csv-btn').addEventListener('click', handleImportCSV);

  // Close dropdown if clicking outside
  document.addEventListener('click', (e) => {
      if (!e.target.closest('.biometrics-actions')) {
          document.querySelectorAll('.actions-dropdown').forEach(d => d.classList.remove('show'));
      }
  });
}
