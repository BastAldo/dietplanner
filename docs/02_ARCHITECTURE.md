# Architettura: NutriPlan v1.7

## 1. Principi Guida
* **Minimalism:** L'interfaccia utente è ridotta all'essenziale.
* **Data-Driven:** La logica di business (regole) è definita nel file JSON.
* **Maintainability:** I testi dell'interfaccia sono centralizzati (i18n).
* **Frontend-Only, KISS, SRP:** L'app vive nel browser, usa Vanilla JS e ogni file ha una sola responsabilità.

## 2. Formato Dati: `planner-config.json`
Il file JSON è composto da due chiavi principali: `rules` e `meals`. `calories_max` è opzionale per i pasti.
```json
{
  "rules": [
    {
      "tag": "contiene-soia",
      "type": "daily-block",
      "limit": 1,
      "message": "Non più di 1 pasto con soia al giorno."
    }
  ],
  "meals": [
    { "id": "1", "tipoPasto": "Pranzo", "calories_min": 550, "calories_max": 600, "etichette": ["contiene-soia"] },
    { "id": "2", "tipoPasto": "Cena", "calories_min": 300 }
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
La funzione di calcolo delle calorie ora itera su tutti i tipi di pasto definiti in `MEAL_TYPES`.

## 6. Design Responsivo
* **Mobile (< 992px):** Il calendario è una lista scorrevole orizzontalmente.
* **Desktop (>= 992px):** Il calendario è una griglia a otto colonne.
