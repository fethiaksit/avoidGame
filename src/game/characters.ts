export type CharacterSkinKey =
  | 'square'
  | 'ninja'
  | 'cat'
  | 'rocket'
  | 'car1'
  | 'car2'
  | 'car3'
  | 'car4';

export interface CharacterSkin {
  key: CharacterSkinKey;
  label: string;
  cost: number;
  image?: number;
  placeholderColor: string;
  sizeMultiplier?: number;
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

  car1: {
    key: 'car1',
    label: 'CAR 1',
    cost: 1,
    image: require('../../assets/car1.png'),
    placeholderColor: '#22c55e',
    sizeMultiplier: 3,
  },
  car2: {
    key: 'car2',
    label: 'CAR 2',
    cost: 1,
    image: require('../../assets/car2.png'),
    placeholderColor: '#3b82f6',
    sizeMultiplier: 3,
  },
  car3: {
    key: 'car3',
    label: 'CAR 3',
    cost: 2,
    image: require('../../assets/car3.png'),
    placeholderColor: '#a855f7',
    sizeMultiplier: 3,
  },
  car4: {
    key: 'car4',
    label: 'CAR 4',
    cost: 2,
    image: require('../../assets/car4.png'),
    placeholderColor: '#f43f5e',
    sizeMultiplier: 3,
  },
};

export const DEFAULT_CHARACTER_SKIN: CharacterSkinKey = 'square';

export const CHARACTER_SKIN_OPTIONS: CharacterSkin[] =
  Object.values(CHARACTER_SKINS);

export const isCharacterSkinKey = (
  value: string,
): value is CharacterSkinKey => value in CHARACTER_SKINS;

export const PREMIUM_CHARACTER_KEYS: CharacterSkinKey[] = [
  'ninja',
  'cat',
  'rocket',
  'car1',
  'car2',
  'car3',
  'car4',
];

export type CharacterUnlockMap = Record<CharacterSkinKey, boolean>;

export const getDefaultUnlockMap = (): CharacterUnlockMap => ({
  square: true,
  ninja: false,
  cat: false,
  rocket: false,
  car1: false,
  car2: false,
  car3: false,
  car4: false,
});