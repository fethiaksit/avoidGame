import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { getHighScore, saveHighScoreIfNeeded } from './src/storage/highScore';
import {
  loadProgression,
  saveGold,
  saveSelectedCharacter,
  saveUnlockedCharacters,
} from './src/storage/progression';
import { CharacterUnlockMap, GameStatus } from './src/types/game';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedGold, setEarnedGold] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState<CharacterSkinKey>(DEFAULT_CHARACTER_SKIN);
  const [unlockedCharacters, setUnlockedCharacters] = useState<CharacterUnlockMap>(
    getDefaultUnlockMap(),
  );

  useEffect(() => {
    const loadAppData = async () => {
      const [best, progression] = await Promise.all([getHighScore(), loadProgression()]);
      setHighScore(best);
      setTotalGold(progression.gold);
      setSelectedSkin(progression.selectedCharacter);
      setUnlockedCharacters(progression.unlockedCharacters);
      setIsReady(true);
    };

    loadAppData();
  }, []);

  const onStart = useCallback(() => {
    setScore(0);
    setEarnedGold(0);
    setStatus('playing');
  }, []);

  const onSelectSkin = useCallback(
    async (skin: CharacterSkinKey) => {
      if (!unlockedCharacters[skin]) return;
      setSelectedSkin(skin);
      await saveSelectedCharacter(skin);
    },
    [unlockedCharacters],
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

      await Promise.all([
        saveGold(nextGold),
        saveUnlockedCharacters(nextUnlocked),
        saveSelectedCharacter(skin),
      ]);
    },
    [totalGold, unlockedCharacters],
  );

  const onGameOver = useCallback(async (finalScore: number, runEarnedGold: number) => {
    setScore(finalScore);
    setEarnedGold(runEarnedGold);
    setStatus('gameOver');

    if (runEarnedGold > 0) {
      let nextGoldValue = 0;
      setTotalGold((prev) => {
        nextGoldValue = prev + runEarnedGold;
        return nextGoldValue;
      });
      await saveGold(nextGoldValue);
    }

    const best = await saveHighScoreIfNeeded(finalScore);
    setHighScore(best);
  }, []);

  const onSpendGold = useCallback(async (amount: number) => {
    let nextGoldValue = 0;
    setTotalGold((prev) => {
      nextGoldValue = Math.max(0, prev - amount);
      return nextGoldValue;
    });
    await saveGold(nextGoldValue);
  }, []);

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
      <SafeAreaView style={styles.appContainer}>
        <StatusBar style="light" />
        {status === 'menu' ? (
          <MenuScreen
            highScore={highScore}
            totalGold={totalGold}
            onStart={onStart}
            selectedSkin={selectedSkin}
            unlockedCharacters={unlockedCharacters}
            onSelectSkin={onSelectSkin}
            onUnlockSkin={onUnlockSkin}
          />
        ) : null}
        {status === 'playing' ? (
          <GameScreen
            onGameOver={onGameOver}
            onRestart={onStart}
            onSpendGold={onSpendGold}
            selectedSkin={selectedSkin}
            totalGold={totalGold}
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
          />
        ) : null}
      </SafeAreaView>
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
