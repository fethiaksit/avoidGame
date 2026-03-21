import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CharacterSkin, CharacterSkinKey, CHARACTER_SKIN_OPTIONS } from '../game/characters';
import { GAME_COLORS } from '../game/constants';
import { CharacterUnlockMap } from '../types/game';

// Keep undefined when assets/gold.png is not available in the repository.
const GOLD_ICON: number | undefined = undefined;

interface MenuScreenProps {
  highScore: number;
  totalGold: number;
  onStart: () => void;
  selectedSkin: CharacterSkinKey;
  unlockedCharacters: CharacterUnlockMap;
  onSelectSkin: (skin: CharacterSkinKey) => void;
  onUnlockSkin: (skin: CharacterSkinKey) => void;
}

const GoldBadge = ({ amount }: { amount: number }) => (
  <View style={styles.goldRow}>
    {GOLD_ICON ? (
      <Image source={GOLD_ICON} style={styles.goldIcon} resizeMode="contain" />
    ) : (
      <Text style={styles.goldEmoji}>🪙</Text>
    )}
    <Text style={styles.goldText}>{amount}</Text>
  </View>
);

const CharacterCard = ({
  skin,
  gold,
  isUnlocked,
  isSelected,
  onSelect,
  onUnlock,
}: {
  skin: CharacterSkin;
  gold: number;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onUnlock: () => void;
}) => {
  const canAfford = gold >= skin.cost;

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      {skin.image ? (
        <Image source={skin.image} style={styles.previewImage} resizeMode="cover" />
      ) : (
        <View style={[styles.previewFallback, { backgroundColor: skin.placeholderColor }]} />
      )}

      <Text style={styles.skinLabel}>{skin.label}</Text>

      <View style={styles.priceRow}>
        {GOLD_ICON ? <Image source={GOLD_ICON} style={styles.inlineGoldIcon} resizeMode="contain" /> : null}
        <Text style={styles.priceText}>{skin.cost}</Text>
      </View>

      {isUnlocked ? (
        <Pressable
          style={[styles.actionButton, isSelected && styles.actionButtonSelected]}
          onPress={onSelect}
        >
          <Text style={styles.actionButtonText}>{isSelected ? 'Selected' : 'Select'}</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.actionButton, !canAfford && styles.actionButtonDisabled]}
          onPress={onUnlock}
          disabled={!canAfford}
        >
          <Text style={styles.actionButtonText}>{canAfford ? 'Unlock' : 'Not enough gold'}</Text>
        </Pressable>
      )}
    </View>
  );
};

export const MenuScreen = ({
  highScore,
  totalGold,
  onStart,
  selectedSkin,
  unlockedCharacters,
  onSelectSkin,
  onUnlockSkin,
}: MenuScreenProps) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>avoid</Text>
      <Text style={styles.subtitle}>Endless Dodge Survival</Text>
      <Text style={styles.highScore}>High Score: {highScore}</Text>
      <GoldBadge amount={totalGold} />

      <View style={styles.shopSection}>
        <Text style={styles.sectionTitle}>Characters</Text>
        <View style={styles.shopGrid}>
          {CHARACTER_SKIN_OPTIONS.map((skin) => (
            <CharacterCard
              key={skin.key}
              skin={skin}
              gold={totalGold}
              isUnlocked={unlockedCharacters[skin.key]}
              isSelected={selectedSkin === skin.key}
              onSelect={() => onSelectSkin(skin.key)}
              onUnlock={() => onUnlockSkin(skin.key)}
            />
          ))}
        </View>
      </View>

      <Pressable style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Başlat</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: GAME_COLORS.background,
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
    marginBottom: 14,
    fontSize: 16,
  },
  highScore: {
    color: GAME_COLORS.accent,
    fontSize: 20,
    fontWeight: '700',
  },
  goldRow: {
    marginTop: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  goldIcon: {
    width: 18,
    height: 18,
  },
  goldEmoji: {
    fontSize: 16,
  },
  goldText: {
    color: '#facc15',
    fontSize: 16,
    fontWeight: '800',
  },
  shopSection: {
    width: '100%',
    marginBottom: 26,
  },
  sectionTitle: {
    color: GAME_COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  shopGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    width: '48%',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: GAME_COLORS.accent,
  },
  previewImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginBottom: 6,
  },
  previewFallback: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginBottom: 6,
  },
  skinLabel: {
    color: GAME_COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  inlineGoldIcon: {
    width: 14,
    height: 14,
  },
  priceText: {
    color: '#facc15',
    fontSize: 13,
    fontWeight: '700',
  },
  actionButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#374151',
  },
  actionButtonSelected: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    color: GAME_COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginBottom: 20,
  },
  buttonText: {
    color: GAME_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
