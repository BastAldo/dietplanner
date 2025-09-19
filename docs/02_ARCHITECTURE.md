# Architettura: Protocollo Dinamico v1.4

## 1. Principi Guida
* **Minimalism:** L'interfaccia utente è ridotta all'essenziale.
* **Data-Driven:** La logica di business (regole) è definita nel file JSON.
* **Frontend-Only, KISS, SRP:** L'app vive nel browser, usa Vanilla JS e ogni file ha una sola responsabilità.

## 2. Formato Dati: `planner-config.json`
L'applicazione è guidata da un singolo file JSON con due sezioni principali: `rules` e `meals`.

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

## 5. Design Responsivo
* **Mobile (< 992px):** Il calendario è una lista di card scorrevole orizzontalmente.
* **Desktop (>= 992px):** Il calendario è una griglia a otto colonne.
