import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { GameLoop } from '../game/GameLoop';
import { CharacterSkinKey } from '../game/characters';
import { GAME_COLORS } from '../game/constants';

interface GameScreenProps {
  onGameOver: (score: number, earnedGold: number) => void;
  selectedSkin: CharacterSkinKey;
  totalGold: number;
}

export const GameScreen = ({ onGameOver, selectedSkin, totalGold }: GameScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <GameLoop
        onGameOver={onGameOver}
        selectedSkin={selectedSkin}
        totalGold={totalGold}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
});
