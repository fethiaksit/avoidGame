import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { GAME_COLORS } from '../game/constants';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  earnedGold: number;
  totalGold: number;
  onRetry: () => void;
  onBackToMenu: () => void;
  onButtonClick: () => void;
}

export const GameOverScreen = ({
  score,
  highScore,
  earnedGold,
  totalGold,
  onRetry,
  onBackToMenu,
  onButtonClick,
}: GameOverScreenProps) => {
  const isNewRecord = score > 0 && score === highScore;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Over</Text>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.highScore}>High Score: {highScore}</Text>

      <View style={styles.goldRow}>
        <MaterialCommunityIcons name="gold" size={18} color="#facc15" />
        <Text style={styles.earnedGold}>Earned: {earnedGold}</Text>
      </View>
      <View style={styles.goldRow}>
        <MaterialCommunityIcons name="gold" size={18} color="#facc15" />
        <Text style={styles.totalGold}>Total Gold: {totalGold}</Text>
      </View>

      {isNewRecord ? <Text style={styles.recordBadge}>New Record!</Text> : null}

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          onButtonClick();
          onRetry();
        }}
      >
        <Text style={styles.buttonText}>Play Again</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          onButtonClick();
          onBackToMenu();
        }}
      >
        <Text style={styles.buttonText}>Main Menu</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: GAME_COLORS.text,
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 20,
  },
  score: {
    color: GAME_COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  highScore: {
    color: GAME_COLORS.accent,
    fontSize: 21,
    marginTop: 10,
    fontWeight: '700',
  },
  goldRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earnedGold: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: '700',
  },
  totalGold: {
    color: '#fde047',
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '700',
  },
  recordBadge: {
    color: '#fbbf24',
    fontSize: 16,
    marginBottom: 26,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 14,
    minWidth: 180,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 14,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: {
    color: GAME_COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
