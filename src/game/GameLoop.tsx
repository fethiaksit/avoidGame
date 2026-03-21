import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  const runtimeRef = useRef<GameRuntime | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const playerY = playArea.height - GAME_CONFIG.player.bottomOffset - GAME_CONFIG.player.size;

  const syncSnapshot = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    setSnapshot({
      playerX: runtime.player.x,
      obstacles: runtime.obstacles,
      score: getScoreFromElapsed(runtime.elapsed),
      level: runtime.level,
      isPaused: !isRunningRef.current,
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
      },
      obstacles: [],
      elapsed: 0,
      level: 0,
      spawnTimer: 0,
    };
    setSnapshot({
      playerX: spawnX,
      obstacles: [],
      score: 0,
      level: 0,
      isPaused: false,
    });
    startLoop();
  }, [playArea.width, playerY, startLoop]);

  const movePlayerToTouch = useCallback(
    (touchX: number) => {
      const runtime = runtimeRef.current;
      if (!runtime || playArea.width <= 0) return;

      const halfSize = runtime.player.size / 2;
      const maxX = playArea.width - runtime.player.size;
      runtime.player.x = Math.max(0, Math.min(touchX - halfSize, maxX));
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
        <Pressable onPress={togglePause} style={styles.pauseButton}>
          <Text style={styles.pauseButtonText}>{snapshot.isPaused ? 'Devam' : 'Duraklat'}</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasContainer} onLayout={onLayout}>
          <Canvas style={styles.canvas}>
            <Player x={snapshot.playerX} y={playerY} size={GAME_CONFIG.player.size} color={GAME_COLORS.player} />
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
