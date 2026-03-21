import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CharacterSkinKey, CHARACTER_SKIN_OPTIONS } from '../game/characters';
import { GAME_COLORS } from '../game/constants';

interface MenuScreenProps {
  highScore: number;
  onStart: () => void;
  selectedSkin: CharacterSkinKey;
  onSelectSkin: (skin: CharacterSkinKey) => void;
}

export const MenuScreen = ({ highScore, onStart, selectedSkin, onSelectSkin }: MenuScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>avoid</Text>
      <Text style={styles.subtitle}>Endless Dodge Survival</Text>
      <Text style={styles.highScore}>High Score: {highScore}</Text>

      <View style={styles.skinSection}>
        <Text style={styles.skinSectionTitle}>Character</Text>
        <View style={styles.skinOptionsRow}>
          {CHARACTER_SKIN_OPTIONS.map((skin) => {
            const isSelected = selectedSkin === skin.key;
            return (
              <Pressable
                key={skin.key}
                style={[styles.skinOption, isSelected && styles.skinOptionSelected]}
                onPress={() => onSelectSkin(skin.key)}
              >
                <View style={[styles.skinPreview, { backgroundColor: skin.placeholderColor }]} />
                <Text style={styles.skinLabel}>{skin.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

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
    marginBottom: 24,
  },
  skinSection: {
    width: '100%',
    marginBottom: 30,
  },
  skinSectionTitle: {
    color: GAME_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  skinOptionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  skinOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  skinOptionSelected: {
    borderColor: GAME_COLORS.accent,
  },
  skinPreview: {
    width: 26,
    height: 26,
    borderRadius: 4,
    marginBottom: 7,
  },
  skinLabel: {
    color: GAME_COLORS.text,
    fontSize: 12,
    fontWeight: '600',
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
