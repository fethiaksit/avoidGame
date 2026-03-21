export type CharacterSkinKey = 'classic' | 'mint' | 'sunset';

export interface CharacterSkin {
  key: CharacterSkinKey;
  label: string;
  image: number;
}

export const CHARACTER_SKINS: Record<CharacterSkinKey, CharacterSkin> = {
  classic: {
    key: 'classic',
    label: 'ROCKET',
    image: require('../../assets/rocket.png'),
  },
  mint: {
    key: 'mint',
    label: 'NINJA',
    image: require('../../assets/ninja.png'),
  },
  sunset: {
    key: 'sunset',
    label: 'CAT',
    image: require('../../assets/cat.png'),
  },
};

export const CHARACTER_SKIN_OPTIONS = Object.values(CHARACTER_SKINS);
export const DEFAULT_CHARACTER_SKIN: CharacterSkinKey = 'classic';

export const isCharacterSkinKey = (value: string): value is CharacterSkinKey => {
  return value in CHARACTER_SKINS;
};