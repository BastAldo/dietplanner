export async function fetchAndParseConfig(url) {
  if (!url) throw new Error("Per favore, inserisci un URL valido.");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Errore di rete: ${response.status}`);
    const config = await response.json();
    if (!config.rules || !config.meals) {
      throw new Error("Il file JSON non è valido. Mancano le chiavi 'rules' o 'meals'.");
    }
    return config;
  } catch (error) {
    console.error("Fallimento fetch/parse JSON:", error);
    throw new Error(`Impossibile caricare la configurazione. Controlla la console.`);
  }
}
