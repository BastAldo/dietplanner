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

export const INGREDIENT_FIELDS = [
  { id: 'id', label: 'ID Univoco', type: 'text', props: 'required' },
  { id: 'nome', label: 'Nome', type: 'text', props: 'required' },
  { id: 'kcal_per_100g', label: 'Kcal / 100g', type: 'number', props: 'required min="0"' },
  { id: 'g_per_pezzo', label: 'Grammi per pezzo (opzionale)', type: 'number', props: 'min="0"' }
];
