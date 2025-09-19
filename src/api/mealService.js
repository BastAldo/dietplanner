export async function fetchAndParseMeals(url) {
  if (!url) {
    throw new Error("Per favore, inserisci un URL valido.");
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Errore di rete: ${response.status} - ${response.statusText}`);
    }
    const csvText = await response.text();
    const meals = parseCSV(csvText);
    if (meals.length === 0) {
      throw new Error("Il file CSV è vuoto o le intestazioni non sono valide.");
    }
    return meals;
  } catch (error) {
    console.error("Fallimento fetch/parse:", error);
    throw new Error(`Impossibile caricare i dati dall'URL. Controlla la console per i dettagli.`);
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(';').map(h => h.trim());
  const requiredHeaders = ['id', 'nomePasto', 'tipoPasto'];
  if (!requiredHeaders.every(h => headers.includes(h))) {
      console.error("Header mancanti:", requiredHeaders.filter(h => !headers.includes(h)));
      return [];
  }
  return lines.slice(1).map(line => {
    if (!line) return null;
    const values = line.split(';').map(v => v.trim().replace(/"/g, ''));
    const mealObject = {};
    headers.forEach((header, index) => {
      mealObject[header] = values[index];
    });
    return mealObject;
  }).filter(Boolean); // Rimuove eventuali righe vuote
}
