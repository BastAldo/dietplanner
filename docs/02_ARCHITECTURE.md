# Architettura: NutriPlan v1.6

## 1. Principi Guida
* **Minimalism:** L'interfaccia è ridotta all'essenziale.
* **Data-Driven:** La logica di business è definita nel file JSON.
* **Maintainability:** I testi dell'interfaccia (stringhe) sono centralizzati in un file di costanti per facilitare future modifiche e traduzioni (i18n).
* **Frontend-Only, KISS, SRP:** L'app vive nel browser, usa Vanilla JS e ogni file ha una sola responsabilità.

## 2. Formato Dati: `planner-config.json`
Il file JSON richiede campi `calories_min` e `calories_max` per ogni pasto.

## 3. Struttura dei File
Il file `src/utils/constants.js` ora esporta anche un oggetto `UI_TEXT` contenente tutte le stringhe testuali dell'applicazione.

## 4. Flusso di Interazione Utente
Il flusso è unificato: l'utente clicca su uno slot vuoto e un modale si apre per la selezione del pasto.

## 5. Logica di Calcolo
Una funzione in `renderer.js` calcola la somma dei range calorici per ogni giorno.

## 6. Design Responsivo
* **Mobile (< 992px):** Il calendario è una lista scorrevole orizzontalmente.
* **Desktop (>= 992px):** Il calendario è una griglia a otto colonne.
