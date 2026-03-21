import { CharacterSkinKey } from '../game/characters';

export type GameStatus = 'menu' | 'playing' | 'gameOver';

export type EnemyType = 'normal' | 'zigzag' | 'wall';

export type CharacterUnlockMap = Record<CharacterSkinKey, boolean>;

export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerEntity {
  x: number;
  y: number;
  size: number;
  speed: number;
  targetX: number;
}

export interface ObstacleEntity {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  age: number;
  baseX?: number;
  zigzagAmplitude?: number;
  zigzagFrequency?: number;
}

export interface PowerUpEntity {
  id: number;
  type: 'shield';
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface GoldEntity {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

export interface GameSnapshot {
  playerX: number;
  obstacles: ObstacleEntity[];
  powerUps: PowerUpEntity[];
  goldItems: GoldEntity[];
  score: number;
  level: number;
  isPaused: boolean;
  shields: number;
  earnedGold: number;
}
