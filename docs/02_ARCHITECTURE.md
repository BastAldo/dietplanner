# Architettura: NutriPlan v1.6

## 1. Principi Guida
* **Minimalism:** L'interfaccia utente è ridotta all'essenziale.
* **Data-Driven:** La logica di business (regole) è definita nel file JSON.
* **Maintainability:** I testi dell'interfaccia (stringhe) sono centralizzati (i18n).
* **Frontend-Only, KISS, SRP:** L'app vive nel browser, usa Vanilla JS e ogni file ha una sola responsabilità.

## 2. Formato Dati: `planner-config.json`
Il file JSON richiede `calories_min` per ogni pasto. Il campo `calories_max` è opzionale: se assente, le calorie del pasto sono considerate fisse.

## 3. Logica di Calcolo
Una funzione in `renderer.js` calcola la somma dei range calorici per ogni giorno.

## 4. Design Responsivo
* **Mobile (< 992px):** Il calendario è una lista scorrevole orizzontalmente.
* **Desktop (>= 992px):** Il calendario è una griglia a otto colonne.
