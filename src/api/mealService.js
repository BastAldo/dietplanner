export async function fetchAndParseMeals(url) {
  if (!url) { alert("Per favore, inserisci un URL valido."); return []; }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
    const csvText = await response.text();
    const meals = parseCSV(csvText);
    if (meals.length === 0) { alert("Il file CSV è vuoto o non ha un formato valido."); return []; }
    return meals;
  } catch (error) {
    console.error("Impossibile caricare i dati dei pasti:", error);
    alert(`Errore nel caricamento.\nControlla che l'URL sia corretto (RAW) e che il formato del file sia valido.`);
    return [];
  }
}
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split('\t').map(h => h.trim());
  if(!['id', 'nomePasto'].every(h => headers.includes(h))) {
      console.error("Header del CSV non valido."); return [];
  }
  return lines.slice(1).map(line => {
    const values = line.split('\t').map(v => v.trim());
    const mealObject = {};
    headers.forEach((header, index) => { mealObject[header] = values[index]; });
    return mealObject;
  });
}
