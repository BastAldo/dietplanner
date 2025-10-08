import { UI_TEXT } from '../config/uiText.js';

function parseAndFormatDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseAndFormatNumber(numStr) {
  if (typeof numStr !== 'string' || !numStr) return null;
  return parseFloat(numStr.replace(',', '.'));
}

export function parseBiometricsCSV(csvText) {
  const lines = csvText.trim().split('\n');
  
  const dataStartIndex = lines.findIndex(line => line.trim().toLowerCase().startsWith('data;ora;kg'));
  
  if (dataStartIndex === -1) {
    throw new Error(UI_TEXT.IMPORT_ERROR_FORMAT);
  }

  const headers = lines[dataStartIndex].trim().split(';').map(h => h.toLowerCase());
  const dataLines = lines.slice(dataStartIndex + 1);

  const headerMapping = {
    'data': 'date',
    'kg': 'weight',
    'massa grassa': 'fatPercentage',
    'acqua': 'water',
    'muscoli': 'muscleMass',
    'ossa': 'fatMass' // Nota: L'export CSV sembra mappare 'Ossa' a quello che noi chiamiamo 'fatMass' (Massa Grassa in kg)
  };

  const entries = dataLines.map(line => {
    const values = line.trim().split(';');
    if (values.length < headers.length) return null;

    const entry = {};
    let isValid = false;

    headers.forEach((header, index) => {
      const mappedKey = headerMapping[header];
      if (mappedKey) {
        let value = values[index];
        if (mappedKey === 'date') {
          value = parseAndFormatDate(value);
          if (value) isValid = true;
        } else {
          value = parseAndFormatNumber(value);
        }
        entry[mappedKey] = value;
      }
    });

    return isValid ? entry : null;
  }).filter(Boolean); // Rimuove eventuali righe nulle/invalide

  return entries;
}