import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { GameOverScreen } from './src/screens/GameOverScreen';
import { GameScreen } from './src/screens/GameScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { GAME_COLORS } from './src/game/constants';
import { getHighScore, saveHighScoreIfNeeded } from './src/storage/highScore';
import { GameStatus } from './src/types/game';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const loadHighScore = async () => {
      const best = await getHighScore();
      setHighScore(best);
      setIsReady(true);
    };

    loadHighScore();
  }, []);

  const onStart = useCallback(() => {
    setScore(0);
    setStatus('playing');
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
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={GAME_COLORS.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="light" />
      {status === 'menu' ? <MenuScreen highScore={highScore} onStart={onStart} /> : null}
      {status === 'playing' ? <GameScreen onGameOver={onGameOver} /> : null}
      {status === 'gameOver' ? (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onRetry={onStart}
          onBackToMenu={onBackToMenu}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
