# Architettura: Protocollo Dinamico v1.1

## 1. Principi Guida
* **Data-Driven:** La logica di business (regole di validazione) è delegata a un file di configurazione esterno, non è hardcoded nell'applicazione.
* **Frontend-Only, KISS, SRP:** (invariati)

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
    │   ├── renderer.js     # Modulo di rendering puro
    │   ├── interactions.js
    │   └── notifications.js
    └── utils/
        └── constants.js
```

## 4. Gestione dello Stato e Flusso di Rendering
Lo stato è centralizzato in `state.js`. Ogni modifica allo stato (es. `setPlannerConfig`, `updateWeeklyPlan`) non modifica direttamente il DOM, ma emette un evento globale `stateChange` chiamando la funzione `notify()`.

In `main.js`, un singolo "event listener" è in ascolto di `stateChange`. Quando l'evento viene catturato, questo listener invoca la funzione principale `renderApp()` in `renderer.js`, la quale legge lo stato aggiornato tramite `getState()` e ridisegna l'intera interfaccia. Questo garantisce un flusso di dati unidirezionale e prevedibile (Stato -> Evento -> UI).

## 5. Design Responsivo
(invariato)
