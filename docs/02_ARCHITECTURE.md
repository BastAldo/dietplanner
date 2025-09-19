# Architettura: Protocollo Dinamico v1.3

## 1. Principi Guida
* **Minimalism:** L'interfaccia utente è ridotta all'essenziale, focalizzandosi sul calendario. L'interazione è unificata per tutti i dispositivi.
* **Data-Driven:** La logica di business (regole) è definita nel file di configurazione JSON.
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
Il flusso è stato unificato e semplificato per tutti i dispositivi:
1. L'utente visualizza il calendario.
2. Clicca su uno slot vuoto.
3. Si apre un modale (`#selection-modal`) contenente la lista dei pasti pertinenti (solo Pranzo o solo Cena).
4. L'utente clicca su un pasto nel modale.
5. Il modale si chiude e il calendario si aggiorna.

## 5. Design Responsivo
* **Mobile (< 992px):** Il calendario è una griglia a due colonne (due giorni per riga).
* **Desktop (>= 992px):** Il calendario è una griglia a otto colonne (header + 7 giorni).
