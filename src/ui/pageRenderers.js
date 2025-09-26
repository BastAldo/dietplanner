import { calculateBMR } from '../core/calculations.js';
import { BIOMETRIC_FIELDS, PROFILE_FIELDS, UI_TEXT } from '../utils/constants.js';

function toISODateString(date) {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

export function renderBiometricsPage(state) {
  const form = document.getElementById('biometrics-form');
  const tableBody = document.querySelector('#biometrics-table tbody');
  const tableHead = document.querySelector('#biometrics-table thead');
  form.innerHTML = `${BIOMETRIC_FIELDS.map(field => `<div class="form-group"><label for="bio-${field.id}">${field.label}</label>${field.type === 'textarea' ? `<textarea id="bio-${field.id}" name="${field.id}"></textarea>` : `<input type="${field.type}" id="bio-${field.id}" name="${field.id}" ${field.props || ''} ${field.id === 'date' ? `value="${toISODateString(new Date())}"` : ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.BIOMETRICS_SAVE_BTN}</button><button type="reset" class="btn btn-secondary">${UI_TEXT.BIOMETRICS_CLEAR_BTN}</button></div>`;
  tableHead.innerHTML = `<tr>${BIOMETRIC_FIELDS.map(f => `<th>${f.label}</th>`).join('')}<th>Azioni</th></tr>`;
  tableBody.innerHTML = state.biometricData.map(entry => `<tr data-date="${entry.date}">${BIOMETRIC_FIELDS.map(field => `<td>${entry[field.id] || ''}</td>`).join('')}<td class="biometrics-actions"><button class="btn-edit-biometrics" data-date="${entry.date}" title="Modifica">✏️</button><button class="btn-delete-biometrics" data-date="${entry.date}" title="Elimina">🗑️</button></td></tr>`).join('');
  
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
