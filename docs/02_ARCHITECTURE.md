# Architettura: Protocollo Dinamico v1.2

## 1. Principi Guida
* **Data-Driven:** La logica di business (regole di validazione) è delegata a un file di configurazione esterno, non è hardcoded nell'applicazione.
* **Frontend-Only, KISS, SRP:** L'app vive nel browser, usa Vanilla JS e ogni file ha una sola responsabilità.

## 2. Formato Dati: `planner-config.json`
L'applicazione è guidata da un singolo file JSON con due sezioni principali:
* **`rules`**: Un array di oggetti regola. Ogni oggetto definisce un `tag`, un `type` di regola (es. `daily-block`), un `limit` e un `message` di errore.
* **`meals`**: Un array di oggetti pasto, che costituisce la libreria a disposizione dell'utente.

## 3. Struttura dei File
```
.
└── src/
    ├── api/
    │   └── configService.js
    ├── core/
    │   ├── state.js
    │   └── validation.js
    ├── ui/
    │   ├── renderer.js
    │   ├── interactions.js
    │   └── notifications.js
    └── utils/
        └── constants.js
```

## 4. Gestione dello Stato e Flusso di Rendering
Lo stato è centralizzato in `state.js`. Ogni modifica allo stato emette un evento globale `stateChange`. In `main.js`, un "event listener" cattura questo evento e invoca `renderApp()` in `renderer.js`, che legge lo stato aggiornato e ridisegna l'UI. Questo garantisce un flusso di dati unidirezionale.

## 5. Design Responsivo e Interazione Utente
L'applicazione adotta un approccio di **Progressive Enhancement**.
* **Mobile (< 768px):** Il calendario è una lista verticale. L'interazione è "tap-to-select" tramite modale.
* **Desktop (>= 768px):** Il calendario è una griglia. L'interazione è via drag & drop.

## 6. Convenzioni di Codice
* **Ordine di Definizione**: All'interno dei moduli, le funzioni "handler" (che gestiscono eventi) devono essere definite prima delle funzioni (es. `initializeEventListeners`) che le assegnano agli elementi del DOM per prevenire `ReferenceError`.
