# Progetto HealtyPro: Specifiche di Integrazione e Sviluppo

**Obiettivo**: Questo documento definisce la visione e il piano di sviluppo per `HealtyPro`, un'applicazione nata dalla fusione concettuale di `NutriPlan` e `Mio Trainer Personale` (MTP). Funge da unica fonte di verità per la prossima fase di sviluppo.

## 1. Analisi dell'Applicazione di Riferimento (MTP)

Questa sezione analizza l'applicazione MTP basandosi esclusivamente sulla sua documentazione per estrarne i concetti di design e di flusso utente (UX) che intendiamo adottare.

### 1.1. Funzionalità Core (Cosa Fa)

L'applicazione MTP è una SPA (Single Page Application) progettata per gestire il ciclo di vita di un allenamento attraverso tre viste principali:

* **Vista Calendario**: Una dashboard principale con una griglia settimanale. Ogni cella-giorno riassume gli esercizi programmati e permette di avviare l'allenamento.
* **Vista Trainer Interattivo**: Un'interfaccia che guida l'utente in tempo reale attraverso l'allenamento, con timer visivi e controlli di flusso (start/pausa/termina).
* **Vista Debriefing**: Una schermata di riepilogo che appare alla fine dell'allenamento e mostra un report dettagliato di ciò che è stato completato, interrotto o saltato.
* **Sistema di Modali**: L'editing degli allenamenti avviene tramite un modale che permette di aggiungere esercizi da una libreria e di riordinare gli item della sessione con drag-and-drop.

### 1.2. Flusso Utente e Architettura Concettuale (Come lo Fa)

Il flusso utente di MTP è **"day-centric"** (incentrato sul giorno), il che lo rende molto intuitivo:

1.  **Visione d'Insieme**: L'utente sceglie un giorno dal calendario.
2.  **Editing Centralizzato**: Modifica l'intero piano di quel giorno in un unico modale.
3.  **Esecuzione**: Avvia la sessione che viene eseguita passo dopo passo.
4.  **Revisione**: Analizza il riepilogo finale.

L'architettura si basa su un principio chiave per garantire la stabilità: il **Piano di Esecuzione Pre-compilato**. Prima che l'allenamento inizi, il sistema genera una semplice lista sequenziale di tutti i passaggi (esercizio, riposo, annuncio). Il modulo Trainer si limita a scorrere questa lista, eliminando la necessità di logiche complesse durante l'esecuzione.

### 1.3. Sistema Visivo e Schermate (La Grafica)

L'interfaccia di MTP è progettata con una filosofia **"mobile-first"** e un **tema scuro**, minimale e funzionale.

* **Palette Colori**: I colori primari sono un viola (`--primary-color: #9575cd`) e un verde acqua (`--secondary-color: #4db6ac`) su uno sfondo scuro (`--bg-color: #1a1a1d`).
* **Componenti**: L'UI è basata su "card" con angoli arrotondati per tutti gli elementi interattivi (celle del calendario, item nei modali).
* **Schermate Principali (ASCII Mockup)**:

    * **Calendario**: Una griglia responsive con navigazione settimanale.
        ```plaintext
        +------------------------------------------------------+
        |  < Precedente    Settimana: 22 - 28 Luglio   Successiva >  |
        +------------------------------------------------------+
        | +----------+  +----------+  +----------+  +----------+ |
        | | LUN 22   |  | MAR 23   |  | MER 24   |  | GIO 25   | |
        | | Kcal: 2100|  | Kcal: 1850|  |          |  |          | |
        | +----------+  +----------+  +----------+  +----------+ |
        | +----------+  +----------+  +----------+               |
        | | VEN 26   |  | SAB 27   |  | DOM 28   |               |
        | |          |  | Kcal: 2200|  |          |               |
        | +----------+  +----------+  +----------+               |
        +------------------------------------------------------+
        ```
    * **Editor del Giorno (Modale)**: Un unico pannello per gestire tutti i pasti del giorno.
        ```plaintext
        +------------------------------------------------------+
        |  Editor Piano Alimentare - 23 Luglio            [X]  |
        |------------------------------------------------------|
        |  - Colazione:   [ Aggiungi pasto ]                   |
        |  - Spuntino M:   [ Aggiungi pasto ]                   |
        |  - Pranzo:      Pollo e Riso       (Modifica/Rimuovi) |
        |  - Spuntino P:   Yogurt Greco       (Modifica/Rimuovi) |
        |  - Cena:        [ Aggiungi pasto ]                   |
        |                                                      |
        +------------------------------------------------------+
        ```

