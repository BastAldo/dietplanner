# Funzionalità: HealtyPro (ex NutriPlan)

## 1. Visione Generale
Una web app frontend-only, installabile (PWA), per creare e gestire piani alimentari flessibili per l'intera giornata (colazione, spuntini, pranzo e cena) con conteggio calorico dinamico e regole di validazione personalizzate.

L'interfaccia utente è stata completamente rinnovata per adottare un design system unificato (ispirato a MTP), con un tema scuro, componenti moderni e un flusso di interazione migliorato per la pianificazione giornaliera.

## 2. User Stories
* **US-1 (Caricamento Dati):** L'utente può caricare una configurazione da un file `pasti.json` remoto. L'applicazione si aspetta di trovare, nella stessa directory, un file complementare chiamato `ingredienti.json`.
* **US-2 (Visualizzazione Calendario):** L'utente vede un calendario settimanale "day-centric". Ogni giorno è una card che riassume le informazioni principali (es. calorie totali).
* **US-3 (Pianificazione via Modale):** L'utente clicca su una card del giorno per aprire un modale di editing centralizzato, dove può gestire tutti i pasti di quella giornata.
* **US-4 (Validazione Dinamica):** L'utente vuole che l'app applichi le regole definite nel `pasti.json` (es. blocco giornaliero per un certo tag).
* **US-11 (Cancellazione Pasti):** L'utente può rimuovere un pasto inserito.
* **US-15 (Layout Mobile Leggibile):** Su mobile, il calendario è una lista di card giornaliere.
* **US-16 (Conteggio Calorie Flessibile):** L'utente vede il totale calorico per ogni giorno. Le calorie vengono calcolate dinamicamente dall'applicazione basandosi sui dati del file `ingredienti.json`. Il sistema è in grado di calcolare le calorie anche per ingredienti misurati in "pezzi" (es. `quantita_pezzi: 1`), a condizione che nel file `ingredienti.json` sia specificato il peso medio per pezzo tramite il campo opzionale `g_per_pezzo`.
* **US-17 (Installazione):** Come utente, voglio poter installare l'app sulla mia home screen o desktop per un accesso rapido.
* **US-18 (Uso Offline):** Come utente, voglio poter aprire e usare l'app anche senza connessione internet, dopo averla visitata la prima volta.
* **US-19 (Chiusura Modale Esterna):** Come utente, voglio poter chiudere qualsiasi modale cliccando sull'area scura esterna ad esso, per un'interazione più rapida.
* **US-20 (Registro Pasti Settimanale Dettagliato):** Come utente, voglio poter passare a una vista registro per vedere l'elenco di tutti i pasti pianificati, con il dettaglio calorico per singolo pasto e il totale giornaliero.
* **US-21 (Copia Settimana):** Come utente, voglio poter copiare il piano alimentare della settimana precedente a quella attuale con un solo click per velocizzare la pianificazione.
* **US-22 (Visualizzazione Ricetta):** Come utente, voglio poter visualizzare la ricetta di un pasto, se disponibile. L'URL della ricetta viene derivato automaticamente dal percorso del file di configurazione, cercando i file in una sottocartella `ricette/`.
* **US-23 (Condivisione Configurazione Sicura):** Come utente, voglio poter generare un link per condividere il mio `pasti.json`. All'apertura del link, se la configurazione è diversa da quella in uso, l'app mi chiederà conferma prima di caricarla per evitare perdite di dati.
* **US-24 (Backup Dati Locale Flessibile):** Come utente, voglio poter salvare un backup dei miei dati come file di testo (`.txt`) utilizzando, dove supportato, la funzione di condivisione nativa del mio dispositivo.
* **US-25 (Ripristino da Backup Locale):** Come utente, voglio poter caricare un file di backup (`.txt` o `.json`) precedentemente salvato per ripristinare il mio `configUrl` e il mio `weeklyPlan`, con una richiesta di conferma prima di sovrascrivere i dati esistenti.
* **US-26 (Inserimento Dati Biometrici):** Come utente, voglio poter inserire e modificare le mie misurazioni biometriche (peso, massa grassa, etc.) per una data specifica tramite un form dedicato.
* **US-27 (Visualizzazione Storico Biometrico):** Come utente, voglio poter visualizzare lo storico delle mie misurazioni biometriche come una lista di card.
* **US-29 (Profilo Utente):** L'utente può inserire e salvare i suoi dati personali (nome, data di nascita, altezza, sesso) in una pagina dedicata.
* **US-30 (Navigazione Principale):** L'utente può navigare tra le sezioni Planner, Progressi e Profilo tramite un menu principale nell'header.
* **US-31 (Calcolo Automatico BMR):** L'applicazione calcola automaticamente il Metabolismo Basale (BMR) dell'utente utilizzando la formula Mifflin-St Jeor, basandosi sui dati del profilo e sull'ultimo peso inserito.
