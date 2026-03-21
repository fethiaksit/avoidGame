import { GoldEntity, ObstacleEntity, PlayerEntity, PowerUpEntity } from '../types/game';

export const isColliding = (
  player: Pick<PlayerEntity, 'x' | 'y' | 'size'>,
  entity: Pick<ObstacleEntity | PowerUpEntity, 'x' | 'y' | 'width' | 'height'>,
) => {
  return (
    player.x < entity.x + entity.width &&
    player.x + player.size > entity.x &&
    player.y < entity.y + entity.height &&
    player.y + player.size > entity.y
  );
};

export const getFirstCollidingObstacleIndex = (
  player: PlayerEntity,
  obstacles: ObstacleEntity[],
): number => {
  return obstacles.findIndex((obstacle) => isColliding(player, obstacle));
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