---

## 2. Piano di Sviluppo per HealtyPro (Cosa e Come Faremo)

Questa sezione definisce come implementeremo i concetti di MTP all'interno della base di codice di `NutriPlan`.

### 2.1. Visione del Prodotto

`HealtyPro` sarà un'unica applicazione che unisce la pianificazione alimentare di `NutriPlan` con la filosofia di interazione di MTP. L'obiettivo è un'esperienza utente coesa, semplice e moderna.

### 2.2. Principi Guida (La Nostra Filosofia)

1.  **La Semplicità è la Chiave**: Manterremo la base di codice di `NutriPlan` (`state.js`, `renderer.js`, ecc.) come nostra architettura. È semplice, funzionale e testata. Non importeremo alcuna logica o file `.js` da MTP.
2.  **Ispirazione, non Copia**: Adotteremo solo i *concetti visivi e di flusso* di MTP descritti sopra, implementandoli con il nostro codice pulito.
3.  **Documentazione come Guida**: Questo documento sarà il nostro riferimento. Ogni fase di sviluppo dovrà essere allineata a quanto qui descritto.

### 2.3. Action Plan Dettagliato

#### Fase 1: Rinnovamento Visivo e Strutturale (L'Aspetto)

* **Azione**: Sostituire il contenuto di `index.html` e `style.css` di `NutriPlan`.
* **Dettagli**:
    * `index.html` adotta la struttura con header fisso e container principale, mantenendo tutti gli `id` esistenti richiesti dagli script.
    * `style.css` è stato completamente riscritto usando la palette colori e gli stili dei componenti definiti nella guida di stile.
* **Fix Critico - Service Worker**: Il `CACHE_NAME` in `sw.js` è stato aggiornato e un evento `activate` è stato aggiunto per garantire l'aggiornamento della cache e la pulizia delle versioni vecchie.

#### Fase 2: Refactoring del Calendario (La Vista Principale)

* **Azione**: Riscrivere la logica di rendering in `src/ui/renderer.js` e aggiornare le interazioni.
* **Dettagli**:
    * La funzione `renderApp` disegna una griglia di 7 "day-cell" cliccabili che mostrano nome del giorno, data e totale calorico.
    * È stata implementata la navigazione settimanale (settimana precedente/successiva) aggiornando lo stato `focusedDate`.

#### Fase 3: Implementazione del Modale "Editor del Giorno" (L'Interazione Core)

* **Azione**: Creare la logica per un modale di editing centralizzato con auto-aggiornamento.
* **Dettagli**:
    * Il click su una "day-cell" apre il modale "Editor del Giorno".
    * Questo modale mostra tutti gli slot pasto per quel giorno (`Colazione`, `Pranzo`, `Cena`, ecc.).
    * L'utente clicca su "Aggiungi" per chiudere l'editor e aprire un secondo modale per la selezione del pasto.
    * Una volta che un pasto viene selezionato o rimosso, l'Editor del Giorno si riapre e/o si aggiorna automaticamente per mostrare lo stato corrente, fornendo un feedback immediato e coerente.

#### Fase 4 (Futura): Integrazione Funzionalità Workout

* **Azione**: Aggiungere la logica per la gestione degli allenamenti all'interno dello stesso flusso.
* **Dettagli**: L'Editor del Giorno verrà esteso per permettere l'aggiunta di esercizi. La vista calendario mostrerà un riepilogo sia delle calorie che degli esercizi. Questo unificherà completamente le due anime dell'applicazione.
