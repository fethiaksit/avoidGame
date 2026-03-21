import { ObstacleEntity, PlayerEntity } from '../types/game';

export const isColliding = (player: PlayerEntity, obstacle: ObstacleEntity) => {
  return (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.size > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.size > obstacle.y
  );
};

export const hasCollision = (player: PlayerEntity, obstacles: ObstacleEntity[]) =>
  obstacles.some((obstacle) => isColliding(player, obstacle));
