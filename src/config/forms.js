export const PROFILE_FIELDS = [
  { id: 'firstName', label: 'PROFILE_FIELD_FIRSTNAME', type: 'text' },
  { id: 'lastName', label: 'PROFILE_FIELD_LASTNAME', type: 'text' },
  { id: 'nickname', label: 'PROFILE_FIELD_NICKNAME', type: 'text' },
  { id: 'dateOfBirth', label: 'PROFILE_FIELD_DOB', type: 'date' },
  { id: 'height', label: 'PROFILE_FIELD_HEIGHT', type: 'number', props: 'min="1"' },
  { id: 'gender', label: 'PROFILE_FIELD_GENDER', type: 'radio', options: [{value: 'male', label: 'PROFILE_FIELD_GENDER_MALE'}, {value: 'female', label: 'PROFILE_FIELD_GENDER_FEMALE'}] },
  {
    id: 'plannerPrefs',
    label: 'PROFILE_FIELD_PREFS',
    type: 'checkbox-group',
    options: [
      { id: 'enablePreWorkout', label: 'PROFILE_FIELD_PREFS_PRE_WORKOUT' },
      { id: 'enablePostWorkout', label: 'PROFILE_FIELD_PREFS_POST_WORKOUT' },
      { id: 'enablePreNanna', label: 'PROFILE_FIELD_PREFS_PRE_NANNA' },
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
  { id: 'id', label: 'INGREDIENT_FIELD_ID', type: 'text', props: 'required' },
  { id: 'nome', label: 'INGREDIENT_FIELD_NAME', type: 'text', props: 'required' },
  { id: 'kcal_per_100g', label: 'INGREDIENT_FIELD_KCAL', type: 'number', props: 'required min="0"' },
  { id: 'g_per_pezzo', label: 'INGREDIENT_FIELD_G_PER_PIECE', type: 'number', props: 'min="0"' },
  { id: 'prot_per_100g', label: 'INGREDIENT_FIELD_PROT', type: 'number', props: 'min="0"' },
  { id: 'carb_per_100g', label: 'INGREDIENT_FIELD_CARB', type: 'number', props: 'min="0"' },
  { id: 'fat_per_100g', label: 'INGREDIENT_FIELD_FAT', type: 'number', props: 'min="0"' }
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
