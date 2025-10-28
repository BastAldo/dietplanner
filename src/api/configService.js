import { UI_TEXT } from '../config/uiText.js';
import { log } from '../utils/logger.js';
import { setPlannerConfig } from '../core/state.js';
import { showNotification } from '../ui/notifications.js';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${UI_TEXT.API_FETCH_ERROR} ${url}: ${response.status}`);
  }
  const textContent = await response.text();
  try {
    return JSON.parse(textContent);
  } catch (e) {
    log('API_SERVICE', `Errore nel parsing del JSON da ${url}`, {
      error: e.message,
      content: textContent.substring(0, 150)
    });
    throw new Error(UI_TEXT.API_INVALID_JSON);
  }
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
            log('API_SERVICE', UI_TEXT.API_EXERCISES_FILE_WARN, e.message);
        }

        return {
            rules: mealsConfig.rules || [],
            meals: mealsConfig.meals,
            ingredienti: ingredientsConfig.ingredienti,
            esercizi: exercises
        };

    } catch (error) {
        console.error("Fallimento nel caricamento della configurazione completa:", error.message);
        // Lancia l'errore specifico (che ora è pulito) invece di uno generico
        throw new Error(error.message || UI_TEXT.API_CONFIG_LOAD_FAIL);
    }
}

export async function fetchAndMergePackage(packageUrl) {
  log('API_SERVICE', 'Fetching and merging content package', { packageUrl });
  try {
    const packageManifest = await fetchJson(packageUrl);
    const contentPromises = [];

    if (packageManifest.ingredientiUrl) {
      contentPromises.push(fetchJson(new URL(packageManifest.ingredientiUrl, packageUrl).href));
    } else { contentPromises.push(Promise.resolve({ ingredienti: [] })); }

    if (packageManifest.pastiUrl) {
      contentPromises.push(fetchJson(new URL(packageManifest.pastiUrl, packageUrl).href));
    } else { contentPromises.push(Promise.resolve({ meals: [] })); }

    if (packageManifest.eserciziUrl) {
      contentPromises.push(fetchJson(new URL(packageManifest.eserciziUrl, packageUrl).href));
    } else { contentPromises.push(Promise.resolve({ esercizi: [] })); }

    const [ingredientsData, mealsData, exercisesData] = await Promise.all(contentPromises);

    const mergedConfig = {
      ingredienti: ingredientsData.ingredienti || [],
      meals: mealsData.meals || [],
      esercizi: exercisesData.esercizi || []
    };

    // Pass the merged data to setPlannerConfig, which handles the "intelligent merge"
    setPlannerConfig(mergedConfig, null);
    showNotification(UI_TEXT.EXPLORE_PACKAGE_LOAD_SUCCESS, 'success');

  } catch (error) {
    console.error("Failed to load and merge content package:", error);
    showNotification(error.message || UI_TEXT.EXPLORE_PACKAGE_LOAD_FAIL, 'error');
  }
}
