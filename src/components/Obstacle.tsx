import React from 'react';
import { Image as SkiaImage, Rect, useImage } from '@shopify/react-native-skia';

import { EnemyType } from '../types/game';

const MOVING_ENEMY_ASSET = require('../../assets/enemymoving.png');
const WALL_ASSET = require('../../assets/wall.png');

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: EnemyType;
}

export const Obstacle = ({ x, y, width, height, color, type }: ObstacleProps) => {
  const movingEnemyImage = useImage(MOVING_ENEMY_ASSET as never);
  const wallImage = useImage(WALL_ASSET as never);
  const isStaticWallType = type === 'wall' || type === 'normal';
  const isMovingType = type === 'zigzag';
  const image = isStaticWallType ? wallImage : isMovingType ? movingEnemyImage : wallImage;

  if (image) {
    return <SkiaImage image={image} x={x} y={y} width={width} height={height} fit="cover" />;
  }

  return <Rect x={x} y={y} width={width} height={height} color={color} />;
};
