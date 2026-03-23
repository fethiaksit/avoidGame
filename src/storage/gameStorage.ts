import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CharacterSkinKey,
  DEFAULT_CHARACTER_SKIN,
  getDefaultUnlockMap,
  isCharacterSkinKey,
} from '../game/characters';
import { CharacterUnlockMap } from '../types/game';

const GAME_SAVE_KEY = 'avoid.gameSave.v2';

const LEGACY_KEYS = {
  gold: 'avoid.gold.v1',
  unlockedCharacters: 'avoid.unlockedCharacters.v1',
  selectedCharacter: 'avoid.selectedCharacter.v1',
  highScore: 'avoid.highScore.v1',
  soundEnabled: '@avoid:soundEnabled',
} as const;

export interface PersistedGameData {
  totalGold: number;
  unlockedCharacters: CharacterUnlockMap;
  selectedCharacter: CharacterSkinKey;
  highScore: number;
  soundEnabled: boolean;
}

export const getDefaultGameData = (): PersistedGameData => ({
  totalGold: 0,
  unlockedCharacters: getDefaultUnlockMap(),
  selectedCharacter: DEFAULT_CHARACTER_SKIN,
  highScore: 0,
  soundEnabled: true,
});

const parseNonNegativeInt = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
};

const parseUnlockMap = (value: unknown): CharacterUnlockMap => {
  const defaults = getDefaultUnlockMap();

  if (!value || typeof value !== 'object') {
    return defaults;
  }

  const record = value as Record<string, unknown>;

  return {
    ...defaults,
    square: true,
    ninja: Boolean(record.ninja),
    cat: Boolean(record.cat),
    rocket: Boolean(record.rocket),
    car1: Boolean(record.car1),
    car2: Boolean(record.car2),
    car3: Boolean(record.car3),
    car4: Boolean(record.car4),
  };
};

const sanitizeGameData = (input: Partial<PersistedGameData>): PersistedGameData => {
  const unlockedCharacters = parseUnlockMap(input.unlockedCharacters);
  const selectedCandidate =
    typeof input.selectedCharacter === 'string' && isCharacterSkinKey(input.selectedCharacter)
      ? input.selectedCharacter
      : DEFAULT_CHARACTER_SKIN;

  return {
    totalGold: parseNonNegativeInt(input.totalGold, 0),
    unlockedCharacters,
    selectedCharacter: unlockedCharacters[selectedCandidate]
      ? selectedCandidate
      : DEFAULT_CHARACTER_SKIN,
    highScore: parseNonNegativeInt(input.highScore, 0),
    soundEnabled:
      typeof input.soundEnabled === 'boolean' ? input.soundEnabled : getDefaultGameData().soundEnabled,
  };
};

const parseLegacyUnlockMap = (raw: string | null): CharacterUnlockMap => {
  if (!raw) return getDefaultUnlockMap();
  try {
    return parseUnlockMap(JSON.parse(raw));
  } catch {
    return getDefaultUnlockMap();
  }
};

const loadLegacyData = async (): Promise<PersistedGameData> => {
  const [goldRaw, unlocksRaw, selectedRaw, highScoreRaw, soundRaw] = await Promise.all([
    AsyncStorage.getItem(LEGACY_KEYS.gold),
    AsyncStorage.getItem(LEGACY_KEYS.unlockedCharacters),
    AsyncStorage.getItem(LEGACY_KEYS.selectedCharacter),
    AsyncStorage.getItem(LEGACY_KEYS.highScore),
    AsyncStorage.getItem(LEGACY_KEYS.soundEnabled),
  ]);

  const unlockedCharacters = parseLegacyUnlockMap(unlocksRaw);
  const selectedCharacterCandidate =
    selectedRaw && isCharacterSkinKey(selectedRaw) ? selectedRaw : DEFAULT_CHARACTER_SKIN;

  return sanitizeGameData({
    totalGold: parseNonNegativeInt(goldRaw, 0),
    unlockedCharacters,
    selectedCharacter: unlockedCharacters[selectedCharacterCandidate]
      ? selectedCharacterCandidate
      : DEFAULT_CHARACTER_SKIN,
    highScore: parseNonNegativeInt(highScoreRaw, 0),
    soundEnabled: soundRaw === null ? true : soundRaw === 'true',
  });
};

export const loadGameData = async (): Promise<PersistedGameData> => {
  const raw = await AsyncStorage.getItem(GAME_SAVE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<PersistedGameData>;
      const hydrated = sanitizeGameData(parsed);
      console.log('[storage] Loaded game data from v2 save');
      return hydrated;
    } catch {
      console.warn('[storage] Invalid v2 save payload; falling back to defaults/legacy');
    }
  }

  const legacyData = await loadLegacyData();
  const hasUnlockedNonDefault = Object.entries(legacyData.unlockedCharacters).some(
    ([key, unlocked]) => key !== DEFAULT_CHARACTER_SKIN && unlocked,
  );

  const hasLegacyProgress =
    legacyData.totalGold > 0 ||
    legacyData.highScore > 0 ||
    legacyData.selectedCharacter !== DEFAULT_CHARACTER_SKIN ||
    !legacyData.soundEnabled ||
    hasUnlockedNonDefault;

  if (hasLegacyProgress) {
    await saveGameData(legacyData);
    console.log('[storage] Migrated legacy game data to v2 save');
    return legacyData;
  }

  console.log('[storage] No save found; using default game data');
  return getDefaultGameData();
};

export const saveGameData = async (data: PersistedGameData): Promise<void> => {
  const payload = sanitizeGameData(data);
  await AsyncStorage.setItem(GAME_SAVE_KEY, JSON.stringify(payload));
  console.log('[storage] Saved game data');
};
