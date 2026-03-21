import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'avoid.highScore.v1';

export const getHighScore = async (): Promise<number> => {
  const raw = await AsyncStorage.getItem(HIGH_SCORE_KEY);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const setHighScore = async (score: number) => {
  await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score));
};

export const saveHighScoreIfNeeded = async (score: number): Promise<number> => {
  const current = await getHighScore();
  if (score > current) {
    await setHighScore(score);
    return score;
  }
  return current;
};
