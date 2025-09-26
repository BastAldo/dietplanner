export const DEFAULT_CONFIG_URL = '';
export const LOCAL_STORAGE_KEY_PLAN = 'dynamicProtocolPlan';
export const LOCAL_STORAGE_KEY_URL = 'dynamicConfigUrl';
export const LOCAL_STORAGE_KEY_BIOMETRICS = 'healtyproBiometricData';
export const LOCAL_STORAGE_KEY_PROFILE = 'healtyproUserProfile';
export const WEEK_STARTS_ON_MONDAY = 1;
export const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
export const MEAL_TYPES = [ 'Colazione', 'Spuntino Mattutino', 'Pranzo', 'Spuntino Pomeridiano', 'Cena' ];

export const PROFILE_FIELDS = [
  { id: 'firstName', label: 'Nome', type: 'text' },
  { id: 'lastName', label: 'Cognome', type: 'text' },
  { id: 'nickname', label: 'Nickname', type: 'text' },
  { id: 'dateOfBirth', label: 'Data di Nascita', type: 'date' },
  { id: 'height', label: 'Altezza (cm)', type: 'number', props: 'min="1"' },
  { id: 'gender', label: 'Sesso Biologico', type: 'radio', options: [{value: 'male', label: 'Uomo'}, {value: 'female', label: 'Donna'}] }
];

export const BIOMETRIC_FIELDS = [
  { id: 'date', label: 'Data', type: 'date', props: 'required' },
  { id: 'weight', label: 'Peso (kg)', type: 'number', props: 'step="0.1" required' },
  { id: 'muscleMass', label: 'M. M. (kg)', type: 'number', props: 'step="0.1"' },
  { id: 'fatMass', label: 'Massa G. (kg)', type: 'number', props: 'step="0.1"' },
  { id: 'water', label: 'Acqua (kg)', type: 'number', props: 'step="0.1"' },
  { id: 'fatPercentage', label: 'Grasso (%)', type: 'number', props: 'step="0.1"' },
  { id: 'bmi', label: 'BMI', type: 'number', props: 'step="0.1"' },
  { id: 'basalMetabolism', label: 'M. Basale (kcal)', type: 'number', props: 'step="1" readonly' },
  { id: 'notes', label: 'Note', type: 'textarea' }
];

