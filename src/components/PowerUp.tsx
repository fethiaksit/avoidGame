import React from 'react';
import { Image as SkiaImage, Rect, useImage } from '@shopify/react-native-skia';

const SHIELD_POWER_UP_ASSET = require('../../assets/sheild.png');

interface PowerUpProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export const PowerUp = ({ x, y, width, height, color }: PowerUpProps) => {
  const shieldImage = useImage(SHIELD_POWER_UP_ASSET as never);

  if (shieldImage) {
    return <SkiaImage image={shieldImage} x={x} y={y} width={width} height={height} fit="cover" />;
  }

  return <Rect x={x} y={y} width={width} height={height} color={color} opacity={0.9} />;
};
