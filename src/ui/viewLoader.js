async function fetchAndInject(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load template: ${url}`);
        }
        const content = await response.text();
        document.getElementById(containerId).innerHTML += content;
    } catch (error) {
        console.error(error);
    }
}

export async function loadViews() {
    const appContainer = document.getElementById('app-container');
    const modalContainer = document.getElementById('modal-container');
    
    // Svuota i container per evitare duplicati in caso di ricaricamento a caldo (hot-reloading)
    appContainer.innerHTML = '';
    modalContainer.innerHTML = '';

    // Carica le viste principali
    await fetchAndInject('templates/planner.html', 'app-container');
    await fetchAndInject('templates/progress.html', 'app-container');
    await fetchAndInject('templates/charts.html', 'app-container');
    await fetchAndInject('templates/recipes.html', 'app-container');
    await fetchAndInject('templates/profile.html', 'app-container');
    await fetchAndInject('templates/trainer.html', 'app-container');
    await fetchAndInject('templates/debriefing.html', 'app-container');
    
    // Carica i modali
    await fetchAndInject('templates/modals.html', 'modal-container');
}
