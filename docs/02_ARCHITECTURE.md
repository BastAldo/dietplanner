# Architettura: Protocollo Dinamico v1.3

## 1. Principi Guida
* **Minimalism:** L'interfaccia utente è ridotta all'essenziale, focalizzandosi sul calendario ed eliminando elementi persistenti come la libreria dei pasti.
* **Data-Driven, Frontend-Only, KISS, SRP:** (invariati)

## 2. Formato Dati: `planner-config.json`
L'applicazione è guidata da un singolo file JSON con due sezioni principali: `rules` e `meals`.

## 3. Struttura dei File
La struttura rimane la stessa, ma il ruolo dei moduli UI cambia. `renderer.js` e `interactions.js` ora gestiscono un'unica interfaccia basata su modali, eliminando la complessità del drag & drop e della libreria.

## 4. Flusso di Interazione Utente
Il flusso primario è stato semplificato:
1. L'utente visualizza il calendario.
2. Clicca su uno slot vuoto (`Pranzo` o `Cena` di un dato giorno).
3. Si apre un modale (`#selection-modal`) contenente la lista dei pasti pertinenti (solo Pranzo o solo Cena).
4. L'utente clicca su un pasto nel modale.
5. Il modale si chiude e il calendario si aggiorna con il pasto selezionato.

## 5. Design Responsivo e Interazione Utente
L'approccio è ora unificato. L'interazione "tap/click-to-select" è la stessa per mobile e desktop. Cambia solo la visualizzazione del calendario (lista vs. griglia).
