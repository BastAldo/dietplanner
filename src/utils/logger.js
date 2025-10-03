import { getState } from '../core/state.js';

/**
 * Scrive un messaggio di log in console solo se la modalità debug è attiva.
 * @param {string} source - Il nome del modulo/componente da cui proviene il log (es. "Trainer").
 * @param {string} message - Il messaggio da loggare.
 * @param {...any} data - Dati aggiuntivi da includere nel log.
 */
export function log(source, message, ...data) {
    const { debugMode } = getState();
    if (debugMode) {
        const style = 'font-weight: bold; color: #9575cd;';
        if (data.length > 0) {
            console.log(`%c[${source}]%c ${message}`, style, '', ...data);
        } else {
            console.log(`%c[${source}]%c ${message}`, style, '');
        }
    }
}
