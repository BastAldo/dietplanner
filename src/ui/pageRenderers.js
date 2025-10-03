import { calculateBMR } from '../core/calculations.js';
import { BIOMETRIC_FIELDS, PROFILE_FIELDS } from '../config/forms.js';
import { UI_TEXT } from '../config/uiText.js';
import { renderIcon } from './icons.js';
import { renderCharts } from './charts.js';

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

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function renderBiometricsPage(state) {
  const form = document.getElementById('biometrics-form');
  const listContainer = document.getElementById('biometrics-list');

  form.innerHTML = `${BIOMETRIC_FIELDS.map(field => `<div class="form-group"><label for="bio-${field.id}">${field.label}</label>${field.type === 'textarea' ? `<textarea id="bio-${field.id}" name="${field.id}"></textarea>` : `<input type="${field.type}" id="bio-${field.id}" name="${field.id}" ${field.props || ''} ${field.id === 'date' ? `value="${toISODateString(new Date())}"` : ''}>`}</div>`).join('')}<div class="form-actions"><button type="submit" class="btn btn-primary">${UI_TEXT.BIOMETRICS_SAVE_BTN}</button><button type="reset" class="btn btn-secondary">${UI_TEXT.BIOMETRICS_CLEAR_BTN}</button></div>`;

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
                          <button class="btn-actions-menu" data-date="${entry.date}" title="${UI_TEXT.BIOMETRICS_ACTIONS_TITLE}">
                              ${renderIcon('KEBAB_MENU', { width: 24, height: 24 })}
                          </button>
                          <div class="actions-dropdown">
                              <button class="btn-edit-biometrics" data-date="${entry.date}">${UI_TEXT.BIOMETRICS_EDIT_BTN}</button>
                              <button class="btn-delete-biometrics delete" data-date="${entry.date}">${UI_TEXT.BIOMETRICS_DELETE_BTN}</button>
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

export function renderChartsPage(state) {
    const placeholder = document.getElementById('biometrics-chart-placeholder');
    const canvas = document.getElementById('biometrics-chart-canvas');
    if (state.biometricData.length < 2) {
        placeholder.textContent = UI_TEXT.BIOMETRICS_CHART_EMPTY;
        placeholder.classList.remove('hidden');
        canvas.classList.add('hidden');
    } else {
        placeholder.classList.add('hidden');
        canvas.classList.remove('hidden');
    }
    renderCharts(state);
}

export function renderDebriefingPage(state) {
  const summaryContainer = document.getElementById('debriefing-summary');
  const statsContainer = document.getElementById('debriefing-stats');
  const summary = state.lastWorkoutSummary;

  if (!summary || !summary.exercises) {
      summaryContainer.innerHTML = `<p class="placeholder-text">${UI_TEXT.DEBRIEFING_NO_SUMMARY}</p>`;
      statsContainer.innerHTML = '';
      return;
  }

  const statsHTML = `
      <div class="stat-item">
          <span class="stat-label">${UI_TEXT.DEBRIEFING_TOTAL_TIME}</span>
          <span class="stat-value">${formatDuration(summary.totalTime)}</span>
      </div>
      <div class="stat-item">
          <span class="stat-label">${UI_TEXT.DEBRIEFING_TOTAL_SETS}</span>
          <span class="stat-value">${summary.totalSets}</span>
      </div>
  `;
  statsContainer.innerHTML = statsHTML;

  const summaryHTML = summary.exercises.map(exercise => {
      const isCompleted = exercise.setsCompleted === exercise.defaultSets;
      return `
          <div class="debriefing-card ${isCompleted ? 'completed' : 'incomplete'}">
              <h4>${exercise.name}</h4>
              <p>${UI_TEXT.DEBRIEFING_SETS_COMPLETED}: ${exercise.setsCompleted} / ${exercise.defaultSets}</p>
              <div class="debriefing-status">
                  ${isCompleted ? UI_TEXT.DEBRIEFING_COMPLETED : UI_TEXT.DEBRIEFING_INCOMPLETE}
              </div>
          </div>
      `;
  }).join('');

  summaryContainer.innerHTML = summaryHTML;
}
