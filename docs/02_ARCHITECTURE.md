# Architettura: Protocollo Dinamico v1.2

(Sezioni 1 e 2 invariate)

## 3. Struttura dei File
(invariato)

## 4. Gestione dello Stato e Flusso di Rendering
(invariato)

## 5. Design Responsivo e Interazione Utente
L'applicazione adotta un approccio di **Progressive Enhancement** basato sulla larghezza dello schermo.
* **Mobile (< 768px):**
    * **Layout:** Il calendario viene visualizzato come una lista verticale (agenda).
    * **Interazione:** Il drag & drop è disabilitato. L'aggiunta di pasti avviene tramite un'interazione "tap-to-select": il tocco su uno slot apre un modale (`#selection-modal`) per la scelta del pasto.
* **Desktop (>= 768px):**
    * **Layout:** Il calendario viene visualizzato come una griglia settimanale.
    * **Interazione:** L'aggiunta di pasti avviene tramite drag & drop dalla libreria.
