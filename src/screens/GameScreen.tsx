import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { GameLoop } from '../game/GameLoop';
import { CharacterSkinKey } from '../game/characters';
import { GAME_COLORS } from '../game/constants';

interface GameScreenProps {
  onGameOver: (score: number, earnedGold: number) => void;
  onRestart: () => void;
  onSpendGold: (amount: number) => Promise<void>;
  selectedSkin: CharacterSkinKey;
  totalGold: number;
  soundEnabled: boolean;
  onSoundEnabledChange: (value: boolean) => void;
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
  soundEnabled,
  onSoundEnabledChange,
  onCoinPickup,
  onShieldPickup,
  onShieldBlock,
  onCrash,
  onButtonClick,
}: GameScreenProps) => {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let navigationBar: any = null;
    try {
      navigationBar = require('expo-navigation-bar');
    } catch {
      return;
    }

    let isMounted = true;
    const applyImmersiveMode = async () => {
      // Android can still briefly reveal bars with edge gestures.
      // We hide them again opportunistically, but gameplay must remain active either way.
      await navigationBar.setPositionAsync('absolute');
      await navigationBar.setBackgroundColorAsync('#00000000');
      await navigationBar.setBehaviorAsync('overlay-swipe');
      await navigationBar.setVisibilityAsync('hidden');
    };

    applyImmersiveMode().catch(() => {
      // no-op on unsupported devices/ROM behaviors
    });

    const visibilitySubscription = navigationBar.addVisibilityListener(() => {
      if (!isMounted) return;
      navigationBar.setVisibilityAsync('hidden').catch(() => {
        // best-effort re-hide
      });
    });

    return () => {
      isMounted = false;
      visibilitySubscription.remove();
      navigationBar.setVisibilityAsync('visible').catch(() => {
        // no-op
      });
      navigationBar.setPositionAsync('relative').catch(() => {
        // no-op
      });
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      <GameLoop
        onGameOver={onGameOver}
        onRestart={onRestart}
        onSpendGold={onSpendGold}
        selectedSkin={selectedSkin}
        totalGold={totalGold}
        soundEnabled={soundEnabled}
        onSoundEnabledChange={onSoundEnabledChange}
        onCoinPickup={onCoinPickup}
        onShieldPickup={onShieldPickup}
        onShieldBlock={onShieldBlock}
        onCrash={onCrash}
        onButtonClick={onButtonClick}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
});
