import { UI_TEXT } from '../config/uiText.js';

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${UI_TEXT.API_FETCH_ERROR} ${url}: ${response.status}`);
    return response.json();
}

export async function fetchAndParseConfig(mealsUrl) {
    if (!mealsUrl) throw new Error(UI_TEXT.CONFIG_URL_EMPTY_ERROR);

    try {
        const mealsConfig = await fetchJson(mealsUrl);
        if (!mealsConfig.meals || !Array.isArray(mealsConfig.meals)) {
            throw new Error(UI_TEXT.API_INVALID_MEALS_FILE);
        }

        const baseUrl = new URL(mealsUrl);
        const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/'));

        const ingredientsUrl = `${baseUrl.origin}${basePath}/ingredienti.json`;
        const ingredientsConfig = await fetchJson(ingredientsUrl);
        if (!ingredientsConfig.ingredienti || !Array.isArray(ingredientsConfig.ingredienti)) {
            throw new Error(UI_TEXT.API_INVALID_INGREDIENTS_FILE);
        }

        let exercises = [];
        try {
            const exercisesUrl = `${baseUrl.origin}${basePath}/esercizi.json`;
            const exercisesConfig = await fetchJson(exercisesUrl);
            if (exercisesConfig.esercizi && Array.isArray(exercisesConfig.esercizi)) {
                exercises = exercisesConfig.esercizi;
            }
        } catch (e) {
            console.warn(UI_TEXT.API_EXERCISES_FILE_WARN);
        }

        return {
            rules: mealsConfig.rules || [],
            meals: mealsConfig.meals,
            ingredienti: ingredientsConfig.ingredienti,
            esercizi: exercises
        };

    } catch (error) {
        console.error("Fallimento nel caricamento della configurazione:", error);
        throw new Error(UI_TEXT.API_CONFIG_LOAD_FAIL);
    }
}
