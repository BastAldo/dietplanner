# Guida di Stile: Protocollo Dinamico v1.4 (Dark Mode)

## 1. Palette Colori
```css
:root {
  --color-background: #121212;
  --color-surface: #1E1E1E;
  --color-border: #2E2E2E;
  --color-text-primary: #EAEAEA;
  --color-text-secondary: #8E8E8E;
  --color-primary: #28a745;
  --color-error: #cf6679;
  --color-warning: #ffc107;
}
```

## 2. Tipografia
* **Font Family:** `Roboto`, `sans-serif`
* **Body Text:** `16px`

## 3. Stile dei Componenti
Tutti i componenti sono stilizzati per un tema scuro, usando le variabili definite nella palette. Le card usano `--color-surface` come sfondo e i testi usano `--color-text-primary` e `--color-text-secondary`.

## 4. Breakpoints e Layout Mobile
* **Breakpoint principale:** `992px`.
* **Mobile (< 992px):** Layout a slide orizzontale per il calendario.
