import { GoldEntity, ObstacleEntity, PlayerEntity, PowerUpEntity } from '../types/game';

type ColliderBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const intersects = (a: ColliderBounds, b: ColliderBounds): boolean => {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
};

const getPlayerBounds = (player: Pick<PlayerEntity, 'x' | 'y' | 'size' | 'colliderInsetX' | 'colliderInsetY'>): ColliderBounds => {
  const insetX = player.size * player.colliderInsetX;
  const insetY = player.size * player.colliderInsetY;
  const minSize = player.size * 0.2;
  const width = Math.max(minSize, player.size - insetX * 2);
  const height = Math.max(minSize, player.size - insetY * 2);

  return {
    left: player.x + insetX,
    right: player.x + insetX + width,
    top: player.y + insetY,
    bottom: player.y + insetY + height,
  };
};

const getEntityBounds = (
  entity: Pick<ObstacleEntity | PowerUpEntity, 'x' | 'y' | 'width' | 'height'>,
  colliderInsetX = 0,
  colliderInsetY = 0,
): ColliderBounds => {
  const insetX = entity.width * colliderInsetX;
  const insetY = entity.height * colliderInsetY;
  const minWidth = entity.width * 0.2;
  const minHeight = entity.height * 0.2;
  const width = Math.max(minWidth, entity.width - insetX * 2);
  const height = Math.max(minHeight, entity.height - insetY * 2);

  return {
    left: entity.x + insetX,
    right: entity.x + insetX + width,
    top: entity.y + insetY,
    bottom: entity.y + insetY + height,
  };
};

export const isColliding = (
  player: Pick<PlayerEntity, 'x' | 'y' | 'size' | 'colliderInsetX' | 'colliderInsetY'>,
  entity: Pick<ObstacleEntity | PowerUpEntity, 'x' | 'y' | 'width' | 'height'>,
) => {
  return intersects(getPlayerBounds(player), getEntityBounds(entity));
};

const isCollidingWithObstacle = (
  player: Pick<
    PlayerEntity,
    'x' | 'y' | 'size' | 'obstacleCollisionScale' | 'colliderInsetX' | 'colliderInsetY'
  >,
  obstacle: Pick<ObstacleEntity, 'x' | 'y' | 'width' | 'height' | 'colliderInsetX' | 'colliderInsetY'>,
) => {
  const playerScale = typeof player.obstacleCollisionScale === 'number' ? player.obstacleCollisionScale : 1;
  const playerRect = getPlayerBounds({
    ...player,
    colliderInsetX: player.colliderInsetX * playerScale,
    colliderInsetY: player.colliderInsetY * playerScale,
  });
  const obstacleRect = getEntityBounds(obstacle, obstacle.colliderInsetX, obstacle.colliderInsetY);

  if (playerRect.bottom < obstacleRect.top || playerRect.top > obstacleRect.bottom) {
    return false;
  }

  return intersects(playerRect, obstacleRect);
};

export const getFirstCollidingObstacleIndex = (
  player: PlayerEntity,
  obstacles: ObstacleEntity[],
): number => {
  const playerBounds = getPlayerBounds(player);
  for (let index = 0; index < obstacles.length; index += 1) {
    const obstacle = obstacles[index];
    const obstacleBounds = getEntityBounds(obstacle, obstacle.colliderInsetX, obstacle.colliderInsetY);

    if (playerBounds.bottom < obstacleBounds.top || playerBounds.top > obstacleBounds.bottom) {
      continue;
    }

    if (isCollidingWithObstacle(player, obstacle)) {
      return index;
    }
  }

  return -1;
};

export const getCollectedPowerUpIndexes = (
  player: PlayerEntity,
  powerUps: PowerUpEntity[],
): number[] => {
  const indexes: number[] = [];
  for (let index = 0; index < powerUps.length; index += 1) {
    if (isColliding(player, powerUps[index])) {
      indexes.push(index);
    }
  }
  return indexes;
};

export const getCollectedGoldIndexes = (
  player: PlayerEntity,
  goldItems: GoldEntity[],
): number[] => {
  const indexes: number[] = [];
  for (let index = 0; index < goldItems.length; index += 1) {
    const gold = goldItems[index];
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
  }
  return indexes;
};
