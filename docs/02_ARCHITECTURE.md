# Architettura: HealtyPro (ex NutriPlan)

## 1. Principi Guida
* **PWA-First:** L'applicazione è progettata per essere installabile e funzionare offline.
* **Minimalism & Simplicity (KISS):** L'interfaccia utente è essenziale e intuitiva, basata su Vanilla JS.
* **Data-Driven & Convention over Configuration:** La logica di business è definita in file di configurazione remoti.
* **Maintainability (SRP):** Ogni modulo ha una singola, chiara responsabilità.

## 2. Architettura SPA Multi-Vista
L'applicazione è una **Single Page Application (SPA)**. Un singolo `index.html` contiene i contenitori per ogni vista, e la logica in `renderer.js` gestisce quale vista mostrare in base allo stato.

## 3. Architettura PWA
* **`manifest.json`**: Fornisce i metadati per l'installazione.
* **`sw.js` (Service Worker)**: Mette in cache l' "app shell" per il funzionamento offline.

## 4. Logica di Business

### 4.1. Caricamento Dati e Scoperta dei Contenuti

L'applicazione adotta un'architettura ibrida per il caricamento dei dati, separando la configurazione personale dalla scoperta di nuovi contenuti.

* **Configurazione Personale (Legacy)**: L'utente può ancora caricare una configurazione completa tramite un singolo URL a un file `pasti.json`.

* **Ecosistema di Scoperta (Architettura Principale)**: La sezione "Esplora" si basa su un'architettura disaccoppiata ospitata su un repository esterno (es. `BiohackerHub`):
    1.  **`explore.json`**: Un file di "curation" che contiene una semplice lista di ID dei pacchetti da mettere in evidenza.
    2.  **`package-index.json`**: Un indice generato automaticamente che mappa ogni `id` di pacchetto all'URL del suo `manifest.json`. È la fonte di verità per localizzare i contenuti.
    3.  **`manifest.json`**: Ogni pacchetto contiene un manifest auto-descrittivo con tutti i metadati (titolo, descrizione, autore, tags, immagine, obiettivi macro) e i link relativi ai file di contenuto (`pasti.json`, `protocol.md`, etc.).

Il `configService.js` orchestra questo flusso: scarica `explore.json` e `package-index.json`, recupera i `manifest.json` necessari per visualizzare le card "in evidenza", e infine importa i contenuti di un pacchetto tramite un'operazione di "merge intelligente" che non sovrascrive i dati esistenti.

### 4.2. Calcolo delle Calorie (`src/core/calorieCalculator.js`)
Questo modulo ha la sola responsabilità di calcolare le calorie dei pasti.

**(TODO):** Questo modulo sarà esteso per calcolare anche i totali dei macronutrienti (Proteine, Carboidrati, Grassi) basandosi sui nuovi campi aggiunti agli ingredienti.

## 5. Gestione dei Dati

### 5.1. Strutture Dati Chiave

* **Contenuti Remoti (BiohackerHub)**:
    * **`manifest.json`**: Descrive un singolo pacchetto. Contiene `id`, `title`, `description`, `author`, `version`, `tags`, `image`, `protocolUrl`, `pastiUrl`, `ingredientiUrl`, `eserciziUrl`, e l'oggetto opzionale `macroTargets` per i piani dietetici.
    * **`pasti.json`**: Contiene un array di `meals`.
    * **`ingredienti.json`**: Contiene un array di `ingredienti`.
      **(TODO):** La struttura di un ingrediente sarà estesa per includere:
      ```json
      {
        "id": "ingrediente_id",
        "nome": "Nome Ingrediente",
        "kcal_per_100g": 100,
        "g_per_pezzo": 50,
        "prot_per_100g": 10,
        "carb_per_100g": 20,
        "fat_per_100g": 5
      }
      ```
    * **`esercizi.json`**: Contiene un array di `esercizi`. Ogni esercizio segue una struttura dettagliata che definisce la sua esecuzione e i suoi parametri di default:
      ```json
      {
        "id": "squat_bilanciere",
        "name": "Squat con Bilanciere",
        "description": "Esercizio base per le gambe.",
        "met_value": 3.5,
        "execution_mode": "guided_tempo",
        "defaultSets": 3,
        "defaultRest": 60,
        "defaultWeight": 50,
        "defaultReps": 10,
        "defaultDuration": null,
        "defaultRepsMin": null,
        "defaultRepsMax": null,
        "defaultTempo": {
          "up": 1,
          "hold": 0,
          "down": 2
        },
        "etichette": ["gambe", "pkg:programma-base"]
      }
      ```

* **Dati Utente Locali (`localStorage`)**:
    * **`masterMealList`, `masterIngredientList`, `masterWorkoutList`**: Le librerie personali dell'utente, arricchite (ma non sovrascritte) durante l'importazione.
    * Altre strutture dati: `weeklyPlan`, `userProfile`, etc.

## 6. Svolta Futura: Protocolli Parametrici (In Standby)

Abbiamo definito una visione futura per rendere i pacchetti ancora più potenti: trasformarli in **protocolli parametrici**.

L'idea è di permettere a un pacchetto di contenere **formule e regole** che l'applicazione client può usare per calcolare le quantità ottimali in base ai dati biometrici dell'utente (peso, BMR, etc.).

Un `manifest.json` potrebbe contenere una sezione `protocolEngine` come questa:

```json
"protocolEngine": {
  "constants": {
    "PROTEIN_PER_KG": 1.9,
    "ACTIVITY_MULTIPLIER": 1.25,
    "CALORIE_DEFICIT": 400
  },
  "formulas": {
    "daily_protein_target": "${user.weight_kg} * ${constants.PROTEIN_PER_KG}"
  },
  "normalizationRules": {
    "petto_pollo": { "type": "step", "value": 50 }
  }
}
```

> **NOTA IMPORTANTE:** Lo sviluppo di questa funzionalità è **attualmente in standby**. Sebbene l'architettura sia stata delineata, la sua implementazione richiede un'ulteriore fase di progettazione approfondita. La priorità attuale è consolidare e standardizzare l'ecosistema di contenuti statici.

## 7. Dipendenze di Terze Parti
* **Marked.js & DOMPurify**: Caricate via CDN per il rendering sicuro delle ricette.
* **Chart.js**: Caricata via CDN per la visualizzazione dei grafici.
* **SortableJS**: Caricata via CDN per la gestione del drag-and-drop.
