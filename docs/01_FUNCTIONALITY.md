# Funzionalità: HealtyPro (ex NutriPlan)

## 1. Visione Generale
Una web app frontend-only, installabile (PWA), per creare e gestire piani alimentari flessibili per l'intera giornata (colazione, spuntini, pranzo e cena) con conteggio calorico dinamico e regole di validazione personalizzate.

L'interfaccia utente è stata completamente rinnovata per adottare un design system unificato (ispirato a MTP), con un tema scuro, componenti moderni e un flusso di interazione migliorato per la pianificazione giornaliera.

## 2. User Stories
* **US-1 (Caricamento Dati Legacy):** L'utente può caricare una configurazione da un file `pasti.json` remoto. Questo metodo è mantenuto per la condivisione di piani personali e per il ripristino da backup.
* **US-2 (Visualizzazione Calendario):** L'utente vede un calendario settimanale "day-centric". Ogni giorno è una card che riassume le informazioni principali (es. calorie totali).
* **US-3 (Pianificazione via Modale):** L'utente clicca su una card del giorno per aprire un modale di editing centralizzato, dove può gestire tutti i pasti di quella giornata.
* **US-4 (Validazione Dinamica):** L'utente vuole che l'app applichi le regole definite nel `pasti.json` (es. blocco giornaliero per un certo tag).
* **US-11 (Cancellazione Pasti):** L'utente può rimuovere un pasto inserito.
* **US-15 (Layout Mobile Leggibile):** Su mobile, il calendario è una lista di card giornaliere.
* **US-16 (Conteggio Calorie Flessibile):** L'utente vede il totale calorico per ogni giorno. Le calorie vengono calcolate dinamicamente dall'applicazione basandosi sui dati del file `ingredienti.json`.
* **US-17 (Installazione):** Come utente, voglio poter installare l'app sulla mia home screen o desktop per un accesso rapido.
* **US-18 (Uso Offline):** Come utente, voglio poter aprire e usare l'app anche senza connessione internet, dopo averla visitata la prima volta.
* **US-19 (Chiusura Modale Esterna):** Come utente, voglio poter chiudere qualsiasi modale cliccando sull'area scura esterna ad esso, per un'interazione più rapida.
* **US-20 (Registro Pasti Settimanale Dettagliato):** Come utente, voglio poter passare a una vista registro per vedere l'elenco di tutti i pasti pianificati, con il dettaglio calorico per singolo pasto e il totale giornaliero.
* **US-21 (Copia Settimana):** Come utente, voglio poter copiare il piano alimentare della settimana precedente a quella attuale con un solo click per velocizzare la pianificazione.
* **US-22 (Visualizzazione Ricetta):** Come utente, voglio poter visualizzare la ricetta di un pasto, se disponibile.
* **US-23 (Condivisione Configurazione Sicura):** Come utente, voglio poter generare un link per condividere il mio `pasti.json`.
* **US-24 (Backup Dati Locale Flessibile):** Come utente, voglio poter salvare un backup dei miei dati come file di testo (`.txt`).
* **US-25 (Ripristino da Backup Locale):** Come utente, voglio poter caricare un file di backup (`.txt` o `.json`) precedentemente salvato.
* **US-26 (Inserimento Dati Biometrici):** Come utente, voglio poter inserire e modificare le mie misurazioni biometriche.
* **US-27 (Visualizzazione Storico Biometrico):** Come utente, voglio poter visualizzare lo storico delle mie misurazioni biometriche.
* **US-29 (Profilo Utente):** L'utente può inserire e salvare i suoi dati personali.
* **US-30 (Navigazione Principale):** L'utente può navigare tra le sezioni principali tramite un menu.
* **US-31 (Calcolo Automatico BMR):** L'applicazione calcola automaticamente il Metabolismo Basale (BMR) dell'utente.
* **US-32 (Galleria Ricette):** L'utente può accedere a una pagina che elenca tutti i pasti con ricette disponibili.
* **US-33 (Dashboard Grafici):** Come utente, voglio poter accedere a una dashboard di grafici per analizzare i miei dati.

## 3. Ecosistema di Contenuti

* **US-34 (Scoperta Pacchetti):** Come utente, voglio accedere a una sezione "Esplora" che mi mostri una galleria di pacchetti di contenuti (piani alimentari, programmi di allenamento) curati, con titoli, descrizioni, immagini e tag per aiutarmi a scegliere.
* **US-35 (Importazione Intelligente):** Come utente, quando trovo un pacchetto che mi interessa, voglio poterlo aggiungere alla mia libreria con un click. L'importazione deve aggiungere solo i nuovi contenuti (pasti, ingredienti, esercizi) senza sovrascrivere o cancellare quelli che ho già creato.
* **US-36 (Accesso ai Dettagli del Protocollo):** Come utente, per i pacchetti che lo prevedono, voglio poter leggere un documento di "protocollo" (`protocol.md`) che mi spieghi la filosofia, le regole e le strategie del piano alimentare o di allenamento.
* **US-37 (Visualizzazione Obiettivi Macro):** Come utente, voglio poter vedere una sintesi degli obiettivi nutrizionali di un piano alimentare (es. range calorico, target proteico) direttamente nella card di anteprima nella sezione "Esplora".

## 4. Funzionalità Future (TODO)

* **US-38 (Configurazione Macro):** Come utente, voglio poter definire Proteine, Carboidrati e Grassi per 100g quando creo o modifico un ingrediente nella Libreria.
* **US-39 (Calcolo Macro):** Come utente, voglio che l'applicazione calcoli automaticamente i totali dei macronutrienti (min/max) per ogni pasto che creo e per ogni giorno nel mio planner.
* **US-40 (Visualizzazione Macro):** Come utente, voglio vedere i totali P/C/F nel mio "Today Widget", nelle card del calendario, nel "Log Dettagliato" e nel modale di riepilogo dell'editor pasti.
