# Funzionalità: Protocollo Dinamico v1.0

## 1. Visione Generale
Una web app frontend-only che permette a un utente di pianificare il proprio protocollo alimentare settimanale trascinando pasti predefiniti da una libreria a un calendario, con logiche di validazione in tempo reale.

## 2. User Stories (Cosa l'utente può fare)

* **US-1 (Caricamento Dati):** Come utente, al primo avvio, voglio che l'app carichi automaticamente l'elenco completo dei pasti da una fonte dati remota (CSV), in modo da avere sempre la versione più aggiornata.
* **US-2 (Visualizzazione):** Come utente, voglio vedere una griglia chiara del calendario settimanale (Lunedì-Domenica) e una libreria laterale con tutti i pasti disponibili, filtrabili per tipo (Pranzo, Cena).
* **US-3 (Pianificazione):** Come utente, voglio poter trascinare un pasto dalla libreria e rilasciarlo in uno slot specifico del calendario (es. "Pranzo" di Lunedì).
* **US-4 (Validazione Soia):** Come utente, quando inserisco un pasto contenente soia a pranzo, voglio che l'app mi impedisca visivamente (es. rendendolo non selezionabile) di aggiungere un altro pasto con soia a cena nello stesso giorno, per rispettare le regole del protocollo.
* **US-5 (Persistenza):** Come utente, voglio che il mio piano settimanale venga salvato automaticamente, in modo che ricaricando la pagina io possa ritrovare la mia pianificazione.
* **US-6 (Pasto Libero):** Come utente, voglio poter contrassegnare un pasto qualsiasi nel mio calendario come "Pasto Libero", per gestire le eccezioni settimanali.
* **US-7 (Reset):** Come utente, voglio un pulsante "Reset Settimana" per svuotare rapidamente tutto il calendario e ricominciare da capo.
* **US-8 (Stampa):** Come utente, voglio un pulsante "Stampa" che generi una versione pulita e stampabile del mio piano settimanale.

## 3. Mockup ASCII dell'Interfaccia

Questo mockup definisce la struttura di base dell'interfaccia.

+----------------------------------------------------+--------------------------+
|  **🗓️ Protocollo Dinamico** |  **📚 Libreria Pasti** |
|                                                    |                          |
|         LUN      MAR      MER      GIO      VEN ... |  [Filtro: Pranzo/Cena ]  |
|                                                    |                          |
| **Pranzo** [slot vuoto] [slot vuoto] [slot vuoto] ... |  +--------------------+  |
|         +------------+                              |  | draggable-pasto-1  |  |
| **Cena** | Riso+Tonno | [slot vuoto] [slot vuoto] ... |  +--------------------+  |
|         +------------+                              |  | draggable-pasto-2  |  |
|                                                    |  +--------------------+  |
|         ...etc...                                  |  | draggable-pasto-3  |  |
|                                                    |  +--------------------+  |
|                                                    |                          |
+----------------------------------------------------+--------------------------+
| [ Reset Settimana ]                           [ Stampa 🖨️ ]                  |
+------------------------------------------------------------------------------+
