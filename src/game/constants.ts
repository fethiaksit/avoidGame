export const GAME_COLORS = {
  background: '#0b1220',
  player: '#60a5fa',
  obstacle: '#f87171',
  zigzagObstacle: '#fb923c',
  shieldPowerUp: '#facc15',
  gold: '#fbbf24',
  shieldAura: '#93c5fd',
  text: '#e5e7eb',
  mutedText: '#9ca3af',
  accent: '#34d399',
  panel: '#111827',
};

export const GAME_CONFIG = {
  economy: {
    reviveCost: 10,
  },
  revive: {
    invulnerabilitySeconds: 1.5,
  },
  player: {
    size: 64,
    bottomOffset: 80,
    speed: 1180,
    smoothing: 24,
  },
  obstacle: {
    minSize: 70,
    maxSize: 90,
    baseSpeed: 150,
    speedStep: 26,
    speedRampPerSecond: 4,
    maxSpeedMultiplier: 2.55,
    zigzagAmplitudeMin: 22,
    zigzagAmplitudeMax: 56,
    zigzagFrequencyMin: 3.8,
    zigzagFrequencyMax: 5.8,
    zigzagStartChance: 0.1,
    zigzagChanceRampPerSecond: 0.015,
    zigzagMaxChance: 0.55,
  },
  powerUp: {
    size: 24,
    baseSpeed: 138,
    spawnChancePerSecond: 0.07,
    maxOnScreen: 1,
  },
  gold: {
    size: 30,
    baseSpeed: 146,
    spawnChancePerSecond: 0.5,
    maxOnScreen: 3,
  },
  spawn: {
    baseInterval: 0.74,
    minInterval: 0.24,
    intervalRampPerSecond: 0.015,
    lanePadding: 10,
    maxOnScreen: 8,
  },
  difficulty: {
    intervalSeconds: 12,
    maxLevel: 12,
  },
};
