import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { CHARACTER_SKINS, CharacterSkinKey } from './characters';
import { GAME_COLORS, GAME_CONFIG } from './constants';
import { getCollectedGoldIndexes, getCollectedPowerUpIndexes, getFirstCollidingObstacleIndex } from './collision';
import {
  createGold,
  createObstacle,
  createShieldPowerUp,
  getSpawnInterval,
  shouldSpawnGold,
  shouldSpawnShieldPowerUp,
  updateGold,
  updateObstacles,
  updatePowerUps,
} from './obstacleManager';
import { getDifficultyLevel, getScoreFromElapsed } from './scoreManager';
import { Obstacle } from '../components/Obstacle';
import { Player } from '../components/Player';
import { PowerUp } from '../components/PowerUp';
import { Gold } from '../components/Gold';
import { GameSnapshot, GoldEntity, ObstacleEntity, PlayerEntity, PowerUpEntity } from '../types/game';

interface GameLoopProps {
  onGameOver: (score: number, earnedGold: number) => void;
  onRestart: () => void;
  onSpendGold: (amount: number) => Promise<void>;
  selectedSkin: CharacterSkinKey;
  totalGold: number;
  onCoinPickup: () => void;
  onShieldPickup: () => void;
  onShieldBlock: () => void;
  onCrash: () => void;
  onButtonClick: () => void;
}

interface GameRuntime {
  player: PlayerEntity;
  obstacles: ObstacleEntity[];
  powerUps: PowerUpEntity[];
  goldItems: GoldEntity[];
  earnedGold: number;
  elapsed: number;
  level: number;
  spawnTimer: number;
  shields: number;
  hasRevived: boolean;
  invulnerableUntil: number;
}

const POWER_UP_RENDER_SCALE = 2;
const SNAPSHOT_INTERVAL_SECONDS = 1 / 30;

type OverlayType = 'none' | 'pause' | 'revive';

const removeIndexesInPlace = <T,>(items: T[], indexes: number[]) => {
  if (indexes.length === 0) return;
  const removeSet = new Set(indexes);
  let writeIndex = 0;
  for (let index = 0; index < items.length; index += 1) {
    if (!removeSet.has(index)) {
      items[writeIndex] = items[index];
      writeIndex += 1;
    }
  }
  items.length = writeIndex;
};

