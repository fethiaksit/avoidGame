export type GameStatus = 'menu' | 'playing' | 'gameOver';

export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerEntity {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export interface ObstacleEntity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface GameSnapshot {
  playerX: number;
  obstacles: ObstacleEntity[];
  score: number;
  level: number;
  isPaused: boolean;
}
