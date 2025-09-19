# Architettura: NutriPlan v1.5

## 1. Principi Guida
* **Minimalism:** L'interfaccia utente è ridotta all'essenziale.
* **Data-Driven:** La logica di business (regole) è definita nel file JSON.
* **Frontend-Only, KISS, SRP:** L'app vive nel browser, usa Vanilla JS e ogni file ha una sola responsabilità.

## 2. Formato Dati: `planner-config.json`
Il file JSON ora richiede campi `calories_min` e `calories_max` per ogni pasto nell'array `meals`.
```json
{
  "meals": [
    {
      "id": "1",
      "nomePasto": "...",
      "calories_min": 550,
      "calories_max": 600
    }
  ]
}
```

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

## 4. Flusso di Interazione Utente
Il flusso è unificato: l'utente clicca su uno slot vuoto e un modale si apre per la selezione del pasto.

## 5. Logica di Calcolo
Una nuova funzione nel modulo `renderer.js` calcola la somma dei range calorici per ogni giorno. Viene eseguita ad ogni modifica del piano (`stateChange`) e aggiorna il DOM con i totali giornalieri.
