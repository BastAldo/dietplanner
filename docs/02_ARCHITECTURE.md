# Architettura: HealtyPro (ex NutriPlan)

## 1. Principi Guida
* **PWA-First:** L'applicazione è progettata per essere installabile e funzionare offline.
* **Minimalism & Simplicity (KISS):** L'interfaccia utente è stata ridisegnata per essere essenziale e intuitiva. La base di codice sottostante rimane semplice e basata su Vanilla JS.
* **Data-Driven:** La logica di business (regole, pasti) è definita nel file JSON di configurazione.
* **Maintainability (SRP):** I testi dell'interfaccia (stringhe) sono centralizzati e ogni file ha una sola responsabilità.

## 2. Architettura PWA
L'applicazione include due componenti chiave per la funzionalità PWA:
* **`manifest.json`**: Fornisce i metadati per l'installazione (nome, icone, colori).
* **`sw.js` (Service Worker)**: Mette in cache i file statici dell'app ("app shell") per abilitare il funzionamento offline. Include una logica di pulizia per le cache obsolete.

## 3. Refactoring dell'Interfaccia Utente (UI/UX)
L'architettura logica (core/state.js, api/configService.js) rimane invariata per semplicità e robustezza. Lo strato di presentazione (`index.html`, `style.css`, `ui/renderer.js`) è stato invece oggetto di un refactoring completo per adottare un nuovo design system. Questo disaccoppia la logica dal suo aspetto visivo, permettendo future evoluzioni senza intaccare il nucleo funzionale.

## 4. Formato Dati: `planner-config.json`
Il file JSON può contenere una chiave opzionale `recipeBaseUrl` al livello principale per specificare la directory base delle ricette. Ogni pasto può avere un `recipeId` per collegare una ricetta Markdown. L'URL finale sarà costruito come `recipeBaseUrl + recipeId + '.md'`.
```json
{
  "recipeBaseUrl": "[https://raw.githubusercontent.com/user/repo/main/recipes/](https://raw.githubusercontent.com/user/repo/main/recipes/)",
  "rules": [
    {
      "tag": "contiene-soia",
      "type": "daily-block",
      "limit": 1,
      "message": "Non più di 1 pasto con soia al giorno."
    }
  ],
  "meals": [
    { "id": "1", "nomePasto": "Tofu Scrambled", "tipoPasto": "Pranzo", "calories_min": 550, "recipeId": "00001", "etichette": ["contiene-soia"] },
    { "id": "2", "nomePasto": "Insalata Greca", "tipoPasto": "Cena", "calories_min": 300, "recipeId": "00002" }
  ]
}
```

## 5. Strutture Dati Chiave
L'applicazione si basa su due strutture dati principali salvate nel `localStorage` per garantire la massima resilienza dei dati.

### 5.1. `weeklyPlan`
Questa struttura contiene i pasti pianificati dall'utente. Per garantire la massima resilienza, **non vengono salvati solo gli ID dei pasti, ma una copia completa dell'intero oggetto del pasto** al momento della pianificazione.
* **Formato Chiave:** `"AAAA-MM-GG-TipoPasto"` (es. `"2025-09-22-Pranzo"`)
* **Formato Valore:** `{ "id": "1", "nomePasto": "...", ... }` (Oggetto completo del pasto)
* **Razionale:** Questo approccio di "denormalizzazione" rende il piano settimanale dell'utente auto-consistente e indipendente dal file `config.json` originale.

### 5.2. `biometricData`
Questa struttura è un array che contiene lo storico delle misurazioni biometriche dell'utente.
* **Formato:** Un array di oggetti, dove ogni oggetto rappresenta una singola misurazione.
* **Esempio Oggetto:**
  ```json
  {
    "date": "2025-09-26",
    "weight": 80.5,
    "muscleMass": 60.1,
    "fatMass": 15.2,
    "water": 55.0,
    "fatPercentage": 18.9,
    "bmi": 24.8,
    "basalMetabolism": 1800,
    "notes": "Misurazione mattutina a digiuno."
  }
  ```
* **Razionale:** Un semplice array ordinabile per data è la struttura più efficiente per memorizzare e successivamente visualizzare dati cronologici, sia in forma tabellare che grafica.

## 6. Dipendenze di Terze Parti
Per il rendering delle ricette da file Markdown, l'applicazione si affida a due librerie esterne caricate via CDN:
* **Marked.js**: Una libreria veloce e completa per il parsing di Markdown in HTML.
* **DOMPurify**: Una libreria essenziale per la sicurezza, utilizzata per sanificare l'output HTML generato da Marked.js prima di inserirlo nel DOM, prevenendo attacchi XSS.

## 7. Struttura dei File (Invariata)
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
