# Guida di Stile: Protocollo Dinamico v1.2

## 1. Palette Colori
```css
:root {
  --color-background: #F8F9FA; --color-surface: #FFFFFF; --color-border: #E9ECEF;
  --color-text-primary: #212529; --color-text-secondary: #6C757D;
  --color-primary: #28a745; --color-error: #dc3545; --color-warning: #ffc107;
}
```

## 2. Tipografia
* **Font Family:** `Roboto`, `sans-serif`
* **Body Text:** `16px`

## 3. Stile dei Componenti
### 3.1 Card del Pasto
* **Stato Mismatch:** Classe `.is-mismatched` con bordo giallo (`--color-warning`).
### 3.2 Pulsante di Cancellazione
* Icona (`&times;`) visibile solo al passaggio del mouse sulla card.
### 3.3 Pulsanti Filtro
* Classe `.is-active` per indicare lo stato corrente.
### 3.4 Modale di Notifica
* Classe `.is-error` per bordo rosso, `.is-success` per bordo verde.

## 4. Breakpoints e Layout Responsivo
* **Breakpoint principale:** `768px`.
* **Sotto i 768px (Mobile):** Layout a colonna singola, vista ad agenda.
* **Sopra i 768px (Desktop):** Layout a griglia a due colonne.
