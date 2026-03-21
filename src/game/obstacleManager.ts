import { GAME_CONFIG } from './constants';
import { ObstacleEntity } from '../types/game';

let obstacleId = 1;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const createObstacle = (playAreaWidth: number, level: number): ObstacleEntity => {
  const size = randomBetween(GAME_CONFIG.obstacle.minSize, GAME_CONFIG.obstacle.maxSize);
  const paddedArea = playAreaWidth - size - GAME_CONFIG.spawn.lanePadding * 2;
  const x =
    GAME_CONFIG.spawn.lanePadding +
    Math.max(0, randomBetween(0, Math.max(0, paddedArea)));

  return {
    id: obstacleId++,
    x,
    y: -size - 8,
    width: size,
    height: size,
    speed: GAME_CONFIG.obstacle.baseSpeed + level * GAME_CONFIG.obstacle.speedStep,
  };
};

export const updateObstacles = (
  obstacles: ObstacleEntity[],
  dt: number,
  playAreaHeight: number,
): ObstacleEntity[] => {
  return obstacles
    .map((obstacle) => ({
      ...obstacle,
      y: obstacle.y + obstacle.speed * dt,
    }))
    .filter((obstacle) => obstacle.y < playAreaHeight + obstacle.height + 20);
};

export const getSpawnInterval = (level: number) => {
  return Math.max(
    GAME_CONFIG.spawn.minInterval,
    GAME_CONFIG.spawn.baseInterval - level * 0.05,
  );
};
