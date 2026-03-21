import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { GAME_COLORS, GAME_CONFIG } from './constants';
import { getCollectedPowerUpIndexes, getFirstCollidingObstacleIndex } from './collision';
import {
  createObstacle,
  createShieldPowerUp,
  getSpawnInterval,
  shouldSpawnShieldPowerUp,
  updateObstacles,
  updatePowerUps,
} from './obstacleManager';
import { getDifficultyLevel, getScoreFromElapsed } from './scoreManager';
import { Obstacle } from '../components/Obstacle';
import { Player } from '../components/Player';
import { PowerUp } from '../components/PowerUp';
import { GameSnapshot, ObstacleEntity, PlayerEntity, PowerUpEntity } from '../types/game';

interface GameLoopProps {
  onGameOver: (score: number) => void;
}

interface GameRuntime {
  player: PlayerEntity;
  obstacles: ObstacleEntity[];
  powerUps: PowerUpEntity[];
  elapsed: number;
  level: number;
  spawnTimer: number;
  shields: number;
}

export const GameLoop = ({ onGameOver }: GameLoopProps) => {
  const [playArea, setPlayArea] = useState({ width: 0, height: 0 });
  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    playerX: 0,
    obstacles: [],
    powerUps: [],
    score: 0,
    level: 0,
    isPaused: false,
    shields: 0,
  });

  const runtimeRef = useRef<GameRuntime | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const playerY = useMemo(
    () => playArea.height - GAME_CONFIG.player.bottomOffset - GAME_CONFIG.player.size,
    [playArea.height],
  );

  const syncSnapshot = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    setSnapshot({
      playerX: runtime.player.x,
      obstacles: runtime.obstacles,
      powerUps: runtime.powerUps,
      score: getScoreFromElapsed(runtime.elapsed),
      level: runtime.level,
      isPaused: !isRunningRef.current,
      shields: runtime.shields,
    });
  }, []);

  const stopLoop = useCallback(() => {
    isRunningRef.current = false;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    lastFrameTimeRef.current = null;
  }, []);

  const gameOver = useCallback(() => {
    stopLoop();
    const finalScore = runtimeRef.current ? getScoreFromElapsed(runtimeRef.current.elapsed) : 0;
    onGameOver(finalScore);
  }, [onGameOver, stopLoop]);

  const updateFrame = useCallback(
    (dt: number) => {
      const runtime = runtimeRef.current;
      if (!runtime || playArea.width <= 0 || playArea.height <= 0) {
        return;
      }

      const clampedDt = Math.min(dt, 0.05);
      runtime.elapsed += clampedDt;
      runtime.level = getDifficultyLevel(
        runtime.elapsed,
        GAME_CONFIG.difficulty.intervalSeconds,
        GAME_CONFIG.difficulty.maxLevel,
      );

      const maxX = playArea.width - runtime.player.size;
      const clampedTargetX = Math.max(0, Math.min(runtime.player.targetX, maxX));
      const smoothingStep = 1 - Math.exp(-GAME_CONFIG.player.smoothing * clampedDt);
      runtime.player.x += (clampedTargetX - runtime.player.x) * smoothingStep;
      runtime.player.x = Math.max(0, Math.min(runtime.player.x, maxX));

      runtime.spawnTimer += clampedDt;
      const spawnInterval = getSpawnInterval(runtime.elapsed);
      const shouldSpawnEnemy =
        runtime.spawnTimer >= spawnInterval &&
        runtime.obstacles.length < GAME_CONFIG.spawn.maxOnScreen;

      if (shouldSpawnEnemy) {
        runtime.spawnTimer = 0;
        runtime.obstacles.push(createObstacle(playArea.width, runtime.level, runtime.elapsed));
      }

      const shouldSpawnShield =
        runtime.powerUps.length < GAME_CONFIG.powerUp.maxOnScreen && shouldSpawnShieldPowerUp(clampedDt);

      if (shouldSpawnShield) {
        runtime.powerUps.push(createShieldPowerUp(playArea.width));
      }

      runtime.obstacles = updateObstacles(runtime.obstacles, clampedDt, playArea.width, playArea.height);
      runtime.powerUps = updatePowerUps(runtime.powerUps, clampedDt, playArea.height);

      const collectedPowerUpIndexes = getCollectedPowerUpIndexes(runtime.player, runtime.powerUps);
      if (collectedPowerUpIndexes.length > 0) {
        runtime.shields += collectedPowerUpIndexes.length;
        runtime.powerUps = runtime.powerUps.filter((_, index) => !collectedPowerUpIndexes.includes(index));
      }

      const collisionIndex = getFirstCollidingObstacleIndex(runtime.player, runtime.obstacles);
      if (collisionIndex !== -1) {
        if (runtime.shields > 0) {
          runtime.shields -= 1;
          runtime.obstacles.splice(collisionIndex, 1);
        } else {
          gameOver();
          return;
        }
      }

      syncSnapshot();
    },
    [gameOver, playArea.height, playArea.width, syncSnapshot],
  );

  const loop = useCallback(
    (time: number) => {
      if (!isRunningRef.current) return;

      const last = lastFrameTimeRef.current ?? time;
      lastFrameTimeRef.current = time;
      updateFrame((time - last) / 1000);

      if (isRunningRef.current) {
        rafIdRef.current = requestAnimationFrame(loop);
      }
    },
    [updateFrame],
  );

  const startLoop = useCallback(() => {
    if (isRunningRef.current || !runtimeRef.current) return;
    isRunningRef.current = true;
    setSnapshot((prev) => ({ ...prev, isPaused: false }));
    lastFrameTimeRef.current = null;
    rafIdRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const initRuntime = useCallback(() => {
    const spawnX = Math.max(0, playArea.width / 2 - GAME_CONFIG.player.size / 2);
    runtimeRef.current = {
      player: {
        x: spawnX,
        y: playerY,
        size: GAME_CONFIG.player.size,
        speed: GAME_CONFIG.player.speed,
        targetX: spawnX,
      },
      obstacles: [],
      powerUps: [],
      elapsed: 0,
      level: 0,
      spawnTimer: 0,
      shields: 0,
    };
    setSnapshot({
      playerX: spawnX,
      obstacles: [],
      powerUps: [],
      score: 0,
      level: 0,
      isPaused: false,
      shields: 0,
    });
    startLoop();
  }, [playArea.width, playerY, startLoop]);

  const movePlayerToTouch = useCallback(
    (touchX: number) => {
      const runtime = runtimeRef.current;
      if (!runtime || playArea.width <= 0) return;

      const halfSize = runtime.player.size / 2;
      const maxX = playArea.width - runtime.player.size;
      const targetX = Math.max(0, Math.min(touchX - halfSize, maxX));

      runtime.player.targetX = targetX;
      runtime.player.x += (targetX - runtime.player.x) * 0.45;
      runtime.player.x = Math.max(0, Math.min(runtime.player.x, maxX));
      syncSnapshot();
    },
    [playArea.width, syncSnapshot],
  );

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      runOnJS(movePlayerToTouch)(event.x);
    })
    .onUpdate((event) => {
      runOnJS(movePlayerToTouch)(event.x);
    })
    .onStart((event) => {
      runOnJS(movePlayerToTouch)(event.x);
    });

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (width === playArea.width && height === playArea.height) return;
      stopLoop();
      setPlayArea({ width, height });
    },
    [playArea.height, playArea.width, stopLoop],
  );

  const togglePause = useCallback(() => {
    if (isRunningRef.current) {
      stopLoop();
      setSnapshot((prev) => ({ ...prev, isPaused: true }));
      return;
    }

    if (!runtimeRef.current) {
      initRuntime();
      return;
    }

    startLoop();
  }, [initRuntime, startLoop, stopLoop]);

  useEffect(() => {
    if (playArea.width > 0 && playArea.height > 0) {
      initRuntime();
    }
  }, [initRuntime, playArea.height, playArea.width]);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Skor: {snapshot.score}</Text>
        <Text style={styles.headerText}>Seviye: {snapshot.level + 1}</Text>
        <Text style={styles.headerText}>Kalkan: {snapshot.shields}</Text>
        <Pressable onPress={togglePause} style={styles.pauseButton}>
          <Text style={styles.pauseButtonText}>{snapshot.isPaused ? 'Devam' : 'Duraklat'}</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasContainer} onLayout={onLayout}>
          <Canvas style={styles.canvas}>
            <Player
              x={snapshot.playerX}
              y={playerY}
              size={GAME_CONFIG.player.size}
              color={GAME_COLORS.player}
              hasShield={snapshot.shields > 0}
            />
            {snapshot.obstacles.map((obstacle) => (
              <Obstacle
                key={obstacle.id}
                x={obstacle.x}
                y={obstacle.y}
                width={obstacle.width}
                height={obstacle.height}
                color={
                  obstacle.type === 'zigzag' ? GAME_COLORS.zigzagObstacle : GAME_COLORS.obstacle
                }
              />
            ))}
            {snapshot.powerUps.map((powerUp) => (
              <PowerUp
                key={powerUp.id}
                x={powerUp.x}
                y={powerUp.y}
                width={powerUp.width}
                height={powerUp.height}
                color={GAME_COLORS.shieldPowerUp}
              />
            ))}
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: GAME_COLORS.panel,
    gap: 10,
  },
  headerText: {
    color: GAME_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pauseButtonText: {
    color: GAME_COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
  canvas: {
    flex: 1,
  },
});
