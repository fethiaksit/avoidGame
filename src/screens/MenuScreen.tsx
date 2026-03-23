import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { CharacterSkin, CharacterSkinKey, CHARACTER_SKIN_OPTIONS } from '../game/characters';
import { GAME_COLORS } from '../game/constants';
import { CharacterUnlockMap } from '../types/game';

interface MenuScreenProps {
  highScore: number;
  totalGold: number;
  onStart: () => void;
  selectedSkin: CharacterSkinKey;
  unlockedCharacters: CharacterUnlockMap;
  onSelectSkin: (skin: CharacterSkinKey) => void;
  onUnlockSkin: (skin: CharacterSkinKey) => void;
  onButtonClick: () => void;
}

const GoldBadge = ({ amount }: { amount: number }) => (
  <View style={styles.goldRow}>
    <MaterialCommunityIcons name="gold" size={20} color="#facc15" />
    <View>
      <Text style={styles.goldLabel}>Total Gold</Text>
      <Text style={styles.goldText}>{amount}</Text>
    </View>
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
  const stateText = isSelected ? 'Selected' : isUnlocked ? 'Unlocked' : 'Locked';

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <View style={styles.previewWrap}>
        {skin.image ? (
          <Image source={skin.image} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={[styles.previewFallback, { backgroundColor: skin.placeholderColor }]} />
        )}
      </View>

      <Text style={styles.skinLabel}>{skin.label}</Text>
      <Text style={[styles.stateText, isSelected && styles.stateTextSelected]}>{stateText}</Text>

      <View style={styles.priceRow}>
        <MaterialCommunityIcons name="gold" size={14} color="#facc15" />
        <Text style={styles.priceText}>{skin.cost}</Text>
      </View>

      {isUnlocked ? (
        <Pressable
          style={[styles.actionButton, isSelected && styles.actionButtonSelected]}
          onPress={onSelect}
          disabled={isSelected}
        >
          <Text style={styles.actionButtonText}>{isSelected ? 'Using' : 'Select'}</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.actionButton, !canAfford && styles.actionButtonDisabled]}
          onPress={onUnlock}
          disabled={!canAfford}
        >
          <Text style={styles.actionButtonText}>{canAfford ? 'Buy' : 'Need more gold'}</Text>
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
  onButtonClick,
}: MenuScreenProps) => {
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  return (
    <ScrollView contentContainerStyle={[styles.container, !isStoreOpen && styles.menuCentered]}>
      {!isStoreOpen ? (
        <>
          <Text style={styles.title}>avoid</Text>
          <Text style={styles.subtitle}>Endless Dodge Survival</Text>
          <Text style={styles.highScore}>High Score: {highScore}</Text>
          <GoldBadge amount={totalGold} />

          <Pressable
            style={styles.storeButton}
            onPress={() => {
              onButtonClick();
              setIsStoreOpen(true);
            }}
          >
            <Ionicons name="storefront" size={20} color={GAME_COLORS.text} />
            <Text style={styles.storeButtonText}>Store</Text>
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={() => {
              onButtonClick();
              onStart();
            }}
          >
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.shopSection}>
          <Pressable
            style={styles.storeBackButton}
            onPress={() => {
              onButtonClick();
              setIsStoreOpen(false);
            }}
          >
            <Ionicons name="arrow-back" size={18} color={GAME_COLORS.text} />
            <Text style={styles.storeBackButtonText}>Back</Text>
          </Pressable>

          <View style={styles.shopHeaderRow}>
            <View style={styles.shopHeader}>
              <Ionicons name="storefront" size={20} color={GAME_COLORS.text} />
              <Text style={styles.sectionTitle}>Shop</Text>
            </View>

            <View style={styles.shopGoldRow}>
              <MaterialCommunityIcons name="gold" size={16} color="#facc15" />
              <Text style={styles.shopGoldText}>{totalGold}</Text>
            </View>
          </View>

          <Text style={styles.sectionSubtitle}>Characters</Text>

          <View style={styles.shopGrid}>
            {CHARACTER_SKIN_OPTIONS.map((skin) => (
              <CharacterCard
                key={skin.key}
                skin={skin}
                gold={totalGold}
                isUnlocked={unlockedCharacters[skin.key]}
                isSelected={selectedSkin === skin.key}
                onSelect={() => {
                  onButtonClick();
                  onSelectSkin(skin.key);
                }}
                onUnlock={() => {
                  onButtonClick();
                  onUnlockSkin(skin.key);
                }}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: GAME_COLORS.background,
  },
  menuCentered: {
    justifyContent: 'center',
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
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#4b5563',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  goldLabel: {
    color: GAME_COLORS.mutedText,
    fontSize: 12,
    textAlign: 'center',
  },
  goldText: {
    color: '#facc15',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  shopSection: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 14,
    padding: 12,
    marginBottom: 26,
    backgroundColor: '#0f172a',
  },
  storeBackButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  storeBackButtonText: {
    color: GAME_COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  shopGoldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111827',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  shopGoldText: {
    color: '#facc15',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    color: GAME_COLORS.text,
    fontSize: 21,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: GAME_COLORS.mutedText,
    marginBottom: 10,
    fontSize: 13,
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
    backgroundColor: '#1e293b',
  },
  previewWrap: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: '#1f2937',
    marginBottom: 6,
  },
  previewImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  previewFallback: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  skinLabel: {
    color: GAME_COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  stateText: {
    color: GAME_COLORS.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  stateTextSelected: {
    color: '#34d399',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
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
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginBottom: 14,
  },
  storeButtonText: {
    color: GAME_COLORS.text,
    fontSize: 18,
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
