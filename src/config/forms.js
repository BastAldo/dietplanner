export const PROFILE_FIELDS = [
  { id: 'firstName', label: 'Nome', type: 'text' },
  { id: 'lastName', label: 'Cognome', type: 'text' },
  { id: 'nickname', label: 'Nickname', type: 'text' },
  { id: 'dateOfBirth', label: 'Data di Nascita', type: 'date' },
  { id: 'height', label: 'Altezza (cm)', type: 'number', props: 'min="1"' },
  { id: 'gender', label: 'Sesso Biologico', type: 'radio', options: [{value: 'male', label: 'Uomo'}, {value: 'female', label: 'Donna'}] },
  {
    id: 'plannerPrefs',
    label: 'Preferenze Planner',
    type: 'checkbox-group',
    options: [
      { id: 'enablePreWorkout', label: 'Attiva slot Pre-Workout' },
      { id: 'enablePostWorkout', label: 'Attiva slot Post-Workout' },
      { id: 'enablePreNanna', label: 'Attiva slot Pre-Nanna' },
    ]
  }
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

export const INGREDIENT_FIELDS = [
  { id: 'id', label: 'ID Univoco', type: 'text', props: 'required' },
  { id: 'nome', label: 'Nome', type: 'text', props: 'required' },
  { id: 'kcal_per_100g', label: 'Kcal / 100g', type: 'number', props: 'required min="0"' },
  { id: 'g_per_pezzo', label: 'Grammi per pezzo (opzionale)', type: 'number', props: 'min="0"' },
  { id: 'prot_per_100g', label: 'Proteine / 100g', type: 'number', props: 'min="0"' },
  { id: 'carb_per_100g', label: 'Carboidrati / 100g', type: 'number', props: 'min="0"' },
  { id: 'fat_per_100g', label: 'Grassi / 100g', type: 'number', props: 'min="0"' }
];

export const EXERCISE_FIELDS = [
  { id: 'id', label: 'EXERCISE_FIELD_ID', type: 'text', props: 'required', grid: '1 / -1' },
  { id: 'name', label: 'EXERCISE_FIELD_NAME', type: 'text', props: 'required', grid: '1 / -1' },
  { id: 'description', label: 'EXERCISE_FIELD_DESC', type: 'textarea', grid: '1 / -1' },
  { id: 'met_value', label: 'EXERCISE_FIELD_MET', type: 'number', props: 'min="0" step="0.1"', grid: '1 / -1' },
  {
    id: 'execution_mode',
    label: 'EXERCISE_FIELD_MODE',
    type: 'select',
    grid: '1 / -1',
    options: [
      { value: 'guided_tempo', label: 'EXERCISE_FIELD_MODE_GUIDED_TEMPO' },
      { value: 'guided_static', label: 'EXERCISE_FIELD_MODE_GUIDED_STATIC' },
      { value: 'logging', label: 'EXERCISE_FIELD_MODE_LOGGING' }
    ]
  },
  { id: 'defaultSets', label: 'EXERCISE_FIELD_SETS', type: 'number', props: 'min="1"', group: 'common-group' },
  { id: 'defaultRest', label: 'EXERCISE_FIELD_REST', type: 'number', props: 'min="0"', group: 'common-group' },
  { id: 'defaultWeight', label: 'EXERCISE_FIELD_WEIGHT', type: 'number', props: 'min="0" step="0.5"', group: 'common-group' },
  { id: 'defaultReps', label: 'EXERCISE_FIELD_REPS', type: 'number', props: 'min="1"', group: 'guided_tempo' },
  { id: 'defaultDuration', label: 'EXERCISE_FIELD_DURATION', type: 'number', props: 'min="1"', group: 'guided_static' },
  { id: 'defaultRepsMin', label: 'EXERCISE_FIELD_REPS_MIN', type: 'number', props: 'min="1"', group: 'logging' },
  { id: 'defaultRepsMax', label: 'EXERCISE_FIELD_REPS_MAX', type: 'number', props: 'min="1"', group: 'logging' },
  { id: 'defaultTempo.up', label: 'EXERCISE_FIELD_TEMPO_UP', type: 'number', props: 'min="0" step="0.5"', group: 'tempo' },
  { id: 'defaultTempo.hold', label: 'EXERCISE_FIELD_TEMPO_HOLD', type: 'number', props: 'min="0" step="0.5"', group: 'tempo' },
  { id: 'defaultTempo.down', label: 'EXERCISE_FIELD_TEMPO_DOWN', type: 'number', props: 'min="0" step="0.5"', group: 'tempo' }
];
