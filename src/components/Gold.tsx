import React from 'react';
import { Circle, Rect } from '@shopify/react-native-skia';

interface GoldProps {
  x: number;
  y: number;
  size: number;
  color: string;
}

export const Gold = ({ x, y, size, color }: GoldProps) => {
  const center = size / 2;

  return (
    <>
      <Circle cx={x + center} cy={y + center} r={center} color={color} opacity={0.95} />
      <Rect
        x={x + size * 0.42}
        y={y + size * 0.2}
        width={size * 0.16}
        height={size * 0.6}
        color="#fef3c7"
        opacity={0.8}
      />
    </>
  );
};
