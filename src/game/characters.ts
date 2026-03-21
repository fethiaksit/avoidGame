export type CharacterSkinKey = 'classic' | 'mint' | 'sunset';

export interface CharacterSkin {
  key: CharacterSkinKey;
  label: string;
  placeholderColor: string;
  image?: number;
}

export const CHARACTER_SKINS: Record<CharacterSkinKey, CharacterSkin> = {
  classic: {
    key: 'classic',
    label: 'Classic',
    placeholderColor: '#22d3ee',
    // Future asset path:
    // image: require('../../assets/skins/classic.png'),
  },
  mint: {
    key: 'mint',
    label: 'Mint',
    placeholderColor: '#34d399',
    // Future asset path:
    // image: require('../../assets/skins/mint.png'),
  },
  sunset: {
    key: 'sunset',
    label: 'Sunset',
    placeholderColor: '#fb7185',
    // Future asset path:
    // image: require('../../assets/skins/sunset.png'),
  },
};

export const CHARACTER_SKIN_OPTIONS = Object.values(CHARACTER_SKINS);
export const DEFAULT_CHARACTER_SKIN: CharacterSkinKey = 'classic';

export const isCharacterSkinKey = (value: string): value is CharacterSkinKey => {
  return value in CHARACTER_SKINS;
};
