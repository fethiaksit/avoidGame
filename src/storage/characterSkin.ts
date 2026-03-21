import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CharacterSkinKey,
  DEFAULT_CHARACTER_SKIN,
  isCharacterSkinKey,
} from '../game/characters';

const CHARACTER_SKIN_KEY = 'avoid.characterSkin.v1';

export const getCharacterSkin = async (): Promise<CharacterSkinKey> => {
  const raw = await AsyncStorage.getItem(CHARACTER_SKIN_KEY);
  if (!raw) return DEFAULT_CHARACTER_SKIN;

  return isCharacterSkinKey(raw) ? raw : DEFAULT_CHARACTER_SKIN;
};

export const setCharacterSkin = async (skin: CharacterSkinKey) => {
  await AsyncStorage.setItem(CHARACTER_SKIN_KEY, skin);
};