export const GameLoop = ({
  onGameOver,
  onRestart,
  onSpendGold,
  selectedSkin,
  totalGold,
  onCoinPickup,
  onShieldPickup,
  onShieldBlock,
  onCrash,
  onButtonClick,
}: GameLoopProps) => {
  const selectedCharacterSkin = useMemo(() => CHARACTER_SKINS[selectedSkin], [selectedSkin]);
  const playerSize = useMemo(() => {
    const baseSize = GAME_CONFIG.player.size;
    const multiplier = selectedCharacterSkin.sizeMultiplier ?? 1;
    return baseSize * multiplier;
  }, [selectedCharacterSkin]);
  const playerObstacleCollisionScale = useMemo(
    () => selectedCharacterSkin.obstacleCollisionScale ?? 1,
    [selectedCharacterSkin],
  );

  const [playArea, setPlayArea] = useState({ width: 0, height: 0 });
  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    playerX: 0,
    obstacles: [],
    powerUps: [],
    goldItems: [],
    score: 0,
    level: 0,
    isPaused: false,
    shields: 0,
    earnedGold: 0,
    hasInvulnerability: false,
  });
  const [overlayType, setOverlayType] = useState<OverlayType>('none');
  const [isSpendingGold, setIsSpendingGold] = useState(false);

  const runtimeRef = useRef<GameRuntime | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const loopInstanceIdRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const lastSnapshotTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);
  const latestTouchXRef = useRef<number | null>(null);

  const playerY = useMemo(
    () => Math.max(0, playArea.height - GAME_CONFIG.player.bottomOffset - playerSize),
    [playArea.height, playerSize],
  );

  const syncSnapshot = useCallback((force = false) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    if (!force && runtime.elapsed - lastSnapshotTimeRef.current < SNAPSHOT_INTERVAL_SECONDS) {
      return;
    }

    lastSnapshotTimeRef.current = runtime.elapsed;

    setSnapshot({
      playerX: runtime.player.x,
      obstacles: [...runtime.obstacles],
      powerUps: [...runtime.powerUps],
      score: getScoreFromElapsed(runtime.elapsed),
      level: runtime.level,
      isPaused: !isRunningRef.current,
      shields: runtime.shields,
      goldItems: [...runtime.goldItems],
      earnedGold: runtime.earnedGold,
      hasInvulnerability: runtime.elapsed < runtime.invulnerableUntil,
    });
  }, []);

  const stopLoop = useCallback(() => {
    isRunningRef.current = false;
    loopInstanceIdRef.current += 1;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    lastFrameTimeRef.current = null;
  }, []);

  const gameOver = useCallback(() => {
    stopLoop();
    const finalScore = runtimeRef.current ? getScoreFromElapsed(runtimeRef.current.elapsed) : 0;
    const earnedGold = runtimeRef.current?.earnedGold ?? 0;
    onGameOver(finalScore, earnedGold);
  }, [onGameOver, stopLoop]);

  const openReviveOverlay = useCallback(() => {
    stopLoop();
    setOverlayType('revive');
    setSnapshot((prev) => ({ ...prev, isPaused: true }));
  }, [stopLoop]);

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

      const maxX = Math.max(0, playArea.width - runtime.player.size);
      const clampedTargetX = Math.max(0, Math.min(runtime.player.targetX, maxX));
      const smoothingStep = 1 - Math.exp(-GAME_CONFIG.player.smoothing * clampedDt);
      const interpolatedDelta = (clampedTargetX - runtime.player.x) * smoothingStep;
      const maxMovementPerFrame = runtime.player.speed * clampedDt;
      const clampedDelta = Math.max(
        -maxMovementPerFrame,
        Math.min(interpolatedDelta, maxMovementPerFrame),
      );

      runtime.player.x += clampedDelta;
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

      if (
        runtime.powerUps.length < GAME_CONFIG.powerUp.maxOnScreen &&
        shouldSpawnShieldPowerUp(clampedDt)
      ) {
        runtime.powerUps.push(createShieldPowerUp(playArea.width));
      }

      if (runtime.goldItems.length < GAME_CONFIG.gold.maxOnScreen && shouldSpawnGold(clampedDt)) {
        runtime.goldItems.push(createGold(playArea.width));
      }

      updateObstacles(runtime.obstacles, clampedDt, playArea.width, playArea.height);
      updatePowerUps(runtime.powerUps, clampedDt, playArea.height);
      updateGold(runtime.goldItems, clampedDt, playArea.height);

      const collectedPowerUpIndexes = getCollectedPowerUpIndexes(runtime.player, runtime.powerUps);
      if (collectedPowerUpIndexes.length > 0) {
        runtime.shields += collectedPowerUpIndexes.length;
        removeIndexesInPlace(runtime.powerUps, collectedPowerUpIndexes);
        onShieldPickup();
      }

      const collectedGoldIndexes = getCollectedGoldIndexes(runtime.player, runtime.goldItems);
      if (collectedGoldIndexes.length > 0) {
        runtime.earnedGold += collectedGoldIndexes.length;
        removeIndexesInPlace(runtime.goldItems, collectedGoldIndexes);
        onCoinPickup();
      }

      const collisionIndex = getFirstCollidingObstacleIndex(runtime.player, runtime.obstacles);
      if (collisionIndex !== -1) {
        if (runtime.shields > 0) {
          runtime.shields -= 1;
          runtime.obstacles.splice(collisionIndex, 1);
          onShieldBlock();
        } else if (runtime.elapsed < runtime.invulnerableUntil) {
          runtime.obstacles.splice(collisionIndex, 1);
        } else if (!runtime.hasRevived) {
          onCrash();
          openReviveOverlay();
          syncSnapshot(true);
          return;
        } else {
          onCrash();
          gameOver();
          return;
        }
      }

      syncSnapshot();
    },
    [
      gameOver,
      onCoinPickup,
      onCrash,
      onShieldBlock,
      onShieldPickup,
      openReviveOverlay,
      playArea.height,
      playArea.width,
      syncSnapshot,
    ],
  );

  const loop = useCallback(
    (time: number, loopId: number) => {
      if (!isRunningRef.current || loopId !== loopInstanceIdRef.current) return;

      const last = lastFrameTimeRef.current ?? time;
      lastFrameTimeRef.current = time;
      updateFrame((time - last) / 1000);

      if (isRunningRef.current && loopId === loopInstanceIdRef.current) {
        rafIdRef.current = requestAnimationFrame((nextTime) => loop(nextTime, loopId));
      }
    },
    [updateFrame],
  );

  const startLoop = useCallback(() => {
    if (isRunningRef.current || !runtimeRef.current) return;
    isRunningRef.current = true;
    const loopId = loopInstanceIdRef.current + 1;
    loopInstanceIdRef.current = loopId;
    setSnapshot((prev) => ({ ...prev, isPaused: false }));
    lastFrameTimeRef.current = null;
    rafIdRef.current = requestAnimationFrame((time) => loop(time, loopId));
  }, [loop]);

  const initRuntime = useCallback((width: number, height: number) => {
    const spawnX = Math.max(0, width / 2 - playerSize / 2);
    const spawnY = Math.max(0, height - GAME_CONFIG.player.bottomOffset - playerSize);

    runtimeRef.current = {
      player: {
        x: spawnX,
        y: spawnY,
        size: playerSize,
        speed: GAME_CONFIG.player.speed,
        targetX: spawnX,
        obstacleCollisionScale: playerObstacleCollisionScale,
      },
      obstacles: [],
      powerUps: [],
      goldItems: [],
      earnedGold: 0,
      elapsed: 0,
      level: 0,
      spawnTimer: 0,
      shields: 0,
      hasRevived: false,
      invulnerableUntil: 0,
    };

    lastSnapshotTimeRef.current = 0;
    setOverlayType('none');

    setSnapshot({
      playerX: spawnX,
      obstacles: [],
      powerUps: [],
      goldItems: [],
      score: 0,
      level: 0,
      isPaused: false,
      shields: 0,
      earnedGold: 0,
      hasInvulnerability: false,
    });

    startLoop();
  }, [playerObstacleCollisionScale, playerSize, startLoop]);

  const updatePlayerTargetFromTouch = useCallback(
    (touchX: number) => {
      const runtime = runtimeRef.current;
      if (!runtime || playArea.width <= 0 || !isRunningRef.current) return;

      const halfSize = runtime.player.size / 2;
      const maxX = Math.max(0, playArea.width - runtime.player.size);
      const targetX = Math.max(0, Math.min(touchX - halfSize, maxX));
      runtime.player.targetX = targetX;
    },
    [playArea.width],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(6)
        .runOnJS(true)
        .onUpdate((event) => {
          const nextX = event.x;
          const prevX = latestTouchXRef.current;
          if (prevX !== null && Math.abs(nextX - prevX) < 2) return;
          latestTouchXRef.current = nextX;
          updatePlayerTargetFromTouch(nextX);
        })
        .onEnd(() => {
          latestTouchXRef.current = null;
        }),
    [updatePlayerTargetFromTouch],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (width === playArea.width && height === playArea.height) return;
      setPlayArea({ width, height });
    },
    [playArea.height, playArea.width],
  );

  const openPauseOverlay = useCallback(() => {
    onButtonClick();
    stopLoop();
    setOverlayType('pause');
    setSnapshot((prev) => ({ ...prev, isPaused: true }));
  }, [onButtonClick, stopLoop]);

  const closePauseOverlayAndResume = useCallback(() => {
    onButtonClick();
    setOverlayType('none');
    startLoop();
  }, [onButtonClick, startLoop]);

  const continueFromRevive = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.hasRevived || totalGold < GAME_CONFIG.economy.reviveCost) {
      return;
    }

    setIsSpendingGold(true);
    try {
      onButtonClick();
      await onSpendGold(GAME_CONFIG.economy.reviveCost);

      runtime.hasRevived = true;
      runtime.invulnerableUntil = runtime.elapsed + GAME_CONFIG.revive.invulnerabilitySeconds;

      const collisionIndex = getFirstCollidingObstacleIndex(runtime.player, runtime.obstacles);
      if (collisionIndex !== -1) {
        runtime.obstacles.splice(collisionIndex, 1);
      }

      setOverlayType('none');
      syncSnapshot(true);
      startLoop();
    } finally {
      setIsSpendingGold(false);
    }
  }, [onButtonClick, onSpendGold, startLoop, syncSnapshot, totalGold]);

  const finishRun = useCallback(() => {
    onButtonClick();
    setOverlayType('none');
    gameOver();
  }, [gameOver, onButtonClick]);

  const restartRun = useCallback(() => {
    onButtonClick();
    stopLoop();
    setOverlayType('none');
    setIsSpendingGold(false);
    latestTouchXRef.current = null;

    if (playArea.width > 0 && playArea.height > 0) {
      initRuntime(playArea.width, playArea.height);
    }

    onRestart();
  }, [initRuntime, onButtonClick, onRestart, playArea.height, playArea.width, stopLoop]);

  useEffect(() => {
    if (playArea.width <= 0 || playArea.height <= 0) {
      return;
    }

    if (!runtimeRef.current) {
      initRuntime(playArea.width, playArea.height);
      return;
    }

    const runtime = runtimeRef.current;
    const maxX = Math.max(0, playArea.width - runtime.player.size);
    runtime.player.x = Math.max(0, Math.min(runtime.player.x, maxX));
    runtime.player.targetX = Math.max(0, Math.min(runtime.player.targetX, maxX));
    runtime.player.size = playerSize;
    runtime.player.obstacleCollisionScale = playerObstacleCollisionScale;
    runtime.player.y = Math.max(0, playArea.height - GAME_CONFIG.player.bottomOffset - playerSize);
    const resizedMaxX = Math.max(0, playArea.width - playerSize);
    runtime.player.x = Math.max(0, Math.min(runtime.player.x, resizedMaxX));
    runtime.player.targetX = Math.max(0, Math.min(runtime.player.targetX, resizedMaxX));
    syncSnapshot(true);
  }, [initRuntime, playArea.height, playArea.width, playerObstacleCollisionScale, playerSize, syncSnapshot]);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  const canRevive = totalGold >= GAME_CONFIG.economy.reviveCost;
  const handleModalRequestClose = overlayType === 'pause' ? closePauseOverlayAndResume : undefined;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Score: {snapshot.score}</Text>
        <Text style={styles.headerText}>Level: {snapshot.level + 1}</Text>
        <Text style={styles.headerText}>Shields: {snapshot.shields}</Text>

        <View style={styles.goldButton}>
          <MaterialCommunityIcons name="gold" size={14} color="#facc15" />
          <Text style={styles.goldCount}>{totalGold}</Text>
          <Text style={styles.goldEarned}>+{snapshot.earnedGold}</Text>
        </View>

        <Pressable onPress={openPauseOverlay} style={styles.pauseButton}>
          <Ionicons name="pause" size={18} color={GAME_COLORS.text} />
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasContainer} onLayout={onLayout}>
          <Canvas style={styles.canvas}>
            <Player
              x={snapshot.playerX}
              y={playerY}
              size={playerSize}
              skin={selectedCharacterSkin}
              hasShield={snapshot.shields > 0 || snapshot.hasInvulnerability}
            />

            {snapshot.obstacles.map((obstacle) => (
              <Obstacle
                key={obstacle.id}
                x={obstacle.x}
                y={obstacle.y}
                width={obstacle.width}
                height={obstacle.height}
                type={obstacle.type}
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
                width={powerUp.width * POWER_UP_RENDER_SCALE}
                height={powerUp.height * POWER_UP_RENDER_SCALE}
                color={GAME_COLORS.shieldPowerUp}
              />
            ))}

            {snapshot.goldItems.map((gold) => (
              <Gold
                key={gold.id}
                x={gold.x}
                y={gold.y}
                size={gold.size}
                color={GAME_COLORS.gold}
              />
            ))}
          </Canvas>
        </View>
      </GestureDetector>

      <Modal visible={overlayType !== 'none'} transparent animationType="fade" onRequestClose={handleModalRequestClose}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons
              name={overlayType === 'pause' ? 'pause-circle' : 'heart-circle'}
              size={46}
              color={overlayType === 'pause' ? '#60a5fa' : '#f87171'}
            />
            <Text style={styles.modalTitle}>
              {overlayType === 'pause' ? 'Oyun Duraklatıldı' : 'Devam Etmek İster misin?'}
            </Text>

            {overlayType === 'revive' ? (
              <Text style={styles.modalSubtitle}>
                {canRevive
                  ? 'Bu koşuya 10 altınla yalnızca bir kez daha devam edebilirsin.'
                  : 'Altının yetersiz. İstersen koşuyu burada bitirebilirsin.'}
              </Text>
            ) : null}

            {overlayType === 'pause' ? (
              <>
                <Pressable style={styles.modalPrimaryButton} onPress={closePauseOverlayAndResume}>
                  <Text style={styles.modalButtonText}>Devam Et</Text>
                </Pressable>
                <Pressable style={styles.modalSecondaryButton} onPress={restartRun}>
                  <Text style={styles.modalButtonText}>Yeniden Başlat</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.modalPrimaryButton, (!canRevive || isSpendingGold) && styles.modalButtonDisabled]}
                  onPress={continueFromRevive}
                  disabled={!canRevive || isSpendingGold}
                >
                  <Text style={styles.modalButtonText}>
                    10 Altınla Devam Et
                  </Text>
                </Pressable>
                <Pressable style={styles.modalSecondaryButton} onPress={finishRun}>
                  <Text style={styles.modalButtonText}>Oyunu Bitir</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
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
  goldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  goldCount: {
    color: '#facc15',
    fontSize: 14,
    fontWeight: '700',
  },
  goldEarned: {
    color: '#fde68a',
    fontSize: 13,
    fontWeight: '700',
  },
  pauseButton: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
  canvas: {
    flex: 1,
  },
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
  modalSubtitle: {
    color: GAME_COLORS.mutedText,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalPrimaryButton: {
    marginTop: 8,
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
  modalButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.7,
  },
  modalButtonText: {
    color: GAME_COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
