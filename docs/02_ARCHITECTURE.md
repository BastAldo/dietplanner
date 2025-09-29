# Architettura: HealtyPro (ex NutriPlan)

## 1. Principi Guida
* **PWA-First:** L'applicazione è progettata per essere installabile e funzionare offline.
* **Minimalism & Simplicity (KISS):** L'interfaccia utente è essenziale e intuitiva, basata su Vanilla JS.
* **Data-Driven & Convention over Configuration:** La logica di business è definita in file di configurazione remoti (`pasti.json`, `ingredienti.json`). L'applicazione si basa su convenzioni di struttura: dato l'URL di `pasti.json`, deduce automaticamente i percorsi per `ingredienti.json` (stessa directory) e per le ricette (sottodirectory `ricette/`).
* **Maintainability (SRP):** Ogni modulo ha una singola, chiara responsabilità.

## 2. Architettura SPA Multi-Vista
L'applicazione è una **Single Page Application (SPA)**. Un singolo `index.html` contiene i contenitori per ogni vista, e la logica in `renderer.js` gestisce quale vista mostrare in base allo stato.

## 3. Architettura PWA
* **`manifest.json`**: Fornisce i metadati per l'installazione.
* **`sw.js` (Service Worker)**: Mette in cache l' "app shell" per il funzionamento offline.

## 4. Logica di Business
### 4.1. Calcolo del BMR (`src/core/calculations.js`)
Logiche complesse come il calcolo del Metabolismo Basale (BMR) sono isolate in questo modulo dedicato.

### 4.2. Calcolo delle Calorie (`src/core/calorieCalculator.js`)
Questo modulo è un pilastro della nuova architettura e ha la sola responsabilità di calcolare le calorie dei pasti. Riceve la lista dei pasti e la lista degli ingredienti e arricchisce ogni pasto con le proprietà `calories_min` e `calories_max`. Questo disaccoppia completamente la logica di calcolo dalla definizione dei dati, permettendo di gestire logiche complesse (es. range, quantità in pezzi) in modo centralizzato e testabile.

## 5. Gestione dei Dati
### 5.1. Caricamento Dati (`src/api/configService.js`)
Il caricamento non è più un singolo fetch. Il servizio ora orchestra un caricamento a due fasi:
1.  Recupera il file `pasti.json` dall'URL fornito dall'utente.
2.  Deriva e recupera il file `ingredienti.json` dalla stessa directory.
3.  Restituisce un oggetto di configurazione unificato all'applicazione.

### 5.2. Strutture Dati Chiave
L'applicazione si basa su dati esterni e dati utente salvati nel `localStorage`.

* **Configurazione Remota**:
    * **`pasti.json`**: Un file contenente un array di oggetti `meals`. Ogni pasto definisce il suo nome, tipo e un array di `ingredienti` referenziati tramite `id` e quantità.
    * **`ingredienti.json`**: Un file contenente un array di `ingredienti`. Ogni ingrediente ha un `id`, un nome, `kcal_per_100g` e un campo opzionale `g_per_pezzo` per il calcolo calorico di item non misurati in grammi.

* **Dati Utente Locali**:
    * **`userProfile`**: Oggetto con i dati anagrafici dell'utente.
    * **`weeklyPlan`**: Oggetto che mappa gli slot giornalieri (`YYYY-MM-DD-MealType`) agli oggetti pasto pianificati.
    * **`biometricData`**: Array con lo storico delle misurazioni biometriche.

## 6. Dipendenze di Terze Parti
* **Marked.js & DOMPurify**: Caricate via CDN per il rendering sicuro delle ricette da Markdown.
* **Chart.js**: Caricata via CDN per la visualizzazione dei grafici.
