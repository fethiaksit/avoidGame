import React from 'react';
import { Image as SkiaImage, Rect, useImage } from '@shopify/react-native-skia';

import { EnemyType } from '../types/game';

const MOVING_ENEMY_ASSET = require('../../assets/enemymoving.png');
const WALL_ASSET: number | undefined = undefined;

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: EnemyType;
}

export const Obstacle = ({ x, y, width, height, color, type }: ObstacleProps) => {
  const source = type === 'wall' ? WALL_ASSET : MOVING_ENEMY_ASSET;
  const image = useImage((source ?? null) as never);

  if (image) {
    return <SkiaImage image={image} x={x} y={y} width={width} height={height} fit="cover" />;
  }

  return <Rect x={x} y={y} width={width} height={height} color={color} />;
};
