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
### 4.1. Workout Builder Composizionale e Dichiarativo
A differenza di un approccio a piani fissi, HealtyPro adotta un modello composizionale. L'utente costruisce la propria sessione di allenamento giorno per giorno aggiungendo esercizi individuali da una libreria.

L'architettura del trainer si basa su un principio **dichiarativo**: l'intero flusso di un allenamento, inclusi esercizi, serie, ripetizioni, annunci vocali e periodi di riposo, viene pre-compilato in una singola coda di comandi immutabile (`fullExecutionQueue`) prima dell'inizio della sessione. Il modulo `queueBuilder` agisce come un assemblatore, utilizzando dei "flussi" template (`trainerFlows.js`) per ogni parte dell'allenamento. Questo garantisce che l'esecutore (`runWorkoutLoop`) sia un semplice interprete, aumentando la robustezza e la prevedibilità del sistema.

### 4.2. Modalità di Esecuzione e Ciclo di Ripetizione (Vista Trainer)
La Vista Trainer opera in diverse modalità a seconda delle proprietà dell'esercizio caricato. Questo garantisce un'esperienza utente flessibile e adatta a diversi tipi di allenamento. La modalità viene scelta in base a un campo `execution_mode` nell'oggetto dell'esercizio.

#### Modalità 1: `tempo_guided` (Default)
Per garantire un'esperienza utente guidata e prevenire movimenti affrettati, il modulo Trainer implementa un ciclo di esecuzione dettagliato per ogni singola ripetizione di un esercizio basato sul `tempo`. Questo ciclo viene "compilato" nella coda di esecuzione usando un template specifico (`TEMPO_GUIDED_FLOW`). Ogni ripetizione è suddivisa in fasi, come la fase concentrica (`up`), isometrica (`hold`) ed eccentrica (`down`), intervallate da annunci vocali e piccoli intervalli per la preparazione.

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

## 7. Strategia di Sviluppo e Debug
Per garantire la manutenibilità e facilitare il troubleshooting, l'applicazione integra un sistema di logging sistematico.

### 7.1. Modalità Debug (`debugMode`)
* Lo stato globale in `src/core/state.js` contiene un flag `debugMode`, impostato di default su `false`.
* Questo flag può essere attivato o disattivato in qualsiasi momento tramite la console del browser, eseguendo la funzione globale `toggleDebugMode()`. Questo permette di attivare i log solo quando necessario, senza impattare le performance in produzione.

### 7.2. Logger Centralizzato (`src/utils/logger.js`)
* Tutta la logica di logging è centralizzata in un unico modulo. La sua funzione `log()` è l'unico punto di accesso per scrivere messaggi in console.
* Questa funzione controlla internamente lo stato di `debugMode` e scrive in console solo se è attivo.

### 7.3. Convenzioni di Logging
Per garantire coerenza e leggibilità, tutti i messaggi di log seguono una convenzione standard:
```javascript
log('NomeComponente', 'Azione che sta avvenendo', { datiRilevanti });
```
* **`NomeComponente`**: Indica il modulo di origine (es. 'State', 'Modals', 'Trainer', 'API_SERVICE').
* **`Azione`**: Descrive l'operazione in corso (es. 'Setting new view', 'Opening modal').
* **`datiRilevanti`**: Un oggetto opzionale che mostra il contesto e i dati relativi all'azione.

### 7.4. Gestione Errori Robusta nel Caricamento Dati
Il `configService` adotta una strategia di parsing in due fasi per migliorare il debug degli errori di caricamento dei file di configurazione (`pasti.json`, `ingredienti.json`, etc.).
1.  La risposta della `fetch` viene prima letta come testo (`response.text()`).
2.  Il testo viene poi esplicitamente parsato all'interno di un blocco `try...catch`.

Questo approccio permette di:
* **Notificare l'utente** con un messaggio di errore generico e pulito (es. "Errore nel formato di un file di configurazione") senza esporre dettagli tecnici.
* **Fornire allo sviluppatore**, se `debugMode` è attiva, un log dettagliato in console che include l'URL del file che ha causato l'errore e un estratto del contenuto non valido, semplificando enormemente il processo di troubleshooting.
