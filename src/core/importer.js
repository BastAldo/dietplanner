import { UI_TEXT } from '../config/uiText.js';

function parseAndFormatDate(dateStr) {
  if (typeof dateStr !== 'string' || !dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  let [day, month, year] = parts;
  day = day.padStart(2, '0');
  month = month.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseAndFormatNumber(numStr) {
  if (typeof numStr !== 'string' || !numStr) return null;
  return parseFloat(numStr.replace(',', '.'));
}

function parseUserProfile(lines) {
  const profile = {};
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.startsWith('sesso')) {
      profile.gender = lowerLine.includes('maschio') ? 'male' : 'female';
    } else if (lowerLine.startsWith('data di nascita')) {
      const dateStr = line.split(' ').pop();
      profile.dateOfBirth = parseAndFormatDate(dateStr);
    } else if (lowerLine.startsWith('statura')) {
      profile.height = parseInt(line.match(/\d+/)[0], 10);
    } else if (lowerLine.startsWith('nome ')) {
      profile.firstName = line.substring(line.indexOf(' ')).trim();
    } else if (lowerLine.startsWith('cognome ')) {
      profile.lastName = line.substring(line.indexOf(' ')).trim();
    }
  });
  return profile;
}

export function parseBiometricsCSV(csvText) {
  const lines = csvText.trim().split('\n');
  
  const dataStartIndex = lines.findIndex(line => line.trim().toLowerCase().startsWith('data;ora;kg'));
  
  if (dataStartIndex === -1) {
    throw new Error(UI_TEXT.IMPORT_ERROR_FORMAT);
  }

  const profileLines = lines.slice(0, dataStartIndex);
  const userProfile = parseUserProfile(profileLines);

  const headers = lines[dataStartIndex].trim().split(';').map(h => h.toLowerCase());
  const dataLines = lines.slice(dataStartIndex + 1);

  const headerMapping = {
    'data': 'date',
    'kg': 'weight',
    'imc': 'bmi',
    'massa grassa': 'fatPercentage',
    'acqua': 'water',
    'muscoli': 'muscleMass',
  };
  
  const tempEntries = new Map();

  dataLines.forEach(line => {
    const values = line.trim().split(';');
    if (values.length < headers.length) return;

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

    if (isValid) {
      if (entry.weight && entry.fatPercentage) {
        entry.fatMass = parseFloat(((entry.weight * entry.fatPercentage) / 100).toFixed(1));
      }
      tempEntries.set(entry.date, entry);
    }
  });

  return {
    userProfile,
    entries: Array.from(tempEntries.values())
  };
}
