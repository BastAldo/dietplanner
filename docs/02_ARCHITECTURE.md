# Architettura: HealtyPro (ex NutriPlan)

## 1. Principi Guida
* **PWA-First:** L'applicazione è progettata per essere installabile e funzionare offline.
* **Minimalism & Simplicity (KISS):** L'interfaccia utente è stata ridisegnata per essere essenziale e intuitiva. La base di codice sottostante rimane semplice e basata su Vanilla JS.
* **Data-Driven:** La logica di business (regole, pasti) è definita nel file JSON di configurazione.
* **Maintainability (SRP):** I testi dell'interfaccia (stringhe) sono centralizzati e ogni file ha una sola responsabilità.

## 2. Architettura SPA Multi-Vista
L'applicazione è una **Single Page Application (SPA)** strutturata in viste che emulano pagine separate per una migliore organizzazione. Un singolo file `index.html` contiene i contenitori per ogni vista, e la logica in `renderer.js` gestisce la visualizzazione della vista attiva in base allo stato `currentView`. Le viste principali sono:
* **Planner**: Contiene la gestione della configurazione, il calendario e il registro dei pasti.
* **Progressi**: Dedicata all'inserimento e alla visualizzazione dei dati biometrici.
* **Profilo**: Permette all'utente di inserire i propri dati anagrafici.

## 3. Architettura PWA
L'applicazione include due componenti chiave per la funzionalità PWA:
* **`manifest.json`**: Fornisce i metadati per l'installazione (nome, icone, colori).
* **`sw.js` (Service Worker)**: Mette in cache i file statici dell'app ("app shell") per abilitare il funzionamento offline.

## 4. Logica di Business (`src/core/calculations.js`)
Le logiche di calcolo complesse, come il calcolo dell'età e del Metabolismo Basale (BMR) tramite la formula Mifflin-St Jeor, sono isolate in un modulo dedicato per mantenere il codice pulito e testabile.

## 5. Strutture Dati Chiave
L'applicazione si basa su tre strutture dati principali salvate nel `localStorage`.

### 5.1. `userProfile`
Un oggetto che contiene i dati anagrafici dell'utente.
* **Esempio Oggetto:**
  ```json
  {
    "firstName": "Mario",
    "lastName": "Rossi",
    "dateOfBirth": "1988-05-20",
    "height": 180,
    "gender": "male"
  }
  ```

### 5.2. `weeklyPlan`
Questa struttura contiene i pasti pianificati dall'utente. Viene salvata una copia completa dell'oggetto pasto per garantire la resilienza dei dati.

### 5.3. `biometricData`
Un array che contiene lo storico delle misurazioni biometriche dell'utente.

## 6. Dipendenze di Terze Parti
* **Marked.js & DOMPurify**: Caricate via CDN per il rendering sicuro delle ricette da Markdown.
