import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import type {
  IOwnedGearItem,
  CatchResultType,
  BaitTypeType,
  GroundbaitTypeType,
} from '@/common/types';

import { useGameAudio } from '@/hooks/audio/useGameAudio';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { store } from '@/store/store';
import {
  setPhase,
  setTension,
  setDepth,
  setCatch,
  setGroundbaitExpiry,
  setLossEvent,
  setCurrentLake,
  resetGame,
} from '@/store/slices/gameSlice';
import { navigateTo, addToast } from '@/store/slices/uiSlice';
import { usePlayerQuery } from '@/queries/player.queries';
import {
  useCatchFishMutation,
  useBreakGearMutation,
} from '@/queries/game.queries';
import { useEquipMutation } from '@/queries/inventory.queries';

import { Game } from '@/game/engine/Game';
import { LakeScene } from '@/game/engine/scenes/LakeScene';
import { GameEvents } from '@/game/engine/GameEvents';
import { TimeManager } from '@/game/managers/TimeManager';

import {
  getLakeById,
  BAITS,
  SHOP_RODS,
  SHOP_REELS,
  SHOP_LINES,
  SHOP_HOOKS,
  GAME_CHANCES,
} from '@/common/configs/game';

interface UseGameSceneOptions {
  currentLakeId: string | null;
}

