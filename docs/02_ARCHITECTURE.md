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

### 4.2. Modalità di Esecuzione e Ciclo di Ripetizione (Vista Trainer)
La Vista Trainer opera in diverse modalità a seconda delle proprietà dell'esercizio caricato. Questo garantisce un'esperienza utente flessibile e adatta a diversi tipi di allenamento. La modalità viene scelta in base a un campo `execution_mode` nell'oggetto dell'esercizio.

#### Modalità 1: `tempo_guided` (Default)
Per garantire un'esperienza utente guidata e prevenire movimenti affrettati, il modulo Trainer implementa un ciclo di esecuzione dettagliato per ogni singola ripetizione di un esercizio basato sul `tempo`. Questo ciclo è "pre-compilato" in una coda di esecuzione prima dell'inizio di ogni serie.

Ogni ripetizione è suddivisa in 6 fasi:
1.  **`pre-up`**: Una fase di preparazione di durata fissa (es. 0.7s). L'UI (es. "time ring") lampeggia e mostra il nome della fase successiva ("UP").
2.  **`up`**: La fase concentrica (salita). La sua durata è letta da `tempo.up`. L'UI mostra un'animazione fluida.
3.  **`pre-hold`**: Fase di preparazione (0.7s). L'UI lampeggia e mostra "HOLD".
4.  **`hold`**: La fase isometrica (pausa). La sua durata è letta da `tempo.hold`.
5.  **`pre-down`**: Fase di preparazione (0.7s). L'UI lampeggia e mostra "DOWN".
6.  **`down`**: La fase eccentrica (discesa). La sua durata è letta da `tempo.down`.

#### Modalità 2: `static_hold`
Utilizzata per esercizi isometrici come il Plank. L'interfaccia mostra un unico timer centrale che esegue un countdown per la durata totale della serie. Se l'esercizio è configurato per essere eseguito "a sfinimento", il timer diventa un cronometro che conta in avanti.

#### Modalità 3: `manual_reps`
Utilizzata per serie "a sfinimento" o con un range di ripetizioni (min/max). L'interfaccia non mostra un timer, ma un contatore e un pulsante principale per permettere all'utente di registrare manualmente ogni ripetizione completata.

### 4.3. Calcolo del BMR (`src/core/calculations.js`)
Logiche complesse come il calcolo del Metabolismo Basale (BMR) sono isolate in questo modulo dedicato.

### 4.4. Calcolo delle Calorie (`src/core/calorieCalculator.js`)
Questo modulo ha la sola responsabilità di calcolare le calorie dei pasti, ricevendo la lista dei pasti e degli ingredienti e arricchendo ogni pasto con `calories_min` e `calories_max`.

## 5. Gestione dei Dati
### 5.1. Caricamento Dati (`src/api/configService.js`)
Il servizio orchestra un caricamento multi-fase per `pasti.json`, `ingredienti.json` e `esercizi.json`.

### 5.2. Strutture Dati Chiave
* **Configurazione Remota**:
    * **`pasti.json`**: Array di oggetti `meals`.
    * **`ingredienti.json`**: Array di `ingredienti`.
    * **`esercizi.json`**: Un array di `esercizi`. Ogni esercizio è un oggetto che definisce le sue proprietà di base (ID, nome, descrizione) e i valori di default per serie, ripetizioni, durata, riposo, `tempo` (un oggetto con `up`, `hold`, `down`) e il nuovo campo opzionale `execution_mode`.

* **Dati Utente Locali (`localStorage`)**:
    * **`userProfile`**: Dati anagrafici dell'utente.
    * **`weeklyPlan`**: Oggetto che mappa gli slot giornalieri (`YYYY-MM-DD-MealType`) ai pasti pianificati.
    * **`weeklyWorkouts`**: Oggetto che mappa uno slot giornaliero (`YYYY-MM-DD-Allenamento`) a un **array di oggetti esercizio**. Ogni oggetto in questo array è una copia dell'esercizio dalla libreria, arricchito con un `instanceId` univoco per permetterne la gestione individuale.
    * **`biometricData`**: Array con lo storico delle misurazioni biometriche.

## 6. Dipendenze di Terze Parti
* **Marked.js & DOMPurify**: Caricate via CDN per il rendering sicuro delle ricette.
* **Chart.js**: Caricata via CDN per la visualizzazione dei grafici.
* **SortableJS**: Caricata via CDN per la gestione del drag-and-drop.
