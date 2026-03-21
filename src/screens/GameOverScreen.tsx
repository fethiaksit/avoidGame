import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GAME_COLORS } from '../game/constants';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  earnedGold: number;
  onRetry: () => void;
  onBackToMenu: () => void;
}

export const GameOverScreen = ({
  score,
  highScore,
  earnedGold,
  onRetry,
  onBackToMenu,
}: GameOverScreenProps) => {
  const isNewRecord = score > 0 && score === highScore;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oyun Bitti</Text>
      <Text style={styles.score}>Skor: {score}</Text>
      <Text style={styles.highScore}>High Score: {highScore}</Text>
      <Text style={styles.earnedGold}>Earned Gold: 🪙 {earnedGold}</Text>
      {isNewRecord ? <Text style={styles.recordBadge}>Yeni Rekor!</Text> : null}

      <Pressable style={styles.primaryButton} onPress={onRetry}>
        <Text style={styles.buttonText}>Tekrar Oyna</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onBackToMenu}>
        <Text style={styles.buttonText}>Ana Menü</Text>
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
  earnedGold: {
    color: '#facc15',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
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
