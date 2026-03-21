import React from 'react';
import { Rect } from '@shopify/react-native-skia';

interface PlayerProps {
  x: number;
  y: number;
  size: number;
  color: string;
}

export const Player = ({ x, y, size, color }: PlayerProps) => {
  return <Rect x={x} y={y} width={size} height={size} color={color} />;
};
