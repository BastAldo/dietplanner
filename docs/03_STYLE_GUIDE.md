# Guida di Stile: Protocollo Dinamico v1.1
## 1. Palette Colori
(invariato)
## 2. Tipografia
(invariato)
## 3. Stile dei Componenti
### 3.1 Card del Pasto
* **Stato Mismatch:** Aggiunta di una classe `.is-mismatched` che applica un bordo giallo (`--color-warning`) per segnalare un'incongruenza tra tipo di pasto e slot.
### 3.2 Pulsante di Cancellazione
* Un'icona (`&times;`) posizionata nell'angolo in alto a destra della card pasto nel calendario.
* Visibile solo al passaggio del mouse sulla card per non affollare l'interfaccia.
### 3.3 Pulsanti Filtro
* Un gruppo di pulsanti sopra la libreria.
* Il filtro attivo ha uno stile distinto (`.is-active`) per indicare lo stato corrente.
### 3.4 Modale di Notifica
* **Overlay:** Sfondo semi-trasparente che copre l'intera pagina.
* **Contenitore:** Box centrato con angoli smussati e ombra leggera.
* **Stato Errore:** Bordo o icona di colore rosso (es. `#dc3545`).
* **Stato Successo:** Bordo o icona di colore verde (`--color-primary`).

## 4. Breakpoints e Layout Responsivo
(invariato)
