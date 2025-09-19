# Guida di Stile: Protocollo Dinamico v1.2
(Sezioni 1-3 invariate)
## 4. Breakpoints e Layout Responsivo
* **Breakpoint principale:** `768px`.
* **Sotto i 768px (Mobile):**
    * Layout a colonna singola.
    * `#calendar-grid` usa `display: flex` con `flex-direction: column` per creare una vista ad agenda.
* **Sopra i 768px (Desktop):**
    * Layout a griglia con due colonne.
