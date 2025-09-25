# Funzionalità: HealtyPro (ex NutriPlan)

## 1. Visione Generale
Una web app frontend-only, installabile (PWA), per creare e gestire piani alimentari flessibili per l'intera giornata (colazione, spuntini, pranzo e cena) con conteggio calorico e regole di validazione personalizzate.

L'interfaccia utente è stata completamente rinnovata per adottare un design system unificato (ispirato a MTP), con un tema scuro, componenti moderni e un flusso di interazione migliorato per la pianificazione giornaliera.

## 2. User Stories
* **US-1 (Caricamento Dati):** L'utente può caricare una configurazione da un file JSON remoto.
* **US-2 (Visualizzazione Calendario):** L'utente vede un calendario settimanale "day-centric". Ogni giorno è una card che riassume le informazioni principali (es. calorie totali).
* **US-3 (Pianificazione via Modale):** L'utente clicca su una card del giorno per aprire un modale di editing centralizzato, dove può gestire tutti i pasti di quella giornata.
* **US-4 (Validazione Dinamica):** L'utente vuole che l'app applichi le regole definite nel JSON (es. blocco giornaliero per un certo tag).
* **US-11 (Cancellazione Pasti):** L'utente può rimuovere un pasto inserito.
* **US-15 (Layout Mobile Leggibile):** Su mobile, il calendario è una lista di card giornaliere.
* **US-16 (Conteggio Calorie Flessibile):** L'utente vede il totale calorico per ogni giorno direttamente sulla card del calendario.
* **US-17 (Installazione):** Come utente, voglio poter installare l'app sulla mia home screen o desktop per un accesso rapido.
* **US-18 (Uso Offline):** Come utente, voglio poter aprire e usare l'app anche senza connessione internet, dopo averla visitata la prima volta.
* **US-19 (Chiusura Modale Esterna):** Come utente, voglio poter chiudere qualsiasi modale cliccando sull'area scura esterna ad esso, per un'interazione più rapida.
* **US-20 (Registro Pasti Settimanale Dettagliato):** Come utente, voglio poter passare a una vista registro per vedere l'elenco di tutti i pasti pianificati, con il dettaglio calorico per singolo pasto e il totale giornaliero.
* **US-21 (Copia Settimana):** Come utente, voglio poter copiare il piano alimentare della settimana precedente a quella attuale con un solo click per velocizzare la pianificazione.
* **US-22 (Visualizzazione Ricetta):** Come utente, voglio poter visualizzare la ricetta di un pasto, se disponibile, cliccando su un'icona presente sia nell'editor del giorno che nella vista registro.
* **US-23 (Condivisione Configurazione):** Come utente, voglio poter generare un link univoco che contenga l'URL della mia configurazione `config.json` per condividerla facilmente con altri.
