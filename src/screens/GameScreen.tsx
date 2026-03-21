import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { GameLoop } from '../game/GameLoop';
import { GAME_COLORS } from '../game/constants';

interface GameScreenProps {
  onGameOver: (score: number) => void;
}

export const GameScreen = ({ onGameOver }: GameScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <GameLoop onGameOver={onGameOver} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
});
