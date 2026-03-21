import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useFrameCallback, useSharedValue } from 'react-native-reanimated';

import { GAME_COLORS, GAME_CONFIG } from './constants';
import { hasCollision } from './collision';
import { createObstacle, getSpawnInterval, updateObstacles } from './obstacleManager';
import { getDifficultyLevel, getScoreFromElapsed } from './scoreManager';
import { Obstacle } from '../components/Obstacle';
import { Player } from '../components/Player';
import { GameSnapshot, ObstacleEntity, PlayerEntity } from '../types/game';

interface GameLoopProps {
  onGameOver: (score: number) => void;
}

interface GameRuntime {
  player: PlayerEntity;
  obstacles: ObstacleEntity[];
  elapsed: number;
  level: number;
  spawnTimer: number;
  direction: number;
}

export const GameLoop = ({ onGameOver }: GameLoopProps) => {
  const [playArea, setPlayArea] = useState({ width: 0, height: 0 });
  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    playerX: 0,
    obstacles: [],
    score: 0,
    level: 0,
    isPaused: false,
  });

  const isRunning = useSharedValue(true);
  const runtimeRef = useRef<GameRuntime | null>(null);

  const initRuntime = useCallback(() => {
    const playerY = playArea.height - GAME_CONFIG.player.bottomOffset - GAME_CONFIG.player.size;
    runtimeRef.current = {
      player: {
        x: Math.max(0, playArea.width / 2 - GAME_CONFIG.player.size / 2),
        y: playerY,
        size: GAME_CONFIG.player.size,
        speed: GAME_CONFIG.player.speed,
      },
      obstacles: [],
      elapsed: 0,
      level: 0,
      spawnTimer: 0,
      direction: 0,
    };
    setSnapshot({
      playerX: Math.max(0, playArea.width / 2 - GAME_CONFIG.player.size / 2),
      obstacles: [],
      score: 0,
      level: 0,
      isPaused: false,
    });
  }, [playArea.height, playArea.width]);

  const gameOver = useCallback(() => {
    isRunning.value = false;
    const finalScore = runtimeRef.current ? getScoreFromElapsed(runtimeRef.current.elapsed) : 0;
    onGameOver(finalScore);
  }, [isRunning, onGameOver]);

  const onFrame = useCallback(
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

      runtime.player.x += runtime.direction * runtime.player.speed * clampedDt;
      runtime.player.x = Math.max(0, Math.min(runtime.player.x, playArea.width - runtime.player.size));

      runtime.spawnTimer += clampedDt;
      const spawnInterval = getSpawnInterval(runtime.level);
      const shouldSpawn =
        runtime.spawnTimer >= spawnInterval &&
        runtime.obstacles.length < GAME_CONFIG.spawn.maxOnScreen;

      if (shouldSpawn) {
        runtime.spawnTimer = 0;
        runtime.obstacles.push(createObstacle(playArea.width, runtime.level));
      }

      runtime.obstacles = updateObstacles(runtime.obstacles, clampedDt, playArea.height);

      if (hasCollision(runtime.player, runtime.obstacles)) {
        gameOver();
        return;
      }

      setSnapshot({
        playerX: runtime.player.x,
        obstacles: runtime.obstacles,
        score: getScoreFromElapsed(runtime.elapsed),
        level: runtime.level,
        isPaused: !isRunning.value,
      });
    },
    [gameOver, isRunning, playArea.height, playArea.width],
  );

  useFrameCallback((frame) => {
    if (!isRunning.value || !runtimeRef.current) return;
    const dtMs = frame.timeSincePreviousFrame ?? 16;
    runOnJS(onFrame)(dtMs / 1000);
  }, true);

  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          if (runtimeRef.current) {
            runtimeRef.current.direction = 0;
          }
        })
        .onChange((event) => {
          if (!runtimeRef.current) return;
          // Drag kontrolünü seçtik çünkü tek hareketle doğal ve stabil bir yatay kontrol sağlıyor.
          const nextX = runtimeRef.current.player.x + event.changeX;
          const maxX = playArea.width - runtimeRef.current.player.size;
          runtimeRef.current.player.x = Math.max(0, Math.min(nextX, maxX));
        })
        .onEnd(() => {
          if (runtimeRef.current) {
            runtimeRef.current.direction = 0;
          }
        }),
    [playArea.width],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setPlayArea({ width, height });
      if (width > 0 && height > 0) {
        requestAnimationFrame(() => {
          initRuntime();
          isRunning.value = true;
        });
      }
    },
    [initRuntime, isRunning],
  );

  const togglePause = useCallback(() => {
    isRunning.value = !isRunning.value;
    setSnapshot((prev) => ({ ...prev, isPaused: !isRunning.value }));
  }, [isRunning]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Skor: {snapshot.score}</Text>
        <Text style={styles.headerText}>Seviye: {snapshot.level + 1}</Text>
        <Pressable onPress={togglePause} style={styles.pauseButton}>
          <Text style={styles.pauseButtonText}>{snapshot.isPaused ? 'Devam' : 'Duraklat'}</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={dragGesture}>
        <View style={styles.canvasContainer} onLayout={onLayout}>
          <Canvas style={styles.canvas}>
            <Player
              x={snapshot.playerX}
              y={playArea.height - GAME_CONFIG.player.bottomOffset - GAME_CONFIG.player.size}
              size={GAME_CONFIG.player.size}
              color={GAME_COLORS.player}
            />
            {snapshot.obstacles.map((obstacle) => (
              <Obstacle
                key={obstacle.id}
                x={obstacle.x}
                y={obstacle.y}
                width={obstacle.width}
                height={obstacle.height}
                color={GAME_COLORS.obstacle}
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
