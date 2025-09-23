# Architettura: HealtyPro (ex NutriPlan)

## 1. Principi Guida
* **PWA-First:** L'applicazione è progettata per essere installabile e funzionare offline.
* **Minimalism & Simplicity (KISS):** L'interfaccia utente è stata ridisegnata per essere essenziale e intuitiva. La base di codice sottostante rimane semplice e basata su Vanilla JS.
* **Data-Driven:** La logica di business (regole, pasti) è definita nel file JSON di configurazione.
* **Maintainability (SRP):** I testi dell'interfaccia (stringhe) sono centralizzati e ogni file ha una sola responsabilità.

## 2. Architettura PWA
L'applicazione include due componenti chiave per la funzionalità PWA:
* **`manifest.json`**: Fornisce i metadati per l'installazione (nome, icone, colori).
* **`sw.js` (Service Worker)**: Mette in cache i file statici dell'app ("app shell") per abilitare il funzionamento offline.

## 3. Refactoring dell'Interfaccia Utente (UI/UX)
L'architettura logica (core/state.js, api/configService.js) rimane invariata per semplicità e robustezza. Lo strato di presentazione (`index.html`, `style.css`, `ui/renderer.js`) è stato invece oggetto di un refactoring completo per adottare un nuovo design system. Questo disaccoppia la logica dal suo aspetto visivo, permettendo future evoluzioni senza intaccare il nucleo funzionale.

## 4. Formato Dati: `planner-config.json`
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

## 5. Struttura dei File (Invariata)
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
