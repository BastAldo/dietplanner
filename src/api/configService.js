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

        const baseUrl = new URL(mealsUrl);
        const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/'));

        // Deriva l'URL degli ingredienti
        const ingredientsUrl = `${baseUrl.origin}${basePath}/ingredienti.json`;
        const ingredientsConfig = await fetchJson(ingredientsUrl);
        if (!ingredientsConfig.ingredienti || !Array.isArray(ingredientsConfig.ingredienti)) {
            throw new Error("Il file degli ingredienti non è valido. Manca la chiave 'ingredienti' o non è un array.");
        }

        // Deriva l'URL degli esercizi (opzionale)
        let exercises = [];
        try {
            const exercisesUrl = `${baseUrl.origin}${basePath}/esercizi.json`;
            const exercisesConfig = await fetchJson(exercisesUrl);
            if (exercisesConfig.esercizi && Array.isArray(exercisesConfig.esercizi)) {
                exercises = exercisesConfig.esercizi;
            }
        } catch (e) {
            console.warn("File esercizi.json non trovato o non valido. Continuo senza dati di allenamento.");
        }

        // Combina le configurazioni
        return {
            rules: mealsConfig.rules || [],
            meals: mealsConfig.meals,
            ingredienti: ingredientsConfig.ingredienti,
            esercizi: exercises
        };

    } catch (error) {
        console.error("Fallimento nel caricamento della configurazione:", error);
        throw new Error(`Impossibile caricare la configurazione completa. Controlla la console.`);
    }
}
