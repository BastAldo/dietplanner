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
  { id: 'muscleMass', label: 'Massa M. (kg)', type: 'number', props: 'step="0.1"' },
  { id: 'fatMass', label: 'Massa G. (kg)', type: 'number', props: 'step="0.1"' },
  { id: 'water', label: 'Acqua (kg)', type: 'number', props: 'step="0.1"' },
  { id: 'fatPercentage', label: 'Grasso (%)', type: 'number', props: 'step="0.1"' },
  { id: 'bmi', label: 'BMI', type: 'number', props: 'step="0.1"' },
  { id: 'basalMetabolism', label: 'M. Basale (kcal)', type: 'number', props: 'step="1" readonly' },
  { id: 'notes', label: 'Note', type: 'textarea' }
];

export const UI_TEXT = {
  MAIN_TITLE: 'HealtyPro',
  NAV_PLANNER: 'Planner',
  NAV_PROGRESS: 'Progressi',
  NAV_PROFILE: 'Profilo',
  LOAD_BUTTON: 'Carica',
  COPY_WEEK_BTN: 'Copia Settimana',
  RESET_BUTTON: 'Pulisci Settimana',
  BACKUP_BTN: 'Salva Backup',
  RESTORE_BTN: 'Ripristina Backup',
  CALENDAR_PLACEHOLDER: 'Carica una configurazione per visualizzare il calendario.',
  CONFIG_URL_EMPTY_ERROR: 'Per favore, inserisci un URL.',
  CONFIG_LOAD_SUCCESS: 'Configurazione caricata!',
  COPY_WEEK_CONFIRM_TITLE: 'Copia Settimana',
  COPY_WEEK_CONFIRM_MSG: 'Sei sicuro di voler sovrascrivere il piano di questa settimana con quello della settimana precedente?',
  COPY_WEEK_SUCCESS: 'Piano settimanale copiato!',
  RESET_WEEK_CONFIRM_TITLE: 'Pulisci Settimana',
  RESET_WEEK_CONFIRM_MSG: 'Sei sicuro di voler cancellare tutti i pasti da questa settimana? L\'azione è irreversibile.',
  RESET_WEEK_SUCCESS: 'Settimana pulita!',
  SHARE_NO_URL_INFO: 'Nessun URL di configurazione da condividere.',
  SHARE_SUCCESS: 'Link di condivisione copiato!',
  SHARE_ERROR: 'Impossibile copiare il link.',
  BACKUP_SHARE_TITLE: 'Backup Dati HealtyPro',
  BACKUP_SUCCESS: 'Backup salvato con successo!',
  RESTORE_CONFIRM_TITLE: 'Ripristina Backup',
  RESTORE_CONFIRM_MSG: 'Sei sicuro di voler sovrascrivere la configurazione e il piano attuali? L\'azione è irreversibile.',
  RESTORE_SUCCESS: 'Backup ripristinato con successo!',
  RESTORE_INVALID_FILE: 'File di backup non valido o corrotto.',
  LOG_VIEW_EMPTY: 'Nessun pasto pianificato per questa settimana.',
  CONFIRM_MODAL_CONFIRM_BTN: 'Conferma',
  CONFIRM_MODAL_CANCEL_BTN: 'Annulla',
  LOAD_SHARED_CONFIG_TITLE: 'Caricare Nuova Configurazione?',
  LOAD_SHARED_CONFIG_MSG: 'Hai aperto un link di condivisione. Vuoi caricare questa nuova configurazione? La libreria di pasti attuale verrà sostituita.',
  BIOMETRICS_FORM_TITLE: 'Inserisci Misurazione',
  BIOMETRICS_HISTORY_TITLE: 'Storico Misurazioni',
  BIOMETRICS_SAVE_BTN: 'Salva Dati',
  BIOMETRICS_CLEAR_BTN: 'Annulla',
  BIOMETRICS_SAVE_SUCCESS: 'Dati biometrici salvati!',
  BIOMETRICS_DELETE_CONFIRM_TITLE: 'Elimina Misurazione',
  BIOMETRICS_DELETE_CONFIRM_MSG: 'Sei sicuro di voler eliminare i dati di questa data? L\'azione è irreversibile.',
  BIOMETRICS_DELETE_SUCCESS: 'Misurazione eliminata.',
  BIOMETRICS_BMR_PLACEHOLDER: 'Completa il profilo per il calcolo',
  PROFILE_FORM_TITLE: 'Profilo Utente',
  PROFILE_SAVE_BTN: 'Salva Profilo',
  PROFILE_SAVE_SUCCESS: 'Profilo salvato con successo!',
  INFO_MODAL_TITLE: 'Formato `config.json` Richiesto',
  INFO_MODAL_DESC: 'Includi `calories_min` per ogni pasto. `calories_max` è opzionale.',
  SELECT_MEAL_TITLE: 'Scegli',
  NO_MEALS_AVAILABLE: 'Nessun pasto di questo tipo disponibile.',
  KCAL_LABEL: 'Kcal',
  EDITOR_MODAL_TITLE_PREFIX: 'Editor:',
  ADD_MEAL_BTN: 'Aggiungi',
  RECIPE_BUTTON_TITLE: 'Mostra ricetta',
  RECIPE_MODAL_LOADING: 'Caricamento ricetta...',
  RECIPE_MODAL_LOAD_ERROR: "Impossibile caricare la ricetta. Controlla l'URL e la connessione.",
  RECIPE_LOAD_FAIL_MSG: 'Caricamento ricetta fallito',
  INFO_MODAL_EXAMPLE_JSON: `{\n  "rules": [],\n  "meals": []\n}`
};