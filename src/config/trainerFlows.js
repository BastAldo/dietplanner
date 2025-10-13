export const INTRO_FLOW = [
  { "type": "speech", "text_key": "VOICE_GUIDE_NOW_STARTING", "text_value": "name", "await": true }
];

export const TEMPO_GUIDED_FLOW = [
  { "type": "speech", "text_key": "VOICE_GUIDE_SET_START", "await": true },
  {
    "type": "loop",
    "target": "defaultReps",
    "actions": [
      { "type": "speech", "text_key": "VOICE_GUIDE_PHASE_UP" },
      { "type": "movement", "phase": "pre-up", "duration_ms": 700 },
      { "type": "movement", "phase": "up", "duration_from": "defaultTempo.up" },
      { "type": "audio", "cue": "tick" },
      {
        "type": "conditional",
        "condition": "defaultTempo.hold > 0",
        "actions": [
          { "type": "speech", "text_key": "VOICE_GUIDE_PHASE_HOLD" },
          { "type": "movement", "phase": "pre-hold", "duration_ms": 700 },
          { "type": "movement", "phase": "hold", "duration_from": "defaultTempo.hold" },
          { "type": "audio", "cue": "tick" }
        ]
      },
      { "type": "speech", "text_key": "VOICE_GUIDE_PHASE_DOWN" },
      { "type": "movement", "phase": "pre-down", "duration_ms": 700 },
      { "type": "movement", "phase": "down", "duration_from": "defaultTempo.down" },
      { "type": "audio", "cue": "tick" }
    ]
  },
  { "type": "set_completed" }
];

export const REST_FLOW = [
    { "type": "speech", "text_key": "VOICE_GUIDE_REST_START", "await": true },
    { "type": "rest", "duration_from": "defaultRest" }
];

export const NEXT_EXERCISE_ANNOUNCEMENT_FLOW = [
  { "type": "speech", "text_key": "VOICE_GUIDE_NEXT_EXERCISE", "text_value": "name", "await": true }
];

export const FINAL_FLOW = [
  { "type": "speech", "text_key": "VOICE_GUIDE_WORKOUT_COMPLETED", "await": true }
];
