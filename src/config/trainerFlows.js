import { UI_TEXT } from './uiText.js';

export const TEMPO_GUIDED_FLOW = [
  { "type": "speech", "text_key": "VOICE_GUIDE_SET_START", "await": true },
  {
    "type": "loop",
    "target": "reps",
    "actions": [
      { "type": "speech", "text_key": "VOICE_GUIDE_PHASE_UP" },
      { "type": "movement", "phase": "pre-up", "duration_ms": 700 },
      { "type": "movement", "phase": "up", "duration_from": "tempo.up" },
      { "type": "audio", "cue": "tick" },
      {
        "type": "conditional",
        "condition": "tempo.hold > 0",
        "actions": [
          { "type": "speech", "text_key": "VOICE_GUIDE_PHASE_HOLD" },
          { "type": "movement", "phase": "pre-hold", "duration_ms": 700 },
          { "type": "movement", "phase": "hold", "duration_from": "tempo.hold" },
          { "type": "audio", "cue": "tick" }
        ]
      },
      { "type": "speech", "text_key": "VOICE_GUIDE_PHASE_DOWN" },
      { "type": "movement", "phase": "pre-down", "duration_ms": 700 },
      { "type": "movement", "phase": "down", "duration_from": "tempo.down" },
      { "type": "audio", "cue": "tick" }
    ]
  },
  { "type": "audio", "cue": "stop" }
];
