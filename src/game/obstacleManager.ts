import { GAME_CONFIG } from './constants';
import { GoldEntity, ObstacleEntity, PowerUpEntity } from '../types/game';

let obstacleId = 1;
let powerUpId = 1;
let goldId = 1;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const getEnemySpeed = (level: number, elapsed: number) => {
  const baseSpeed = GAME_CONFIG.obstacle.baseSpeed + level * GAME_CONFIG.obstacle.speedStep;
  const rampedSpeed = baseSpeed + elapsed * GAME_CONFIG.obstacle.speedRampPerSecond;
  const maxSpeed = baseSpeed * GAME_CONFIG.obstacle.maxSpeedMultiplier;

  return Math.min(maxSpeed, rampedSpeed);
};

const getZigzagSpawnChance = (elapsed: number) => {
  return Math.min(
    GAME_CONFIG.obstacle.zigzagMaxChance,
    GAME_CONFIG.obstacle.zigzagStartChance + elapsed * GAME_CONFIG.obstacle.zigzagChanceRampPerSecond,
  );
};

const getObstacleColliderInset = (type: ObstacleEntity['type']) => {
  if (type === 'zigzag') {
    return { x: 0.24, y: 0.2 };
  }

  return { x: 0.2, y: 0.12 };
};

export const createObstacle = (
  playAreaWidth: number,
  level: number,
  elapsed: number,
): ObstacleEntity => {
  const size = randomBetween(GAME_CONFIG.obstacle.minSize, GAME_CONFIG.obstacle.maxSize);
  const paddedArea = playAreaWidth - size - GAME_CONFIG.spawn.lanePadding * 2;
  const x =
    GAME_CONFIG.spawn.lanePadding +
    Math.max(0, randomBetween(0, Math.max(0, paddedArea)));

  const type = Math.random() < getZigzagSpawnChance(elapsed) ? 'zigzag' : 'wall';
  const colliderInset = getObstacleColliderInset(type);

  return {
    id: obstacleId++,
    type,
    x,
    y: -size - 8,
    width: size,
    height: size,
    speed: getEnemySpeed(level, elapsed),
    age: 0,
    baseX: x,
    zigzagAmplitude:
      type === 'zigzag'
        ? randomBetween(GAME_CONFIG.obstacle.zigzagAmplitudeMin, GAME_CONFIG.obstacle.zigzagAmplitudeMax)
        : undefined,
    zigzagFrequency:
      type === 'zigzag'
        ? randomBetween(GAME_CONFIG.obstacle.zigzagFrequencyMin, GAME_CONFIG.obstacle.zigzagFrequencyMax)
        : undefined,
    colliderInsetX: colliderInset.x,
    colliderInsetY: colliderInset.y,
  };
};

export const updateObstacles = (
  obstacles: ObstacleEntity[],
  dt: number,
  playAreaWidth: number,
  playAreaHeight: number,
): ObstacleEntity[] => {
  let writeIndex = 0;
  for (let i = 0; i < obstacles.length; i += 1) {
    const obstacle = obstacles[i];
    obstacle.age += dt;
    obstacle.y += obstacle.speed * dt;

    if (obstacle.type === 'zigzag') {
      const baseX = obstacle.baseX ?? obstacle.x;
      const amplitude = obstacle.zigzagAmplitude ?? GAME_CONFIG.obstacle.zigzagAmplitudeMin;
      const frequency = obstacle.zigzagFrequency ?? GAME_CONFIG.obstacle.zigzagFrequencyMin;
      const waveOffset = Math.sin(obstacle.age * frequency) * amplitude;
      const rawX = baseX + waveOffset;
      obstacle.x = Math.max(0, Math.min(rawX, playAreaWidth - obstacle.width));
    }

    if (obstacle.y < playAreaHeight + obstacle.height + 20) {
      obstacles[writeIndex] = obstacle;
      writeIndex += 1;
    }
  }

  obstacles.length = writeIndex;
  return obstacles;
};

export const createShieldPowerUp = (playAreaWidth: number): PowerUpEntity => {
  const size = GAME_CONFIG.powerUp.size;
  const paddedArea = playAreaWidth - size - GAME_CONFIG.spawn.lanePadding * 2;
  const x =
    GAME_CONFIG.spawn.lanePadding +
    Math.max(0, randomBetween(0, Math.max(0, paddedArea)));

  return {
    id: powerUpId++,
    type: 'shield',
    x,
    y: -size - 12,
    width: size,
    height: size,
    speed: GAME_CONFIG.powerUp.baseSpeed,
  };
};

export const updatePowerUps = (
  powerUps: PowerUpEntity[],
  dt: number,
  playAreaHeight: number,
): PowerUpEntity[] => {
  let writeIndex = 0;
  for (let i = 0; i < powerUps.length; i += 1) {
    const powerUp = powerUps[i];
    powerUp.y += powerUp.speed * dt;
    if (powerUp.y < playAreaHeight + powerUp.height + 20) {
      powerUps[writeIndex] = powerUp;
      writeIndex += 1;
    }
  }

  powerUps.length = writeIndex;
  return powerUps;
};

export const createGold = (playAreaWidth: number): GoldEntity => {
  const size = GAME_CONFIG.gold.size;
  const paddedArea = playAreaWidth - size - GAME_CONFIG.spawn.lanePadding * 2;
  const x =
    GAME_CONFIG.spawn.lanePadding +
    Math.max(0, randomBetween(0, Math.max(0, paddedArea)));

  return {
    id: goldId++,
    x,
    y: -size - 10,
    size,
    speed: GAME_CONFIG.gold.baseSpeed,
  };
};

export const updateGold = (goldItems: GoldEntity[], dt: number, playAreaHeight: number): GoldEntity[] => {
  let writeIndex = 0;
  for (let i = 0; i < goldItems.length; i += 1) {
    const gold = goldItems[i];
    gold.y += gold.speed * dt;
    if (gold.y < playAreaHeight + gold.size + 20) {
      goldItems[writeIndex] = gold;
      writeIndex += 1;
    }
  }

  goldItems.length = writeIndex;
  return goldItems;
};

export const getSpawnInterval = (elapsed: number) => {
  return Math.max(
    GAME_CONFIG.spawn.minInterval,
    GAME_CONFIG.spawn.baseInterval - elapsed * GAME_CONFIG.spawn.intervalRampPerSecond,
  );
};

export const shouldSpawnShieldPowerUp = (dt: number) => {
  return Math.random() < GAME_CONFIG.powerUp.spawnChancePerSecond * dt;
};

export const shouldSpawnGold = (dt: number) => {
  return Math.random() < GAME_CONFIG.gold.spawnChancePerSecond * dt;
};
