# Funzionalità: Protocollo Dinamico v1.2

## 1. Visione Generale
Una web app frontend-only, responsiva, che permette a un utente di pianificare il proprio protocollo alimentare settimanale caricando una configurazione JSON che include sia i pasti sia le regole di validazione personalizzate.

## 2. User Stories (Cosa l'utente può fare)
* **US-1 (Caricamento Dati):** Come utente, voglio poter caricare un elenco di pasti e un set di regole da un file di configurazione JSON remoto.
* **US-2 (Visualizzazione):** Come utente, voglio vedere una griglia chiara del calendario settimanale e una libreria laterale con tutti i pasti disponibili.
* **US-3 (Pianificazione):** Come utente, voglio poter trascinare un pasto dalla libreria e rilasciarlo in uno slot specifico del calendario.
* **US-4 (Validazione Dinamica):** Come utente, voglio che l'app applichi le regole definite nel JSON (es. blocco giornaliero per un certo tag) quando pianifico i pasti.
* **US-5 (Persistenza):** Come utente, voglio che il mio piano settimanale e l'URL del JSON vengano salvati automaticamente.
* **US-6 (Pasto Libero):** Come utente, voglio poter contrassegnare un pasto come "Libero".
* **US-7 (Reset):** Come utente, voglio un pulsante "Reset" per svuotare rapidamente il calendario.
* **US-8 (Stampa):** Come utente, voglio un pulsante "Stampa" per una versione pulita del mio piano.
* **US-9 (Data Source Configurabile):** Come utente, voglio poter inserire l'URL di un mio file JSON per caricare una configurazione personalizzata.
* **US-10 (UI Responsiva):** Come utente, voglio poter usare l'applicazione in modo efficace sia su desktop che su dispositivi mobili.
* **US-11 (Cancellazione Pasti):** Come utente, voglio poter rimuovere facilmente un pasto che ho inserito nel calendario per errore.
* **US-12 (Filtro Libreria):** Come utente, voglio poter filtrare la lista dei pasti per tipo (Pranzo/Cena) per trovare più velocemente quello che cerco.
* **US-13 (Feedback Visivo):** Come utente, voglio che l'app mi segnali con un colore diverso se inserisco un pasto di tipo "Cena" in uno slot "Pranzo" e viceversa.
* **US-14 (Interazione Mobile Nativa):** Come utente mobile, voglio poter toccare uno slot vuoto nel calendario per aprire una finestra di selezione e scegliere un pasto, invece di usare il drag & drop.
* **US-15 (Layout Mobile Leggibile):** Come utente mobile, voglio che il calendario si visualizzi come una lista verticale ("agenda") per una facile lettura e interazione sul mio dispositivo.
