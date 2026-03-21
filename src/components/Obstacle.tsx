import React from 'react';
import { Image as SkiaImage, Rect, useImage } from '@shopify/react-native-skia';

import { EnemyType } from '../types/game';

// These stay undefined unless corresponding files already exist in the repo.
const MOVING_ENEMY_ASSET: number | undefined = undefined;
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
  const source = type === 'zigzag' ? MOVING_ENEMY_ASSET : WALL_ASSET;
  const image = useImage((source ?? null) as never);

  if (image) {
    return <SkiaImage image={image} x={x} y={y} width={width} height={height} fit="cover" />;
  }

  return <Rect x={x} y={y} width={width} height={height} color={color} />;
};
