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
  WEEKLY_PLAN_TITLE: 'Piano Settimanale',
  CALENDAR_PLACEHOLDER: 'Carica una configurazione per visualizzare il calendario.',
  RESET_BUTTON: 'Pulisci Settimana',
  INFO_MODAL_TITLE: 'Formato `config.json` Richiesto',
  INFO_MODAL_DESC: 'Includi `calories_min` per ogni pasto. `calories_max` è opzionale.',
  SELECT_MEAL_TITLE: 'Scegli',
  FOR_DAY_PREFIX: 'per',
  NO_MEALS_AVAILABLE: 'Nessun pasto di questo tipo disponibile.',
  KCAL_LABEL: 'Kcal',
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
