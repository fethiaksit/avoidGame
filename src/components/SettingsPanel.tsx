import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GAME_COLORS } from '../game/constants';

interface SettingsPanelProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSoundEnabledChange: (value: boolean) => void;
  onButtonClick: () => void;
}

export const SettingsPanel = ({
  isOpen,
  soundEnabled,
  onOpen,
  onClose,
  onSoundEnabledChange,
  onButtonClick,
}: SettingsPanelProps) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable
        style={[
          styles.settingsButton,
          {
            top: Math.max(insets.top + 8, 12),
            right: Math.max(insets.right + 12, 12),
          },
        ]}
        onPress={() => {
          onButtonClick();
          onOpen();
        }}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
      >
        <Ionicons name="settings-sharp" size={18} color={GAME_COLORS.text} />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />

          <View style={styles.panel}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Settings</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  onButtonClick();
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="Close settings"
              >
                <Ionicons name="close" size={18} color={GAME_COLORS.text} />
              </Pressable>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch value={soundEnabled} onValueChange={onSoundEnabledChange} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  panel: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: GAME_COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: GAME_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