export function useGameScene({ currentLakeId }: UseGameSceneOptions) {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LakeScene | null>(null);
  const gameRef = useRef<Game | null>(null);
  const isReelingRef = useRef(false);
  const { t } = useTranslation();

  const { data: player, isLoading: isPlayerLoading } = usePlayerQuery();
  const catchMutation = useCatchFishMutation();
  const breakMutation = useBreakGearMutation();
  const queryClient = useQueryClient();

  const rodDamageRef = useRef(0);
  const reelDamageRef = useRef(0);
  const shownWarningsRef = useRef<Set<string>>(new Set());

  const audio = useGameAudio();
  const audioRef = useRef(audio);
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  const [isLoading, setIsLoading] = useState(true);
  const [debugActive, setDebugActive] = useState(false);
  const [isSnagActive, setIsSnagActive] = useState(false);
  const [isEchoSounderActive, setIsEchoSounderActive] = useState(false);

  const equipMutation = useEquipMutation();

  const weather = useAppSelector((s) => s.game.weather);

  // Dynamic weather update
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setWeather(weather);
    }
  }, [weather]);

  // Sync refs for mutations to be used in callbacks
  const catchMutationRef = useRef(catchMutation);
  const breakMutationRef = useRef(breakMutation);
  const equipMutationRef = useRef(equipMutation);
  const playerRef = useRef(player);

  useEffect(() => {
    catchMutationRef.current = catchMutation;
    breakMutationRef.current = breakMutation;
    equipMutationRef.current = equipMutation;
    playerRef.current = player;
  }, [catchMutation, breakMutation, equipMutation, player]);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !gameRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    if (w > 0 && h > 0) {
      gameRef.current.resize(w, h);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !currentLakeId || isPlayerLoading) return;

    let isMounted = true;

    async function start() {
      if (!containerRef.current || !currentLakeId || !playerRef.current) return;

      setIsLoading(true);
      const lakeConfig = getLakeById(currentLakeId);
      if (!lakeConfig) return;

      const game = new Game();
      gameRef.current = game;
      await game.init(containerRef.current);

      if (!isMounted) {
        game.destroy();
        return;
      }

      let lastTension = -1;
      let lastDepth = -1;

      const scene = new LakeScene(
        lakeConfig,
        {
          onTensionChange: (value, broken, isOverloaded, escapeProgress) => {
            GameEvents.emit('tension', { value, isOverloaded, escapeProgress });
            if (isOverloaded && !shownWarningsRef.current.has('overload')) {
              shownWarningsRef.current.add('overload');
              scene.setPlayerReeling(false);
              dispatch(
                addToast({
                  type: 'warning',
                  message: t('game.overload_warning'),
                }),
              );
            }
            if (Math.abs(lastTension - value) > 0.05 || broken) {
              lastTension = value;
              dispatch(setTension({ value, broken }));
            }
          },
          onDepthChange: (depthM) => {
            GameEvents.emit('depth', depthM);
            if (Math.abs(lastDepth - depthM) > 0.05) {
              lastDepth = depthM;
              dispatch(setDepth(depthM));
            }
          },
          onLureDepthChange: (depth, groundDepth) => {
            GameEvents.emit('lureDepth', { depth, groundDepth });
          },
          onBite: () => {
            audioRef.current.onBite();
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
          },
          onInterest: (isSpinning) => {
            audioRef.current.onInterest?.(isSpinning);
            if (
              isSpinning &&
              typeof navigator !== 'undefined' &&
              navigator.vibrate
            ) {
              navigator.vibrate(30);
            }
          },
          onCatch: (result) => {
            audioRef.current.onCatch();

            const res = result as CatchResultType & {
              rodDamage?: number;
              reelDamage?: number;
            };
            res.rodDamage = rodDamageRef.current;
            res.reelDamage = reelDamageRef.current;

            dispatch(setCatch(result));
          },
          onLineBroke: (meters, type = 'line') => {
            const lostMeters = Math.round(meters);
            audioRef.current.onLineBroke();
            const activeBait = playerRef.current?.activeBait || 'worm';
            const isLure = activeBait.startsWith('lure_');

            const currentHookUid = playerRef.current?.equippedHookUid;
            const hookInstance = playerRef.current?.gearItems.find(
              (g: IOwnedGearItem) => g.uid === currentHookUid,
            );
            const hookName = hookInstance
              ? t(`gear_items.${hookInstance.itemId}.name`)
              : 'Hook';

            const baitName = isLure ? hookName : t(`baits.${activeBait}.name`);

            dispatch(
              setLossEvent({
                reason: 'tension',
                itemNames: isLure ? [hookName] : [baitName, hookName],
                lostMeters,
              }),
            );

            breakMutationRef.current.mutate({
              type,
              baitId: activeBait,
              lostMeters,
              rodDamage: rodDamageRef.current,
              reelDamage: reelDamageRef.current,
            });
          },
          onGearBroke: (type?: 'rod' | 'reel') => {
            audioRef.current.onLineBroke();

            const rodInstance = playerRef.current?.gearItems.find(
              (g: IOwnedGearItem) =>
                g.uid === playerRef.current?.equippedRodUid,
            );
            const reelInstance = playerRef.current?.gearItems.find(
              (g: IOwnedGearItem) =>
                g.uid === playerRef.current?.equippedReelUid,
            );

            const rodCondition = rodInstance?.condition ?? Infinity;
            const reelCondition = reelInstance?.condition ?? Infinity;

            const targetType: 'rod' | 'reel' =
              type ?? (rodCondition <= reelCondition ? 'rod' : 'reel');

            const brokenInstance =
              targetType === 'rod' ? rodInstance : reelInstance;
            const brokenName = brokenInstance
              ? t(`gear_items.${brokenInstance.itemId}.name`)
              : 'Fishing Gear';

            dispatch(
              setLossEvent({
                reason: 'tension',
                itemNames: [brokenName],
              }),
            );

            breakMutationRef.current.mutate({
              type: targetType,
              rodDamage: rodDamageRef.current,
              reelDamage: reelDamageRef.current,
            });
          },
          onPhaseChange: (phase, wasHooked, isScaredAway) => {
            audioRef.current.onPhaseChange(phase);
            if (phase === 'escaped') {
              const activeBait = playerRef.current?.activeBait || 'worm';
              const isLure = activeBait.startsWith('lure_');

              let shouldLoseHook = false;
              let shouldLoseBait = false;

              if (isScaredAway) {
                shouldLoseHook = false;
                shouldLoseBait = false;
              } else if (isLure) {
                shouldLoseHook = false;
              } else {
                shouldLoseBait = wasHooked ? true : Math.random() < 0.5;

                if (wasHooked && Math.random() < 0.1) {
                  shouldLoseHook = true;
                }
              }

              const isItemLost = shouldLoseHook || shouldLoseBait;

              if (!isScaredAway && !isItemLost) {
                dispatch(
                  addToast({
                    message: t('hud.escaped'),
                    type: 'warning',
                  }),
                );
              }

              if (
                !isScaredAway &&
                (isItemLost ||
                  rodDamageRef.current > 0 ||
                  reelDamageRef.current > 0)
              ) {
                const currentHookUid = playerRef.current?.equippedHookUid;
                const hookInstance = playerRef.current?.gearItems.find(
                  (g: IOwnedGearItem) => g.uid === currentHookUid,
                );
                const hookName = hookInstance
                  ? t(`gear_items.${hookInstance.itemId}.name`)
                  : 'Hook';

                const baitName = isLure
                  ? hookName
                  : t(`baits.${activeBait}.name`);

                breakMutationRef.current.mutate({
                  type: shouldLoseHook ? 'hook' : 'bait',
                  baitId: isItemLost ? activeBait : undefined,
                  rodDamage: rodDamageRef.current,
                  reelDamage: reelDamageRef.current,
                });

                if (isItemLost) {
                  dispatch(
                    setLossEvent({
                      reason: 'escape',
                      itemNames: shouldLoseHook
                        ? isLure
                          ? [hookName]
                          : [baitName, hookName]
                        : [baitName],
                    }),
                  );
                }
              }
            }
            GameEvents.emit('phase', phase);
            dispatch(setPhase(phase));
          },
          onBiteProgress: (progress) => {
            GameEvents.emit('bite', progress);
          },
          onCast: () => {
            audioRef.current.onCast();

            rodDamageRef.current = 0;
            reelDamageRef.current = 0;
          },
          onHookFish: () => {
            shownWarningsRef.current.delete('overload');
            audioRef.current.onHook();
          },
          onPlayerReeling: (isReeling) => {
            isReelingRef.current = isReeling;
            audioRef.current.onReelingState(isReeling);
            GameEvents.emit('playerReeling', isReeling);
          },
          onTimeOfDayChange: (tod) => {
            audioRef.current.onTimeOfDayChange(currentLakeId, tod);
          },
          onDebugToggle: (visible) => setDebugActive(visible),
          onEchoSounderToggle: (visible) => setIsEchoSounderActive(visible),
          onGearDamaged: (rodDamage, reelDamage) => {
            rodDamageRef.current += rodDamage;
            reelDamageRef.current += reelDamage;
          },
          onSnagStart: () => {
            setIsSnagActive(true);
            GameEvents.emit('snagStart', null);
          },
          onSnagEnd: (success) => {
            setIsSnagActive(false);
            GameEvents.emit('snagEnd', success);
            if (!success) {
              audioRef.current.onLineBroke();
              const activeBait = playerRef.current?.activeBait || 'worm';
              const isLure = activeBait.startsWith('lure_');

              const currentHookUid = playerRef.current?.equippedHookUid;
              const hookInstance = playerRef.current?.gearItems.find(
                (g: IOwnedGearItem) => g.uid === currentHookUid,
              );
              const hookName = hookInstance
                ? t(`gear_items.${hookInstance.itemId}.name`)
                : 'Hook';

              const baitName = isLure
                ? hookName
                : t(`baits.${activeBait}.name`);

              dispatch(
                setLossEvent({
                  reason: 'snag',
                  itemNames: isLure ? [hookName] : [baitName, hookName],
                  lostMeters: 10,
                }),
              );

              breakMutationRef.current.mutate({
                type: 'line',
                baitId: activeBait,
                lostMeters: 10,
                rodDamage: rodDamageRef.current,
                reelDamage: reelDamageRef.current,
              });
            }
          },
          onCastError: (msgId) => {
            if (shownWarningsRef.current.has(msgId)) return;
            shownWarningsRef.current.add(msgId);
            dispatch(addToast({ type: 'warning', message: t(msgId) }));
          },
          onResetCast: (prevPhase) => {
            // Bait falling off logic should only apply when manually extracting before a catch/loss result
            if (
              ['idle', 'caught', 'escaped', 'broken', 'snagged'].includes(
                prevPhase,
              )
            )
              return;

            const player = playerRef.current;
            if (!player) return;

            const activeBait = player.activeBait;
            const isLure = activeBait?.startsWith('lure_');

            // Use centralized chance for bait to fall off when extracting float/feeder rigs
            if (
              activeBait &&
              !isLure &&
              Math.random() < GAME_CHANCES.baitFallOffOnReset
            ) {
              breakMutationRef.current.mutate({
                type: 'bait',
                baitId: activeBait,
                rodDamage: rodDamageRef.current,
                reelDamage: reelDamageRef.current,
              });

              dispatch(
                addToast({ type: 'info', message: t('game.bait_fell_off') }),
              );
              return true;
            }
            return false;
          },
          onGroundbaitExpired: () => {
            dispatch(
              addToast({ type: 'info', message: t('game.groundbait_expired') }),
            );
          },
        },
        'game',
      );

      await game.loadScene(scene);
      sceneRef.current = scene;

      const p = playerRef.current;
      if (p) {
        const rodInst = p.gearItems.find(
          (g: IOwnedGearItem) => g.uid === p.equippedRodUid,
        );
        const reelInst = p.gearItems.find(
          (g: IOwnedGearItem) => g.uid === p.equippedReelUid,
        );
        const lineInst = p.gearItems.find(
          (g: IOwnedGearItem) => g.uid === p.equippedLineUid,
        );
        const hookInst = p.gearItems.find(
          (g: IOwnedGearItem) => g.uid === p.equippedHookUid,
        );

        const rodConfig = rodInst
          ? SHOP_RODS.find((r) => r.id === rodInst.itemId)
          : null;
        const reelConfig = reelInst
          ? SHOP_REELS.find((r) => r.id === reelInst.itemId)
          : null;
        const lineConfig = lineInst
          ? SHOP_LINES.find((l) => l.id === lineInst.itemId)
          : null;
        const hookConfig = hookInst
          ? SHOP_HOOKS.find((h) => h.id === hookInst.itemId)
          : null;

        scene.setGear(
          rodConfig ? { ...rodConfig, ...rodInst } : null,
          reelConfig ? { ...reelConfig, ...reelInst } : null,
          lineConfig ? { ...lineConfig, ...lineInst } : null,
          hookConfig ? { ...hookConfig, ...hookInst } : null,
        );

        const state = store.getState();
        const activeBait = p.activeBait || 'worm';

        const isLure = activeBait.startsWith('lure_');
        const baitName = isLure
          ? SHOP_HOOKS.find((h) => h.id === activeBait)?.name || 'Lure'
          : BAITS[activeBait]?.name || 'Bait';

        const baitAvailable = isLure
          ? p.gearItems.some((gi: IOwnedGearItem) => gi.itemId === activeBait)
          : (p.consumables.find(
              (c: { itemId: string; itemType: string; quantity: number }) =>
                c.itemId === activeBait && c.itemType === 'bait',
            )?.quantity ?? 0) > 0;

        scene.setActiveBait(
          activeBait as BaitTypeType,
          baitName,
          baitAvailable,
        );
        scene.setWeather(state.game.weather);
        scene.setAvailableLineLength(
          lineInst?.meters ?? lineConfig?.totalLength ?? 0,
        );

        // Sync player-selected float depth from Redux so the first cast
        // uses the correct depth without requiring a manual picker interaction.
        const savedBaseDepth = state.game.baseDepth;
        scene.setBaseDepth(savedBaseDepth);
      }

      if (isMounted) setIsLoading(false);
    }

    start();

    // ── Keyboard ──────────────────────────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const state = store.getState();
      if (state.ui.screen !== 'game') return;

      TimeManager.saveSessionData(
        state.game.weather,
        state.game.weatherForecast,
        state.game.lastWeatherUpdateHour,
      );

      sceneRef.current?.resetCast();
      dispatch(setGroundbaitExpiry(null));
      sceneRef.current?.setActiveGroundbait('none', null);

      // Clear lake ID first to ensure mutation bypasses buffering and hits the server
      dispatch(setCurrentLake(null));

      if (
        playerRef.current?.activeGroundbait &&
        playerRef.current.activeGroundbait !== 'none'
      ) {
        equipMutationRef.current.mutate({
          targetType: 'groundbait',
          targetId: 'none',
        });
      }

      dispatch(resetGame());
      dispatch(navigateTo('mainMenu'));
    };

    window.addEventListener('keydown', handleKeyDown);

    // ── Resize ────────────────────────────────────────────────────────────
    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };
    const orientationHandler = () => setTimeout(handleResize, 300);

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', orientationHandler);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', orientationHandler);
      gameRef.current?.destroy();
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [currentLakeId, dispatch, handleResize, t, isPlayerLoading, queryClient]);

  // ── Gear & Bait Dynamic Synchronization ──────────────────────────────────
  useEffect(() => {
    if (!player || !sceneRef.current) return;

    const isLure = player.activeBait.startsWith('lure_');
    const baitName = isLure
      ? SHOP_HOOKS.find((h) => h.id === player.activeBait)?.name || 'Lure'
      : BAITS[player.activeBait]?.name || 'Bait';

    const baitCount = isLure
      ? player.gearItems.filter(
          (gi: IOwnedGearItem) => gi.itemId === player.activeBait,
        ).length
      : (player.consumables.find(
          (c: { itemId: string; itemType: string; quantity: number }) =>
            c.itemId === player.activeBait && c.itemType === 'bait',
        )?.quantity ?? 0);

    sceneRef.current.setActiveBait(
      player.activeBait as BaitTypeType,
      baitName,
      baitCount > 0,
    );
  }, [player]);

  const groundbaitExpiresAt = useAppSelector((s) => s.game.groundbaitExpiresAt);

  useEffect(() => {
    if (!player || !sceneRef.current) return;

    sceneRef.current.setActiveGroundbait(
      (player.activeGroundbait || 'none') as GroundbaitTypeType,
      groundbaitExpiresAt,
    );
  }, [player, groundbaitExpiresAt]);

  useEffect(() => {
    if (!player || !sceneRef.current) return;

    const p = player;
    const getInst = (uid: string | null) =>
      p.gearItems.find((g: IOwnedGearItem) => g.uid === uid);

    const rodInst = getInst(p.equippedRodUid);
    const reelInst = getInst(p.equippedReelUid);
    const lineInst = getInst(p.equippedLineUid);
    const hookInst = getInst(p.equippedHookUid);

    const rodCfg = rodInst
      ? SHOP_RODS.find((r) => r.id === rodInst.itemId)
      : null;
    const reelCfg = reelInst
      ? SHOP_REELS.find((r) => r.id === reelInst.itemId)
      : null;
    const lineCfg = lineInst
      ? SHOP_LINES.find((l) => l.id === lineInst.itemId)
      : null;
    const hookCfg = hookInst
      ? SHOP_HOOKS.find((h) => h.id === hookInst.itemId)
      : null;

    sceneRef.current.setGear(
      rodCfg ? { ...rodCfg, ...rodInst } : null,
      reelCfg ? { ...reelCfg, ...reelInst } : null,
      lineCfg ? { ...lineCfg, ...lineInst } : null,
      hookCfg ? { ...hookCfg, ...hookInst } : null,
    );
    sceneRef.current.setAvailableLineLength(
      lineInst?.meters ?? lineCfg?.totalLength ?? 0,
    );
  }, [player]);

  return {
    containerRef,
    sceneRef,
    isLoading,
    debugActive,
    isSnagActive,
    isEchoSounderActive,
  };
}
