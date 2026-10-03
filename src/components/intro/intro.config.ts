export const INTRO_CONFIG = {
  DEBUG_INTRO: true,
  CLOSED_CURVE: "up" as "up" | "down",
  // Intro letter sequence
  LETTERS: "SOLECRAFT",
  EYE_INDEXES: [1], // The 'O' in SOLE

  // Tracking Spring physics
  SPRING_STIFFNESS: 180,
  SPRING_DAMPING: 20,

  // Fallback counter ratios (if canvas measure fails)
  // relative to the bounding box of the text 'O'
  FALLBACK_COUNTER_X: 0.5,
  FALLBACK_COUNTER_Y: 0.5,
  FALLBACK_COUNTER_WIDTH: 0.45,
  FALLBACK_COUNTER_HEIGHT: 0.65,
  
  // Iris and Glint sizes
  IRIS_RATIO: 0.45, // of counter width
  GLINT_RATIO: 0.12, // of iris diameter
  IRIS_MAX_TRAVEL_OFFSET: 4, // px offset from edge
  
  // Eye limits
  BROW_THICKNESS_RATIO: 0.12, // of stem width (approx)
  
  // Timeline (ms)
  TIMELINE: {
    MAX_FONT_WAIT: 1500,
    STAGGER: 40,
    ENTRANCE_END: 600,
    EYES_OPEN_START: 600,
    EYES_OPEN_END: 850,
    HINT_FADE_IN: 1000,
  },
  
  // Blink timing (ms)
  BLINK: {
    CLOSE: 110,
    OPEN: 160,
    MIN_INTERVAL: 1100,
    MAX_INTERVAL: 2200,
    DOUBLE_CHANCE: 0.30,
  },
  
  // Saccade / Look around loop (ms)
  IDLE_WAIT: 500,
  LOOK_HOLD_MIN: 400,
  LOOK_HOLD_MAX: 700,
  
  // Easing
  EASE_IN_OUT: [0.76, 0, 0.24, 1] as [number, number, number, number],
};
