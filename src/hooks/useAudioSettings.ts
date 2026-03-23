import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_ENABLED_KEY = '@avoid:soundEnabled';

export const useAudioSettings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSettingsReady, setIsSettingsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
        if (!isMounted) return;

        if (storedValue === null) {
          setSoundEnabled(true);
        } else {
          setSoundEnabled(storedValue === 'true');
        }
      } catch {
        if (isMounted) {
          setSoundEnabled(true);
        }
      } finally {
        if (isMounted) {
          setIsSettingsReady(true);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSoundEnabled = useCallback(async (nextValue: boolean) => {
    setSoundEnabled(nextValue);

    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, String(nextValue));
    } catch {
      // no-op: keep UI responsive even if persistence fails
    }
  }, []);

  return {
    soundEnabled,
    isSettingsReady,
    setSoundEnabled: updateSoundEnabled,
  };
};
