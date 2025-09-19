# Architettura: NutriPlan v1.6

## 1. Principi Guida
* **Minimalism:** L'interfaccia utente è ridotta all'essenziale.
* **Data-Driven:** La logica di business (regole) è definita nel file JSON.
* **Maintainability:** I testi dell'interfaccia (stringhe) sono centralizzati (i18n).
* **Frontend-Only, KISS, SRP:** L'app vive nel browser, usa Vanilla JS e ogni file ha una sola responsabilità.

## 2. Formato Dati: `planner-config.json`
Il file JSON è composto da due chiavi principali: `rules` e `meals`. `calories_max` è opzionale per i pasti.
```json
{
  "rules": [ { "tag": "...", "type": "...", "limit": 1 } ],
  "meals": [
    { "id": "1", "calories_min": 550, "calories_max": 600 },
    { "id": "2", "calories_min": 300 }
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
Una funzione in `renderer.js` calcola la somma dei range calorici per ogni giorno.

## 6. Design Responsivo
* **Mobile (< 992px):** Il calendario è una lista scorrevole orizzontalmente.
* **Desktop (>= 992px):** Il calendario è una griglia a otto colonne.
