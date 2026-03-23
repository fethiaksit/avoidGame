import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GameOverScreen } from './src/screens/GameOverScreen';
import { GameScreen } from './src/screens/GameScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import {
  CharacterSkinKey,
  CHARACTER_SKINS,
  DEFAULT_CHARACTER_SKIN,
  getDefaultUnlockMap,
} from './src/game/characters';
import { GAME_COLORS } from './src/game/constants';
import { useGameSounds } from './src/hooks/useGameSounds';
import {
  PersistedGameData,
  loadGameData,
  saveGameData,
  getDefaultGameData,
} from './src/storage/gameStorage';
import { CharacterUnlockMap, GameStatus } from './src/types/game';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [isReady, setIsReady] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [score, setScore] = useState(0);
  const [earnedGold, setEarnedGold] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState<CharacterSkinKey>(DEFAULT_CHARACTER_SKIN);
  const [unlockedCharacters, setUnlockedCharacters] = useState<CharacterUnlockMap>(
    getDefaultUnlockMap(),
  );
  const [soundEnabled, setSoundEnabled] = useState(getDefaultGameData().soundEnabled);

  const latestDataRef = useRef<PersistedGameData | null>(null);
  const savePromiseRef = useRef<Promise<void>>(Promise.resolve());

  const { playCoin, playShieldOn, playShieldBlock, playCrash, playClick, playGameOver } =
    useGameSounds({ soundEnabled });

  const buildPersistedData = useCallback(
    (
      overrides: Partial<PersistedGameData> = {},
      source: {
        totalGold?: number;
        unlockedCharacters?: CharacterUnlockMap;
        selectedCharacter?: CharacterSkinKey;
        highScore?: number;
        soundEnabled?: boolean;
      } = {},
    ): PersistedGameData => ({
      totalGold: source.totalGold ?? totalGold,
      unlockedCharacters: source.unlockedCharacters ?? unlockedCharacters,
      selectedCharacter: source.selectedCharacter ?? selectedSkin,
      highScore: source.highScore ?? highScore,
      soundEnabled: source.soundEnabled ?? soundEnabled,
      ...overrides,
    }),
    [totalGold, unlockedCharacters, selectedSkin, highScore, soundEnabled],
  );

  const queueSave = useCallback((data: PersistedGameData) => {
    latestDataRef.current = data;
    savePromiseRef.current = savePromiseRef.current
      .catch(() => {
        // keep queue alive
      })
      .then(() => saveGameData(data));

    return savePromiseRef.current;
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const data = await loadGameData();
        setTotalGold(data.totalGold);
        setUnlockedCharacters(data.unlockedCharacters);
        setSelectedSkin(data.selectedCharacter);
        setHighScore(data.highScore);
        setSoundEnabled(data.soundEnabled);
        latestDataRef.current = data;
      } finally {
        setIsHydrated(true);
        setIsReady(true);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const snapshot = buildPersistedData();
    queueSave(snapshot).catch(() => {
      console.warn('[storage] Failed to persist game data');
    });
  }, [buildPersistedData, isHydrated, queueSave]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'inactive' && nextState !== 'background') return;

      const snapshot = latestDataRef.current ?? buildPersistedData();
      queueSave(snapshot).catch(() => {
        console.warn('[storage] Failed to flush game data on app background');
      });
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [buildPersistedData, queueSave]);

  const onStart = useCallback(() => {
    setScore(0);
    setEarnedGold(0);
    setStatus('playing');
  }, []);

  const onSelectSkin = useCallback(
    async (skin: CharacterSkinKey) => {
      if (!unlockedCharacters[skin]) return;
      setSelectedSkin(skin);
      const snapshot = buildPersistedData({ selectedCharacter: skin });
      await queueSave(snapshot);
    },
    [buildPersistedData, queueSave, unlockedCharacters],
  );

  const onUnlockSkin = useCallback(
    async (skin: CharacterSkinKey) => {
      const skinDef = CHARACTER_SKINS[skin];
      if (!skinDef || unlockedCharacters[skin] || totalGold < skinDef.cost) return;

      const nextGold = totalGold - skinDef.cost;
      const nextUnlocked = { ...unlockedCharacters, [skin]: true };

      setTotalGold(nextGold);
      setUnlockedCharacters(nextUnlocked);
      setSelectedSkin(skin);

      const snapshot = buildPersistedData({
        totalGold: nextGold,
        unlockedCharacters: nextUnlocked,
        selectedCharacter: skin,
      });

      await queueSave(snapshot);
    },
    [buildPersistedData, queueSave, totalGold, unlockedCharacters],
  );

  const onGameOver = useCallback(
    async (finalScore: number, runEarnedGold: number) => {
      playGameOver();
      setScore(finalScore);
      setEarnedGold(runEarnedGold);
      setStatus('gameOver');

      const nextGold = totalGold + Math.max(0, runEarnedGold);
      const nextHighScore = Math.max(highScore, finalScore);

      if (runEarnedGold > 0) {
        setTotalGold(nextGold);
      }

      if (nextHighScore !== highScore) {
        setHighScore(nextHighScore);
      }

      const snapshot = buildPersistedData({
        totalGold: runEarnedGold > 0 ? nextGold : totalGold,
        highScore: nextHighScore,
      });

      await queueSave(snapshot);
    },
    [buildPersistedData, highScore, playGameOver, queueSave, totalGold],
  );

  const onSpendGold = useCallback(
    async (amount: number) => {
      const nextGold = Math.max(0, totalGold - amount);
      setTotalGold(nextGold);
      const snapshot = buildPersistedData({ totalGold: nextGold });
      await queueSave(snapshot);
    },
    [buildPersistedData, queueSave, totalGold],
  );

  const onSoundEnabledChange = useCallback(
    async (value: boolean) => {
      setSoundEnabled(value);
      const snapshot = buildPersistedData({ soundEnabled: value });
      await queueSave(snapshot);
    },
    [buildPersistedData, queueSave],
  );

  const onBackToMenu = useCallback(() => setStatus('menu'), []);

  if (!isReady) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaView style={styles.loaderContainer}>
          <StatusBar style="light" />
          <ActivityIndicator size="large" color={GAME_COLORS.accent} />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.appContainer}>
          <StatusBar style="light" hidden={status === 'playing'} />
          {status === 'menu' ? (
            <MenuScreen
              highScore={highScore}
              totalGold={totalGold}
              onStart={onStart}
              selectedSkin={selectedSkin}
              unlockedCharacters={unlockedCharacters}
              onSelectSkin={onSelectSkin}
              onUnlockSkin={onUnlockSkin}
              onButtonClick={playClick}
            />
          ) : null}
          {status === 'playing' ? (
            <GameScreen
              onGameOver={onGameOver}
              onRestart={onStart}
              onSpendGold={onSpendGold}
              selectedSkin={selectedSkin}
              totalGold={totalGold}
              soundEnabled={soundEnabled}
              onSoundEnabledChange={onSoundEnabledChange}
              onCoinPickup={playCoin}
              onShieldPickup={playShieldOn}
              onShieldBlock={playShieldBlock}
              onCrash={playCrash}
              onButtonClick={playClick}
            />
          ) : null}
          {status === 'gameOver' ? (
            <GameOverScreen
              score={score}
              highScore={highScore}
              earnedGold={earnedGold}
              totalGold={totalGold}
              onRetry={onStart}
              onBackToMenu={onBackToMenu}
              onButtonClick={playClick}
            />
          ) : null}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GAME_COLORS.background,
  },
});
