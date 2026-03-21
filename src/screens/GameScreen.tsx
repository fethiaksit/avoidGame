import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { GameLoop } from '../game/GameLoop';
import { CharacterSkinKey } from '../game/characters';
import { GAME_COLORS } from '../game/constants';

interface GameScreenProps {
  onGameOver: (score: number, earnedGold: number) => void;
  selectedSkin: CharacterSkinKey;
}

export const GameScreen = ({ onGameOver, selectedSkin }: GameScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <GameLoop onGameOver={onGameOver} selectedSkin={selectedSkin} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
});
