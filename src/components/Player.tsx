import React from 'react';
import { Rect } from '@shopify/react-native-skia';

import { GAME_COLORS } from '../game/constants';

interface PlayerProps {
  x: number;
  y: number;
  size: number;
  color: string;
  hasShield?: boolean;
}

export const Player = ({ x, y, size, color, hasShield = false }: PlayerProps) => {
  const shieldPadding = 6;

  return (
    <>
      {hasShield && (
        <Rect
          x={x - shieldPadding}
          y={y - shieldPadding}
          width={size + shieldPadding * 2}
          height={size + shieldPadding * 2}
          color={GAME_COLORS.shieldAura}
          opacity={0.25}
        />
      )}
      <Rect x={x} y={y} width={size} height={size} color={color} />
    </>
  );
};
