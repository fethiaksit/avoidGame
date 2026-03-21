import React from 'react';
import { Rect } from '@shopify/react-native-skia';

interface PowerUpProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export const PowerUp = ({ x, y, width, height, color }: PowerUpProps) => {
  return <Rect x={x} y={y} width={width} height={height} color={color} opacity={0.9} />;
};