const UI_TEXT_CONFIG = [
  { id: 'MAIN_TITLE', text: 'HealtyPro' },
  { id: 'NAV_PLANNER', text: 'Planner' },
  { id: 'NAV_PROGRESS', text: 'Progressi' },
  { id: 'NAV_CHARTS', text: 'Grafici' },
  { id: 'NAV_PROFILE', text: 'Profilo' },
  { id: 'LOAD_BUTTON', text: 'Carica' },
  { id: 'COPY_WEEK_BTN', text: 'Copia Settimana' },
  { id: 'RESET_BUTTON', text: 'Pulisci Settimana' },
  { id: 'BACKUP_BTN', text: 'Salva Backup' },
  { id: 'RESTORE_BTN', text: 'Ripristina Backup' },
  { id: 'CALENDAR_PLACEHOLDER', text: 'Carica una configurazione per visualizzare il calendario.' },
  { id: 'CONFIG_URL_EMPTY_ERROR', text: 'Per favore, inserisci un URL.' },
  { id: 'CONFIG_LOAD_SUCCESS', text: 'Configurazione caricata!' },
  { id: 'COPY_WEEK_CONFIRM_TITLE', text: 'Copia Settimana' },
  { id: 'COPY_WEEK_CONFIRM_MSG', text: 'Sei sicuro di voler sovrascrivere il piano di questa settimana con quello della settimana precedente?' },
  { id: 'COPY_WEEK_SUCCESS', text: 'Piano settimanale copiato!' },
  { id: 'RESET_WEEK_CONFIRM_TITLE', text: 'Pulisci Settimana' },
  { id: 'RESET_WEEK_CONFIRM_MSG', text: 'Sei sicuro di voler cancellare tutti i pasti da questa settimana? L\'azione è irreversibile.' },
  { id: 'RESET_WEEK_SUCCESS', text: 'Settimana pulita!' },
  { id: 'SHARE_NO_URL_INFO', text: 'Nessun URL di configurazione da condividere.' },
  { id: 'SHARE_SUCCESS', text: 'Link di condivisione copiato!' },
  { id: 'SHARE_ERROR', text: 'Impossibile copiare il link.' },
  { id: 'BACKUP_SHARE_TITLE', text: 'Backup Dati HealtyPro' },
  { id: 'BACKUP_SUCCESS', text: 'Backup salvato con successo!' },
  { id: 'RESTORE_CONFIRM_TITLE', text: 'Ripristina Backup' },
  { id: 'RESTORE_CONFIRM_MSG', text: 'Sei sicuro di voler sovrascrivere la configurazione e il piano attuali? L\'azione è irreversibile.' },
  { id: 'RESTORE_SUCCESS', text: 'Backup ripristinato con successo!' },
  { id: 'RESTORE_INVALID_FILE', text: 'File di backup non valido o corrotto.' },
  { id: 'LOG_VIEW_EMPTY', text: 'Nessun pasto pianificato per questa settimana.' },
  { id: 'CONFIRM_MODAL_CONFIRM_BTN', text: 'Conferma' },
  { id: 'CONFIRM_MODAL_CANCEL_BTN', text: 'Annulla' },
  { id: 'LOAD_SHARED_CONFIG_TITLE', text: 'Caricare Nuova Configurazione?' },
  { id: 'LOAD_SHARED_CONFIG_MSG', text: 'Hai aperto un link di condivisione. Vuoi caricare questa nuova configurazione? La libreria di pasti attuale verrà sostituita.' },
  { id: 'BIOMETRICS_FORM_TITLE', text: 'Inserisci Misurazione' },
  { id: 'BIOMETRICS_HISTORY_TITLE', text: 'Storico Misurazioni' },
  { id: 'BIOMETRICS_SAVE_BTN', text: 'Salva Dati' },
  { id: 'BIOMETRICS_CLEAR_BTN', text: 'Annulla' },
  { id: 'BIOMETRICS_SAVE_SUCCESS', text: 'Dati biometrici salvati!' },
  { id: 'BIOMETRICS_DELETE_CONFIRM_TITLE', text: 'Elimina Misurazione' },
  { id: 'BIOMETRICS_DELETE_CONFIRM_MSG', text: 'Sei sicuro di voler eliminare i dati di questa data? L\'azione è irreversibile.' },
  { id: 'BIOMETRICS_DELETE_SUCCESS', text: 'Misurazione eliminata.' },
  { id: 'BIOMETRICS_BMR_PLACEHOLDER', text: 'Completa il profilo per il calcolo' },
  { id: 'BIOMETRICS_EMPTY_LIST', text: 'Nessuna misurazione ancora registrata.' },
  { id: 'PROFILE_FORM_TITLE', text: 'Profilo Utente' },
  { id: 'PROFILE_SAVE_BTN', text: 'Salva Profilo' },
  { id: 'PROFILE_SAVE_SUCCESS', text: 'Profilo salvato con successo!' },
  { id: 'INFO_MODAL_TITLE', text: 'Formato `config.json` Richiesto' },
  { id: 'INFO_MODAL_DESC', text: 'Includi `calories_min` per ogni pasto. `calories_max` è opzionale.' },
  { id: 'SELECT_MEAL_TITLE', text: 'Scegli' },
  { id: 'NO_MEALS_AVAILABLE', text: 'Nessun pasto di questo tipo disponibile.' },
  { id: 'KCAL_LABEL', text: 'Kcal' },
  { id: 'EDITOR_MODAL_TITLE_PREFIX', text: 'Editor:' },
  { id: 'ADD_MEAL_BTN', text: 'Aggiungi' },
  { id: 'RECIPE_BUTTON_TITLE', text: 'Mostra ricetta' },
  { id: 'RECIPE_MODAL_LOADING', text: 'Caricamento ricetta...' },
  { id: 'RECIPE_MODAL_LOAD_ERROR', text: 'Impossibile caricare la ricetta. Controlla l\'URL e la connessione.' },
  { id: 'RECIPE_LOAD_FAIL_MSG', text: 'Caricamento ricetta fallito' },
  { id: 'INFO_MODAL_EXAMPLE_JSON', text: '{\n  "rules": [],\n  "meals": []\n}' },
  { id: 'CHARTS_TITLE', text: 'Dashboard Grafici' },
  { id: 'PLANNER_CHART_TITLE', text: 'Riepilogo Calorie Settimanali' },
  { id: 'BIOMETRICS_CHART_TITLE', text: 'Andamento Dati Biometrici' },
  { id: 'BIOMETRICS_CHART_EMPTY', text: 'Inserisci almeno due misurazioni per visualizzare il grafico.' }
];

export const UI_TEXT = UI_TEXT_CONFIG.reduce((acc, { id, text }) => {
  acc[id] = text;
  return acc;
}, {});
