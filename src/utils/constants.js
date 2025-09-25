export const DEFAULT_CONFIG_URL = '';
export const LOCAL_STORAGE_KEY_PLAN = 'dynamicProtocolPlan';
export const LOCAL_STORAGE_KEY_URL = 'dynamicConfigUrl';
export const WEEK_STARTS_ON_MONDAY = 1;
export const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
export const MEAL_TYPES = [
  'Colazione',
  'Spuntino Mattutino',
  'Pranzo',
  'Spuntino Pomeridiano',
  'Cena'
];

export const UI_TEXT = {
  MAIN_TITLE: 'NutriPlan',
  SUBTITLE: 'Crea e gestisci piani alimentari flessibili. Carica la tua configurazione e inizia.',
  LOAD_BUTTON: 'Carica',
  COPY_WEEK_BTN: 'Copia Precedente',
  SHARE_CONFIG_BTN: 'Condividi Config',
  WEEKLY_PLAN_TITLE: 'Piano Settimanale',
  CALENDAR_PLACEHOLDER: 'Carica una configurazione per visualizzare il calendario.',
  RESET_BUTTON: 'Pulisci Settimana',
  INFO_MODAL_TITLE: 'Formato `config.json` Richiesto',
  INFO_MODAL_DESC: 'Includi `calories_min` per ogni pasto. `calories_max` è opzionale.',
  SELECT_MEAL_TITLE: 'Scegli',
  NO_MEALS_AVAILABLE: 'Nessun pasto di questo tipo disponibile.',
  KCAL_LABEL: 'Kcal',
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
  EDITOR_MODAL_TITLE_PREFIX: 'Editor:',
  ADD_MEAL_BTN: 'Aggiungi',
  RECIPE_BUTTON_TITLE: 'Mostra ricetta',
  RECIPE_MODAL_LOADING: 'Caricamento ricetta...',
  RECIPE_MODAL_LOAD_ERROR: "Impossibile caricare la ricetta. Controlla l'URL e la connessione.",
  RECIPE_LOAD_FAIL_MSG: 'Caricamento ricetta fallito',
  LOG_VIEW_EMPTY: 'Nessun pasto pianificato per questa settimana.',
  CONFIRM_MODAL_CONFIRM_BTN: 'Conferma',
  CONFIRM_MODAL_CANCEL_BTN: 'Annulla',
  LOAD_SHARED_CONFIG_TITLE: 'Caricare Nuova Configurazione?',
  LOAD_SHARED_CONFIG_MSG: 'Hai aperto un link di condivisione. Vuoi caricare questa nuova configurazione? La libreria di pasti attuale verrà sostituita.',
  INFO_MODAL_EXAMPLE_JSON:
`{
  "rules": [
    {
      "tag": "contiene-soia",
      "type": "daily-block",
      "limit": 1,
      "message": "Non più di 1 pasto con soia al giorno."
    }
  ],
  "meals": [
    { 
      "id": "1", 
      "tipoPasto": "Pranzo", 
      "calories_min": 550, 
      "calories_max": 600, 
      "etichette": ["contiene-soia"] 
    },
    { 
      "id": "2", 
      "tipoPasto": "Cena", 
      "calories_min": 300 
    }
  ]
}`
};
