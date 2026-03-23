import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

type SoundKey =
  | 'coin'
  | 'shieldOn'
  | 'shieldBlock'
  | 'crash'
  | 'click'
  | 'gameOver';

type LoadedSounds = Partial<Record<SoundKey, Audio.Sound>>;

const SOUND_SOURCES: Record<SoundKey, number> = {
  coin: require('../../assets/sounds/coin.mp3'),
  shieldOn: require('../../assets/sounds/shield_on.mp3'),
  shieldBlock: require('../../assets/sounds/shield_block.mp3'),
  crash: require('../../assets/sounds/crash.mp3'),
  click: require('../../assets/sounds/click.mp3'),
  gameOver: require('../../assets/sounds/gameover.mp3'),
};

const PLAYBACK_CONFIG: Record<SoundKey, { volume: number; stopBeforeReplay: boolean }> = {
  coin: { volume: 0.9, stopBeforeReplay: true },
  shieldOn: { volume: 1, stopBeforeReplay: true },
  shieldBlock: { volume: 1, stopBeforeReplay: true },
  crash: { volume: 1, stopBeforeReplay: true },
  click: { volume: 0.7, stopBeforeReplay: true },
  gameOver: { volume: 1, stopBeforeReplay: true },
};

export const useGameSounds = () => {
  const soundsRef = useRef<LoadedSounds>({});

  useEffect(() => {
    let isMounted = true;

    const preloadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const loadedSounds: LoadedSounds = {};

        for (const key of Object.keys(SOUND_SOURCES) as SoundKey[]) {
          const { sound } = await Audio.Sound.createAsync(SOUND_SOURCES[key], {
            shouldPlay: false,
            volume: PLAYBACK_CONFIG[key].volume,
            progressUpdateIntervalMillis: 250,
          });
          loadedSounds[key] = sound;
        }

        if (!isMounted) {
          await Promise.all(
            Object.values(loadedSounds).map(async (sound) => {
              if (!sound) return;
              await sound.unloadAsync();
            }),
          );
          return;
        }

        soundsRef.current = loadedSounds;
      } catch {
        soundsRef.current = {};
      }
    };

    preloadSounds();

    return () => {
      isMounted = false;

      const loaded = soundsRef.current;
      soundsRef.current = {};

      void Promise.all(
        Object.values(loaded).map(async (sound) => {
          if (!sound) return;
          try {
            await sound.unloadAsync();
          } catch {
            // no-op: sound might already be unloaded
          }
        }),
      );
    };
  }, []);

  const playSound = useCallback(async (key: SoundKey) => {
    const sound = soundsRef.current[key];
    if (!sound) return;

    const { stopBeforeReplay } = PLAYBACK_CONFIG[key];

    try {
      if (stopBeforeReplay) {
        const status = (await sound.getStatusAsync()) as AVPlaybackStatus;
        if (status.isLoaded && status.isPlaying) {
          await sound.stopAsync();
        }
      }

      await sound.replayAsync();
    } catch {
      // no-op: avoid bubbling transient playback errors during gameplay
    }
  }, []);

  return useMemo(
    () => ({
      playCoin: () => void playSound('coin'),
      playShieldOn: () => void playSound('shieldOn'),
      playShieldBlock: () => void playSound('shieldBlock'),
      playCrash: () => void playSound('crash'),
      playClick: () => void playSound('click'),
      playGameOver: () => void playSound('gameOver'),
    }),
    [playSound],
  );
};
