# Funzionalità: Protocollo Dinamico v1.3

## 1. Visione Generale
Una web app frontend-only, responsiva, che permette a un utente di pianificare il proprio protocollo alimentare settimanale caricando una configurazione JSON che include sia i pasti sia le regole di validazione personalizzate. L'interfaccia è minimale e centrata sul calendario.

## 2. User Stories (Cosa l'utente può fare)
* **US-1 (Caricamento Dati):** Come utente, voglio poter caricare una configurazione da un file JSON remoto.
* **US-2 (Visualizzazione Calendario):** Come utente, voglio vedere una griglia chiara del calendario come interfaccia principale.
* **US-3 (Pianificazione via Modale):** Come utente, voglio poter cliccare su uno slot vuoto del calendario per aprire un modale e selezionare un pasto da una lista.
* **US-4 (Validazione Dinamica):** Come utente, voglio che l'app applichi le regole definite nel JSON quando pianifico i pasti.
* **US-5 (Persistenza):** Come utente, voglio che il mio piano settimanale e l'URL del JSON vengano salvati automaticamente.
* **US-11 (Cancellazione Pasti):** Come utente, voglio poter rimuovere facilmente un pasto che ho inserito nel calendario.
* **US-15 (Layout Mobile Leggibile):** Come utente mobile, voglio che il calendario si visualizzi come una griglia compatta (due giorni per riga).
* (Le User Story relative alla libreria e al drag-and-drop sono state rimosse in favore di un workflow unificato)
