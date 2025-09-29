# Architettura: HealtyPro (ex NutriPlan)

## 1. Principi Guida
* **PWA-First:** L'applicazione è progettata per essere installabile e funzionare offline.
* **Minimalism & Simplicity (KISS):** L'interfaccia utente è essenziale e intuitiva, basata su Vanilla JS.
* **Data-Driven & Convention over Configuration:** La logica di business è definita in file di configurazione remoti. L'applicazione si basa su convenzioni di struttura: dato l'URL di `pasti.json`, deduce automaticamente i percorsi per `ingredienti.json` (stessa directory), `esercizi.json` (stessa directory) e per le ricette (sottodirectory `ricette/`).
* **Maintainability (SRP):** Ogni modulo ha una singola, chiara responsabilità.

## 2. Architettura SPA Multi-Vista
L'applicazione è una **Single Page Application (SPA)**. Un singolo `index.html` contiene i contenitori per ogni vista, e la logica in `renderer.js` gestisce quale vista mostrare in base allo stato.

## 3. Architettura PWA
* **`manifest.json`**: Fornisce i metadati per l'installazione.
* **`sw.js` (Service Worker)**: Mette in cache l' "app shell" per il funzionamento offline.

## 4. Logica di Business
### 4.1. Workout Builder Composizionale
A differenza di un approccio a piani fissi, HealtyPro adotta un modello composizionale. L'utente costruisce la propria sessione di allenamento giorno per giorno aggiungendo esercizi individuali da una libreria. Questo offre massima flessibilità e allinea l'esperienza utente a quella della pianificazione pasti.

### 4.2. Calcolo del BMR (`src/core/calculations.js`)
Logiche complesse come il calcolo del Metabolismo Basale (BMR) sono isolate in questo modulo dedicato.

### 4.3. Calcolo delle Calorie (`src/core/calorieCalculator.js`)
Questo modulo è un pilastro della nuova architettura e ha la sola responsabilità di calcolare le calorie dei pasti. Riceve la lista dei pasti e la lista degli ingredienti e arricchisce ogni pasto con le proprietà `calories_min` e `calories_max`.

## 5. Gestione dei Dati
### 5.1. Caricamento Dati (`src/api/configService.js`)
Il caricamento non è più un singolo fetch. Il servizio ora orchestra un caricamento multi-fase:
1.  Recupera il file `pasti.json` dall'URL fornito dall'utente.
2.  Deriva e recupera il file `ingredienti.json` dalla stessa directory.
3.  Deriva e recupera il file `esercizi.json` (opzionale) dalla stessa directory.
4.  Restituisce un oggetto di configurazione unificato all'applicazione.

### 5.2. Strutture Dati Chiave
* **Configurazione Remota**:
    * **`pasti.json`**: Array di oggetti `meals`.
    * **`ingredienti.json`**: Array di `ingredienti`.
    * **`esercizi.json`**: Un array di `esercizi`. Ogni esercizio è un oggetto che definisce le sue proprietà di base (ID, nome, descrizione, modalità) e i valori di default per serie, ripetizioni, durata, riposo e `tempo` (un oggetto con `up`, `hold`, `down`).

* **Dati Utente Locali (`localStorage`)**:
    * **`userProfile`**: Dati anagrafici dell'utente.
    * **`weeklyPlan`**: Oggetto che mappa gli slot giornalieri (`YYYY-MM-DD-MealType`) ai pasti pianificati.
    * **`weeklyWorkouts`**: Oggetto che mappa uno slot giornaliero (`YYYY-MM-DD-Allenamento`) a un **array di oggetti esercizio**. Ogni oggetto in questo array è una copia dell'esercizio dalla libreria, arricchito con un `instanceId` univoco per permetterne la gestione individuale.
    * **`biometricData`**: Array con lo storico delle misurazioni biometriche.

## 6. Dipendenze di Terze Parti
* **Marked.js & DOMPurify**: Caricate via CDN per il rendering sicuro delle ricette da Markdown.
* **Chart.js**: Caricata via CDN per la visualizzazione dei grafici.
