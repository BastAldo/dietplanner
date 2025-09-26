import { calculateBMR } from '../core/calculations.js';
import { BIOMETRIC_FIELDS, PROFILE_FIELDS, UI_TEXT } from '../utils/constants.js';
import { renderIcon } from './icons.js';

function toISODateString(date) {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

function formatReadableDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function renderBiometricsPage(state) {
  const form = document.getElementById('biometrics-form');
  const listContainer = document.getElementById('biometrics-list');

  // Render Form
  form.innerHTML = `${BIOMETRIC_FIELDS.map(field => `<div class="form-group"><label for="bio-${field.id}">${field.label}</label>${field.type === 'textarea' ? `<textarea id="bio-${field.id}" name="${field.id}"></textarea>` : `<input type="${field.type}" id="bio-${field.id}" name="${field.id}" ${field.props || ''} ${field.id === 'date' ? `value="${toISODateString(new Date())}"` : ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.BIOMETRICS_SAVE_BTN}</button><button type="reset" class="btn btn-secondary">${UI_TEXT.BIOMETRICS_CLEAR_BTN}</button></div>`;

  // Render Biometrics List as Cards
  if (state.biometricData.length > 0) {
      listContainer.innerHTML = state.biometricData.map(entry => {
          const fieldsHTML = BIOMETRIC_FIELDS.filter(field => field.id !== 'date' && entry[field.id])
              .map(field => `
                  <div class="biometric-card__item ${field.id === 'notes' ? 'biometric-card__notes' : ''}">
                      <span class="biometric-card__label">${field.label}</span>
                      <span class="biometric-card__value">${entry[field.id]}</span>
                  </div>
              `).join('');

          return `
              <div class="biometric-card" data-date="${entry.date}">
                  <div class="biometric-card__header">
                      <span class="biometric-card__date">${formatReadableDate(entry.date)}</span>
                      <div class="biometrics-actions">
                          <button class="btn-actions-menu" data-date="${entry.date}" title="Azioni">
                              ${renderIcon('KEBAB_MENU', { width: 24, height: 24 })}
                          </button>
                          <div class="actions-dropdown">
                              <button class="btn-edit-biometrics" data-date="${entry.date}">Modifica</button>
                              <button class="btn-delete-biometrics delete" data-date="${entry.date}">Elimina</button>
                          </div>
                      </div>
                  </div>
                  <div class="biometric-card__body">
                      ${fieldsHTML}
                  </div>
              </div>`;
      }).join('');
  } else {
      listContainer.innerHTML = `<p class="placeholder-text">${UI_TEXT.BIOMETRICS_EMPTY_LIST}</p>`;
  }

  const weightInput = form.elements.weight;
  const bmrInput = form.elements.basalMetabolism;
  const weightForCalc = weightInput.value || (state.biometricData.length > 0 ? state.biometricData[0].weight : null);

  const bmr = calculateBMR(state.userProfile, weightForCalc);
  if (bmr !== null) {
    bmrInput.value = bmr;
  } else {
    bmrInput.placeholder = UI_TEXT.BIOMETRICS_BMR_PLACEHOLDER;
  }
}

export function renderProfilePage(state) {
  const form = document.getElementById('profile-form');
  form.innerHTML = `${PROFILE_FIELDS.map(field => `<div class="form-group">${field.type === 'radio' ? `<fieldset><legend>${field.label}</legend>${field.options.map(opt => `<label><input type="radio" name="${field.id}" value="${opt.value}" ${state.userProfile[field.id] === opt.value ? 'checked' : ''}> ${opt.label}</label>`).join('')}</fieldset>` : `<label for="prof-${field.id}">${field.label}</label><input type="${field.type}" id="prof-${field.id}" name="${field.id}" value="${state.userProfile[field.id] || ''}" ${field.props || ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.PROFILE_SAVE_BTN}</button></div>`;
}
