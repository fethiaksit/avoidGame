export const GAME_COLORS = {
  background: '#0b1220',
  player: '#60a5fa',
  obstacle: '#f87171',
  text: '#e5e7eb',
  mutedText: '#9ca3af',
  accent: '#34d399',
  panel: '#111827',
};

export const GAME_CONFIG = {
  player: {
    size: 34,
    bottomOffset: 48,
    speed: 420,
  },
  obstacle: {
    minSize: 26,
    maxSize: 54,
    baseSpeed: 130,
    speedStep: 22,
  },
  spawn: {
    baseInterval: 0.85,
    minInterval: 0.35,
    lanePadding: 10,
    maxOnScreen: 8,
  },
  difficulty: {
    intervalSeconds: 12,
    maxLevel: 12,
  },
};
