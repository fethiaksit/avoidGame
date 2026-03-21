export type CharacterSkinKey = 'square' | 'ninja' | 'cat' | 'rocket';

export interface CharacterSkin {
  key: CharacterSkinKey;
  label: string;
  cost: number;
  image?: number;
  placeholderColor: string;
}

export const CHARACTER_SKINS: Record<CharacterSkinKey, CharacterSkin> = {
  square: {
    key: 'square',
    label: 'SQUARE',
    cost: 0,
    placeholderColor: '#60a5fa',
  },
  ninja: {
    key: 'ninja',
    label: 'NINJA',
    cost: 60,
    image: require('../../assets/ninja.png'),
    placeholderColor: '#a78bfa',
  },
  cat: {
    key: 'cat',
    label: 'CAT',
    cost: 90,
    image: require('../../assets/cat.png'),
    placeholderColor: '#f59e0b',
  },
  rocket: {
    key: 'rocket',
    label: 'ROCKET',
    cost: 130,
    image: require('../../assets/rocket.png'),
    placeholderColor: '#ef4444',
  },
};

export const DEFAULT_CHARACTER_SKIN: CharacterSkinKey = 'square';
export const CHARACTER_SKIN_OPTIONS = Object.values(CHARACTER_SKINS);

export const isCharacterSkinKey = (value: string): value is CharacterSkinKey => value in CHARACTER_SKINS;

export const PREMIUM_CHARACTER_KEYS: CharacterSkinKey[] = ['ninja', 'cat', 'rocket'];

export type CharacterUnlockMap = Record<CharacterSkinKey, boolean>;

export const getDefaultUnlockMap = (): CharacterUnlockMap => ({
  square: true,
  ninja: false,
  cat: false,
  rocket: false,
});
