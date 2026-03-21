export const getScoreFromElapsed = (elapsedSeconds: number): number => {
  return Math.max(0, Math.floor(elapsedSeconds * 10));
};

export const getDifficultyLevel = (
  elapsedSeconds: number,
  intervalSeconds: number,
  maxLevel: number,
): number => {
  const rawLevel = Math.floor(elapsedSeconds / intervalSeconds);
  return Math.min(maxLevel, rawLevel);
};
