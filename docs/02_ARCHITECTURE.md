# Architettura: Protocollo Dinamico v1.0

## 1. Principi Guida
* **Frontend-Only:** Nessun server, nessun backend. L'app vive interamente nel browser.
* **KISS (Keep It Simple, Stupid):** Utilizzare Vanilla JavaScript, HTML e CSS. Nessun framework.
* **SRP (Single Responsibility Principle):** Ogni funzione e ogni file deve avere una sola, chiara responsabilità.

## 2. Diagramma di Flusso (Flowchart)
Questo diagramma descrive il ciclo di vita e la logica dell'applicazione.

```mermaid
graph TD
    A[Inizio App] --> B{Controlla localStorage};
    B -- Svuota Calendario --> C[Mostra Calendario Vuoto];
    B -- Trova Piano Salvato --> D[Carica Piano da localStorage];
    D --> E{Popola Stato Applicazione};
    C --> F[Fetch 'pasti.csv' da GitHub];
    F -- Fallito --> G[Mostra Errore Caricamento];
    F -- Successo --> H[Esegui Parsing CSV];
    H --> I[Popola Lista Master dei Pasti nello Stato];
    I --> E;
    E --> J[Renderizza UI Completa];
    J --> K{Attesa Interazione Utente};

    K -- Drag & Drop Pasto --> L[Evento 'drop' su Slot Calendario];
    L --> M{Pasto contiene 'contiene-soia'?};
    M -- Sì --> N{Controlla altro pasto soia nel giorno};
    N -- No --> O[Aggiungi Pasto allo Stato];
    N -- Sì --> P[Annulla operazione / Mostra notifica];
    M -- No --> O;

    K -- Click 'Reset' --> Q[Svuota Piano nello Stato];
    K -- Click 'Pasto Libero' --> R[Aggiorna flag Pasto nello Stato];

    O --> S[Salva Stato in localStorage];
    Q --> S;
    R --> S;
    S --> J;
```

## 3. Struttura dei File
La struttura dei file è progettata per la massima modularità e leggibilità.

```
.
├── index.html              # Entry point dell'applicazione
├── style.css               # Stili globali e dei componenti
└── src/
    ├── main.js             # File principale, inizializza l'app
    ├── api/
    │   └── mealService.js  # Funzione per fetch e parsing del CSV
    ├── core/
    │   ├── state.js        # Gestione dello stato centrale dell'app
    │   └── validation.js   # Logica per la regola della soia
    ├── ui/
    │   ├── calendar.js     # Funzioni per renderizzare e aggiornare la griglia
    │   ├── library.js      # Funzioni per renderizzare la libreria dei pasti
    │   └── interactions.js # Gestione degli eventi (drag & drop, clicks)
    └── utils/
        └── constants.js    # Costanti come l'URL del CSV e le chiavi del localStorage
```

## 4. Gestione dello Stato
L'intero stato dell'applicazione sarà gestito da un singolo oggetto JavaScript in `src/core/state.js`.

**Struttura dello Stato Iniziale:**
```javascript
{
  // Lista di tutti i pasti caricati dal CSV
  masterMealList: [],
  // Oggetto che mappa gli slot del calendario ai pasti pianificati
  // Esempio: { 'lunedi-pranzo': mealId_1, 'martedi-cena': mealId_2, ... }
  weeklyPlan: {},
  // Stato dei filtri UI
  uiFilters: {
    type: 'all' // 'pranzo', 'cena'
  }
}
```
Ogni funzione che modifica lo stato (es. `addMealToPlan`, `clearPlan`) dovrà essere definita in `state.js` e dovrà essere l'unica a poter mutare questo oggetto. Dopo ogni modifica, verrà emesso un evento custom per notificare all'UI di ri-renderizzarsi.
