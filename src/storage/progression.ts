import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CharacterSkinKey,
  CharacterUnlockMap,
  DEFAULT_CHARACTER_SKIN,
  getDefaultUnlockMap,
  isCharacterSkinKey,
} from '../game/characters';

const GOLD_KEY = 'avoid.gold.v1';
const UNLOCKED_KEY = 'avoid.unlockedCharacters.v1';
const SELECTED_KEY = 'avoid.selectedCharacter.v1';

const parseGold = (value: string | null) => {
  if (!value) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

const parseUnlocks = (value: string | null): CharacterUnlockMap => {
  const defaults = getDefaultUnlockMap();
  if (!value) return defaults;

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;

    return {
      square: true,
      ninja: Boolean(parsed.ninja),
      cat: Boolean(parsed.cat),
      rocket: Boolean(parsed.rocket),
    };
  } catch {
    return defaults;
  }
};

const parseSelected = (value: string | null, unlocks: CharacterUnlockMap): CharacterSkinKey => {
  if (!value || !isCharacterSkinKey(value)) return DEFAULT_CHARACTER_SKIN;
  return unlocks[value] ? value : DEFAULT_CHARACTER_SKIN;
};

export interface ProgressionState {
  gold: number;
  unlockedCharacters: CharacterUnlockMap;
  selectedCharacter: CharacterSkinKey;
}

export const loadProgression = async (): Promise<ProgressionState> => {
  const [goldRaw, unlocksRaw, selectedRaw] = await Promise.all([
    AsyncStorage.getItem(GOLD_KEY),
    AsyncStorage.getItem(UNLOCKED_KEY),
    AsyncStorage.getItem(SELECTED_KEY),
  ]);

  const unlockedCharacters = parseUnlocks(unlocksRaw);

  return {
    gold: parseGold(goldRaw),
    unlockedCharacters,
    selectedCharacter: parseSelected(selectedRaw, unlockedCharacters),
  };
};

export const saveGold = async (gold: number) => {
  await AsyncStorage.setItem(GOLD_KEY, String(Math.max(0, Math.floor(gold))));
};

export const saveUnlockedCharacters = async (unlockMap: CharacterUnlockMap) => {
  await AsyncStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlockMap));
};

export const saveSelectedCharacter = async (skin: CharacterSkinKey) => {
  await AsyncStorage.setItem(SELECTED_KEY, skin);
};
