import React from 'react';
import { Image as SkiaImage, Rect, useImage } from '@shopify/react-native-skia';

import { GAME_COLORS } from '../game/constants';
import { CharacterSkin } from '../game/characters';

interface PlayerProps {
  x: number;
  y: number;
  size: number;
  skin: CharacterSkin;
  hasShield?: boolean;
}

export const Player = ({ x, y, size, skin, hasShield = false }: PlayerProps) => {
  const shieldPadding = 6;
  const image = useImage((skin.image ?? null) as never);

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
      const image = useImage(skin.image);

      return image ? (
      <SkiaImage
        image={image}
        x={x}
        y={y}
        width={size}
        height={size}
        fit="cover"
      />
      ) : null;
    </>
  );
};
