# Guida di Stile: Protocollo Dinamico v1.0

## 1. Palette Colori
La palette è pensata per essere pulita, fresca e professionale, con un richiamo al mondo del cibo e della salute. Useremo variabili CSS per una facile gestione.

```css
:root {
  /* Sfondi e Superfici */
  --color-background: #F8F9FA; /* Grigio molto chiaro */
  --color-surface: #FFFFFF;    /* Bianco puro per le card */
  --color-border: #E9ECEF;    /* Bordo sottile e neutro */

  /* Testo */
  --color-text-primary: #212529;   /* Nero quasi puro */
  --color-text-secondary: #6C757D; /* Grigio per testo secondario */

  /* Colori Primari e d'Accento */
  --color-primary: #28a745;        /* Verde successo/salute */
  --color-accent: #007BFF;         /* Blu per interazioni e link */
  --color-warning: #FFC107;        /* Giallo per il "Pasto Libero" */
  --color-disabled: #CED4DA;       /* Grigio per elementi disattivati */
}
```

## 2. Tipografia
Useremo un font sans-serif pulito e leggibile, importato da Google Fonts.

* **Font Family:** `Roboto`, `sans-serif`
* **Body Text:** `16px`, `font-weight: 400`
* **Titoli (H1, H2):** `font-weight: 700`
* **Nomi dei Pasti:** `font-weight: 500`

## 3. Stile dei Componenti

### Card del Pasto (in Libreria e Calendario)
* **Stato Default:** `background-color: var(--color-surface);`, `border: 1px solid var(--color-border);`, `border-radius: 8px;`, `box-shadow: 0 2px 4px rgba(0,0,0,0.05);`, `cursor: grab;`
* **Stato Hover:** Leggero ingrandimento (`transform: scale(1.03);`) e ombra più marcata.
* **Stato Dragging:** Opacità ridotta (`opacity: 0.8;`), ombra più evidente.
* **Stato Disabilitato (Regola Soia):** `background-color: var(--color-disabled);`, `opacity: 0.6;`, `cursor: not-allowed;`

### Slot del Calendario
* **Stato Vuoto:** Bordo tratteggiato (`border: 2px dashed var(--color-border);`).
* **Stato "Droppable" (quando si sta trascinando sopra):** Sfondo evidenziato (`background-color: #E2F5E6;` - un verde molto chiaro).

### Pulsanti
* **Pulsante Primario (Stampa):** `background-color: var(--color-primary);`, `color: white;`
* **Pulsante Secondario (Reset):** `background-color: transparent;`, `color: var(--color-text-secondary);`, `border: 1px solid var(--color-border);`

## 4. Breakpoints e Layout Responsivo
* **Breakpoint principale:** `768px`.
* **Sotto i 768px:** Layout a colonna singola. Il `.main-container` usa `display: flex` con `flex-direction: column`.
* **Sopra i 768px:** Layout a griglia (`display: grid`) con due colonne (`3fr 1fr`).
