# Architettura: Protocollo Dinamico v1.0

## 1. Principi Guida
* **Frontend-Only:** L'app vive interamente nel browser.
* **KISS (Keep It Simple, Stupid):** Vanilla JavaScript, HTML, CSS.
* **SRP (Single Responsibility Principle):** Ogni file ha una sola responsabilità.

## 2. Formato Dati
* **CSV (Semicolon-Separated):** L'applicazione utilizza file CSV con il punto e virgola (`;`) come delimitatore per garantire robustezza e compatibilità.

## 3. Diagramma di Flusso (Flowchart)
(invariato, la logica di base non cambia)

## 4. Struttura dei File
```
.
├── index.html
├── style.css
└── src/
    ├── main.js
    ├── api/
    │   └── mealService.js  # Fetch e parsing del CSV (con ';')
    ├── core/
    │   ├── state.js
    │   └── validation.js
    ├── ui/
    │   ├── calendar.js
    │   ├── library.js
    │   ├── interactions.js
    │   └── notifications.js # NUOVO: Gestione del modale di notifica
    └── utils/
        └── constants.js
```

## 5. Gestione dello Stato
(invariato)

## 6. Design Responsivo
(invariato)
