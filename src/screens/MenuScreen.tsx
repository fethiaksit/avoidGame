import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GAME_COLORS } from '../game/constants';

interface MenuScreenProps {
  highScore: number;
  onStart: () => void;
}

export const MenuScreen = ({ highScore, onStart }: MenuScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>avoid</Text>
      <Text style={styles.subtitle}>Endless Dodge Survival</Text>
      <Text style={styles.highScore}>High Score: {highScore}</Text>

      <Pressable style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Başlat</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: GAME_COLORS.text,
    fontSize: 54,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  subtitle: {
    color: GAME_COLORS.mutedText,
    marginTop: 8,
    marginBottom: 26,
    fontSize: 16,
  },
  highScore: {
    color: GAME_COLORS.accent,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  buttonText: {
    color: GAME_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
