# Architettura: Protocollo Dinamico v1.1

## 1. Principi Guida
* **Data-Driven:** La logica di business (regole di validazione) è delegata a un file di configurazione esterno, non è hardcoded nell'applicazione.
* **Frontend-Only, KISS, SRP:** (invariati)

## 2. Formato Dati: `planner-config.json`
L'applicazione è guidata da un singolo file JSON con due sezioni principali:
* **`rules`**: Un array di oggetti regola. Ogni oggetto definisce un `tag`, un `type` di regola (es. `daily-block`), un `limit` e un `message` di errore. Questo permette di definire la logica di business senza modificare il codice.
* **`meals`**: Un array di oggetti pasto, che costituisce la libreria a disposizione dell'utente.

## 3. Struttura dei File
```
.
└── src/
    ├── api/
    │   └── configService.js  # Sostituisce mealService, gestisce il JSON
    ├── core/
    │   ├── state.js        # Gestisce lo stato (inclusi filtri e regole)
    │   └── validation.js   # Motore di validazione generico basato sulle regole
    ├── ui/
    │   ├── ...
    │   └── notifications.js
    └── utils/
        └── constants.js
```

## 4. Flusso di Validazione
Quando un utente sposta un pasto, `interactions.js` chiama il motore di validazione in `validation.js`. Il motore non conosce la "soia", ma itera sull'array `rules` presente nello stato. Per ogni regola, controlla se il pasto ha il `tag` corrispondente e, in caso affermativo, applica la logica del `type` di regola (es. `daily-block`). Se una regola fallisce, il processo si interrompe e viene mostrato il `message` di errore associato.
