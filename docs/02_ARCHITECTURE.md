# Architettura: NutriPlan v2.0 (PWA)

## 1. Principi Guida
* **PWA-First:** L'applicazione è progettata per essere installabile e funzionare offline.
* **Minimalism:** L'interfaccia utente è ridotta all'essenziale.
* **Data-Driven:** La logica di business (regole) è definita nel file JSON.
* **Maintainability:** I testi dell'interfaccia (stringhe) sono centralizzati (i18n).
* **Frontend-Only, KISS, SRP:** L'app vive nel browser, usa Vanilla JS e ogni file ha una sola responsabilità.

## 2. Architettura PWA
L'applicazione ora include due componenti chiave per la funzionalità PWA:
* **`manifest.json`**: Fornisce i metadati per l'installazione (nome, icone, colori).
* **`sw.js` (Service Worker)**: Uno script che viene eseguito in background. Alla prima visita (evento `install`), mette in cache i file statici dell'app ("app shell"). Alle visite successive (evento `fetch`), intercetta le richieste di rete e, se una risorsa è in cache, la fornisce direttamente dal dispositivo, abilitando il funzionamento offline. La registrazione avviene tramite un percorso relativo (`'sw.js'`) per garantire la compatibilità con deployment in sottocartelle.

## 3. Formato Dati: `planner-config.json`
Il file JSON richiede `calories_min` per ogni pasto. Il campo `calories_max` è opzionale.
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

## 4. Struttura dei File
```
.
├── index.html
├── style.css
├── manifest.json
├── sw.js
├── icon.svg
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
