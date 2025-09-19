import { CSV_URL } from '../utils/constants.js';

/**
 * Scarica e processa il file CSV dei pasti.
 * @returns {Promise<Array<Object>>} Una promessa che risolve in un array di oggetti pasto.
 */
export async function fetchAndParseMeals() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("Impossibile caricare i dati dei pasti:", error);
    alert("Errore nel caricamento dei pasti. Controlla la console per i dettagli.");
    return [];
  }
}

/**
 * Funzione base per il parsing del CSV.
 * @param {string} text - Il contenuto testuale del file CSV.
 * @returns {Array<Object>}
 */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split('\t').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split('\t').map(v => v.trim());
    const mealObject = {};
    headers.forEach((header, index) => {
      mealObject[header] = values[index];
    });
    return mealObject;
  });
}
