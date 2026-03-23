import { GoldEntity, ObstacleEntity, PlayerEntity, PowerUpEntity } from '../types/game';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const toInsetRect = (rect: Rect, scale: number): Rect => {
  const normalizedScale = Math.max(0.1, Math.min(1, scale));
  const insetX = (rect.width * (1 - normalizedScale)) / 2;
  const insetY = (rect.height * (1 - normalizedScale)) / 2;

  return {
    x: rect.x + insetX,
    y: rect.y + insetY,
    width: rect.width * normalizedScale,
    height: rect.height * normalizedScale,
  };
};

const intersects = (a: Rect, b: Rect): boolean => {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
};

const toPlayerRect = (player: Pick<PlayerEntity, 'x' | 'y' | 'size'>): Rect => ({
  x: player.x,
  y: player.y,
  width: player.size,
  height: player.size,
});

const toEntityRect = (entity: Pick<ObstacleEntity | PowerUpEntity, 'x' | 'y' | 'width' | 'height'>): Rect => ({
  x: entity.x,
  y: entity.y,
  width: entity.width,
  height: entity.height,
});

export const isColliding = (
  player: Pick<PlayerEntity, 'x' | 'y' | 'size'>,
  entity: Pick<ObstacleEntity | PowerUpEntity, 'x' | 'y' | 'width' | 'height'>,
) => {
  return intersects(toPlayerRect(player), toEntityRect(entity));
};

const PLAYER_OBSTACLE_HITBOX_SCALE = 0.9;
const OBSTACLE_HITBOX_SCALE = 0.88;

const isCollidingWithObstacle = (
  player: Pick<PlayerEntity, 'x' | 'y' | 'size' | 'obstacleCollisionScale'>,
  obstacle: Pick<ObstacleEntity, 'x' | 'y' | 'width' | 'height'>,
) => {
  const playerScale =
    PLAYER_OBSTACLE_HITBOX_SCALE *
    (typeof player.obstacleCollisionScale === 'number' ? player.obstacleCollisionScale : 1);
  const playerRect = toInsetRect(toPlayerRect(player), playerScale);
  const obstacleRect = toInsetRect(toEntityRect(obstacle), OBSTACLE_HITBOX_SCALE);

  return intersects(playerRect, obstacleRect);
};

export const getFirstCollidingObstacleIndex = (
  player: PlayerEntity,
  obstacles: ObstacleEntity[],
): number => {
  return obstacles.findIndex((obstacle) => isCollidingWithObstacle(player, obstacle));
};

export const getCollectedPowerUpIndexes = (
  player: PlayerEntity,
  powerUps: PowerUpEntity[],
): number[] => {
  return powerUps.reduce<number[]>((indexes, powerUp, index) => {
    if (isColliding(player, powerUp)) {
      indexes.push(index);
    }
    return indexes;
  }, []);
};

export const getCollectedGoldIndexes = (
  player: PlayerEntity,
  goldItems: GoldEntity[],
): number[] => {
  return goldItems.reduce<number[]>((indexes, gold, index) => {
    if (
      isColliding(player, {
        x: gold.x,
        y: gold.y,
        width: gold.size,
        height: gold.size,
      })
    ) {
      indexes.push(index);
    }
    return indexes;
  }, []);
};
