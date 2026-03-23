import React, { memo } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GAME_COLORS } from '../game/constants';

interface PauseMenuModalProps {
  visible: boolean;
  soundEnabled: boolean;
  onSoundEnabledChange: (value: boolean) => void;
  onResume: () => void;
  onRestart?: () => void;
  onRequestClose: () => void;
}

export const PauseMenuModal = memo(
  ({
    visible,
    soundEnabled,
    onSoundEnabledChange,
    onResume,
    onRestart,
    onRequestClose,
  }: PauseMenuModalProps) => {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="pause-circle" size={46} color="#60a5fa" />
            <Text style={styles.modalTitle}>Paused</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch value={soundEnabled} onValueChange={onSoundEnabledChange} />
            </View>

            <Pressable style={styles.modalPrimaryButton} onPress={onResume}>
              <Text style={styles.modalButtonText}>Resume</Text>
            </Pressable>

            {onRestart ? (
              <Pressable style={styles.modalSecondaryButton} onPress={onRestart}>
                <Text style={styles.modalButtonText}>Restart</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    color: GAME_COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  settingRow: {
    width: '100%',
    marginTop: 6,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  settingLabel: {
    color: GAME_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    marginTop: 6,
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalSecondaryButton: {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalButtonText: {
    color: GAME_COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
