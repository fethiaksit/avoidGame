import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameOverScreen } from './src/screens/GameOverScreen';
import { GameScreen } from './src/screens/GameScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { DEFAULT_CHARACTER_SKIN, CharacterSkinKey } from './src/game/characters';
import { GAME_COLORS } from './src/game/constants';
import { getCharacterSkin, setCharacterSkin } from './src/storage/characterSkin';
import { getHighScore, saveHighScoreIfNeeded } from './src/storage/highScore';
import { GameStatus } from './src/types/game';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState<CharacterSkinKey>(DEFAULT_CHARACTER_SKIN);

  useEffect(() => {
    const loadAppData = async () => {
      const [best, savedSkin] = await Promise.all([getHighScore(), getCharacterSkin()]);
      setHighScore(best);
      setSelectedSkin(savedSkin);
      setIsReady(true);
    };

    loadAppData();
  }, []);

  const onStart = useCallback(() => {
    setScore(0);
    setStatus('playing');
  }, []);

  const onSelectSkin = useCallback(async (skin: CharacterSkinKey) => {
    setSelectedSkin(skin);
    await setCharacterSkin(skin);
  }, []);
  const onGameOver = useCallback(async (finalScore: number) => {
    setScore(finalScore);
    setStatus('gameOver');
    const best = await saveHighScoreIfNeeded(finalScore);
    setHighScore(best);
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
            onStart={onStart}
            selectedSkin={selectedSkin}
            onSelectSkin={onSelectSkin}
          />
        ) : null}
        {status === 'playing' ? (
          <GameScreen onGameOver={onGameOver} selectedSkin={selectedSkin} />
        ) : null}
        {status === 'gameOver' ? (
          <GameOverScreen
            score={score}
            highScore={highScore}
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
