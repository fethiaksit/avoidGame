import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { GameLoop } from '../game/GameLoop';
import { CharacterSkinKey } from '../game/characters';
import { GAME_COLORS } from '../game/constants';

interface GameScreenProps {
  onGameOver: (score: number, earnedGold: number) => void;
  onRestart: () => void;
  onSpendGold: (amount: number) => Promise<void>;
  selectedSkin: CharacterSkinKey;
  totalGold: number;
  onCoinPickup: () => void;
  onShieldPickup: () => void;
  onShieldBlock: () => void;
  onCrash: () => void;
  onButtonClick: () => void;
}

export const GameScreen = ({
  onGameOver,
  onRestart,
  onSpendGold,
  selectedSkin,
  totalGold,
  onCoinPickup,
  onShieldPickup,
  onShieldBlock,
  onCrash,
  onButtonClick,
}: GameScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <GameLoop
        onGameOver={onGameOver}
        onRestart={onRestart}
        onSpendGold={onSpendGold}
        selectedSkin={selectedSkin}
        totalGold={totalGold}
        onCoinPickup={onCoinPickup}
        onShieldPickup={onShieldPickup}
        onShieldBlock={onShieldBlock}
        onCrash={onCrash}
        onButtonClick={onButtonClick}
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
