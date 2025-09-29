async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Errore di rete caricando ${url}: ${response.status}`);
    return response.json();
}

export async function fetchAndParseConfig(mealsUrl) {
    if (!mealsUrl) throw new Error("Per favore, inserisci un URL valido per i pasti.");

    try {
        const mealsConfig = await fetchJson(mealsUrl);
        if (!mealsConfig.meals || !Array.isArray(mealsConfig.meals)) {
            throw new Error("Il file dei pasti non è valido. Manca la chiave 'meals' o non è un array.");
        }

        // Deriva l'URL degli ingredienti
        const baseIngredientsUrl = new URL(mealsUrl);
        const ingredientsPath = baseIngredientsUrl.pathname.substring(0, baseIngredientsUrl.pathname.lastIndexOf('/')) + '/ingredienti.json';
        const ingredientsUrl = `${baseIngredientsUrl.origin}${ingredientsPath}`;

        const ingredientsConfig = await fetchJson(ingredientsUrl);
        if (!ingredientsConfig.ingredienti || !Array.isArray(ingredientsConfig.ingredienti)) {
            throw new Error("Il file degli ingredienti non è valido. Manca la chiave 'ingredienti' o non è un array.");
        }

        // Combina le configurazioni
        return {
            rules: mealsConfig.rules || [],
            meals: mealsConfig.meals,
            ingredienti: ingredientsConfig.ingredienti
        };

    } catch (error) {
        console.error("Fallimento nel caricamento della configurazione:", error);
        throw new Error(`Impossibile caricare la configurazione completa. Controlla la console.`);
    }
}
