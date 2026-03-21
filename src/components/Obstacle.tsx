import React from 'react';
import { Rect } from '@shopify/react-native-skia';

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export const Obstacle = ({ x, y, width, height, color }: ObstacleProps) => {
  return <Rect x={x} y={y} width={width} height={height} color={color} />;
};
