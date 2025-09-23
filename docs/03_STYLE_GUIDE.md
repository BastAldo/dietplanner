# Guida di Stile: HealtyPro

## 1. Filosofia
L'interfaccia utilizza un **dark theme** per essere riposante per gli occhi. L'estetica è minimale e funzionale, con l'obiettivo di dare priorità alla chiarezza e alla leggibilità delle informazioni.

## 2. Palette Colori
L'intera UI si basa su un set di variabili CSS per garantire coerenza.

```css
:root {
    --bg-color: #1a1a1d;
    --card-color: #2c2c34;
    --primary-color: #9575cd;      /* Viola */
    --secondary-color: #4db6ac;    /* Teal */
    --text-color: #f4f4f9;
    --text-color-muted: #aaa;
    --border-color: #40404a;
    --danger-color: #ef5350;
    --success-color: #66bb6a;
}
```

## 3. Tipografia
* **Font Family:** `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`, `sans-serif`.
* **Body Text:** `16px` come dimensione di base.

## 4. Layout e Struttura
* **Header Persistente (`.app-header`):** Un header fisso in cima alla pagina garantisce un branding e una navigazione costanti.
* **Container Principale (`#app-container`):** Tutto il contenuto è avvolto in un contenitore centrato con una larghezza massima per assicurare la leggibilità su schermi grandi.

## 5. Componenti Chiave

### Card
* **Utilizzo:** Usate per le celle dei giorni del calendario (`.day-cell`) e per gli elementi nelle liste.
* **Stile:** Hanno un colore di sfondo di `--card-color`, bordi arrotondati (`8px`) e un bordo di `--border-color`.
* **Interazione:** Al passaggio del mouse, il colore del bordo cambia in `--primary-color` per fornire un feedback visivo chiaro.

### Bottoni
* **Stile Base (`.btn`):** Uno stile standardizzato con angoli arrotondati, testo in grassetto e un leggero effetto di transizione al passaggio del mouse.
* **Varianti:** Varianti di colore (`.btn-primary`, `.btn-secondary`, `.btn-danger`) sono usate per indicare lo scopo del bottone.

### Modali
* **Overlay (`.modal-overlay`):** Un overlay nero semitrasparente copre l'intera finestra quando un modale è attivo.
* **Content Box (`.modal-content`):** Una card centrata contiene il contenuto del modale, con `max-height` per gestire lo scrolling interno.
