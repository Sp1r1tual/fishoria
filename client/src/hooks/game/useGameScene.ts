import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import type { IOwnedGearItem, CatchResultType } from '@/common/types';

import { useGameAudio } from '@/hooks/audio/useGameAudio';
import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import { store } from '@/store';
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

import { Game } from '@/game/engine/Game';
import { LakeScene } from '@/game/engine/scenes/LakeScene';
import { GameEvents } from '@/game/engine/GameEvents';

import {
  getLakeById,
  BAITS,
  SHOP_RODS,
  SHOP_REELS,
  SHOP_LINES,
  SHOP_HOOKS,
} from '@/common/configs/game';
import { TimeManager } from '@/game/managers/TimeManager';

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

  const audio = useGameAudio();
  const audioRef = useRef(audio);
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  const [isLoading, setIsLoading] = useState(true);
  const [debugActive, setDebugActive] = useState(false);
  const [isSnagActive, setIsSnagActive] = useState(false);
  const [isEchoSounderActive, setIsEchoSounderActive] = useState(false);

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
  const playerRef = useRef(player);

  useEffect(() => {
    catchMutationRef.current = catchMutation;
    breakMutationRef.current = breakMutation;
    playerRef.current = player;
  }, [catchMutation, breakMutation, player]);

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
          onTensionChange: (value, broken) => {
            GameEvents.emit('tension', value);
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
          onBite: () => audioRef.current.onBite(),
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
          onLineBroke: async (lostMeters, type = 'line') => {
            audioRef.current.onLineBroke();
            const baitId = playerRef.current?.activeBait || 'worm';
            const baitName = BAITS[baitId]?.name || baitId;

            // Get hook name from current player state
            const currentHookUid = playerRef.current?.equippedHookUid;
            const hookInstance = playerRef.current?.gearItems.find(
              (g: IOwnedGearItem) => g.uid === currentHookUid,
            );
            const hookName = hookInstance
              ? SHOP_HOOKS.find((h) => h.id === hookInstance.itemId)?.name ||
                'Hook'
              : 'Hook';

            try {
              await breakMutationRef.current.mutateAsync({
                type,
                baitId,
                lostMeters,
                rodDamage: rodDamageRef.current,
                reelDamage: reelDamageRef.current,
              });
            } catch {
              console.error('Failed to sync line break');
            }

            dispatch(
              setLossEvent({
                reason: 'tension',
                itemNames: [baitName, hookName],
                lostMeters,
              }),
            );
          },
          onGearBroke: async (type?: 'rod' | 'reel') => {
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

            // Deterministic fallback: exactly what broke isn't provided, use condition
            const targetType: 'rod' | 'reel' =
              type ?? (rodCondition <= reelCondition ? 'rod' : 'reel');

            const brokenInstance =
              targetType === 'rod' ? rodInstance : reelInstance;
            const catalog = targetType === 'rod' ? SHOP_RODS : SHOP_REELS;
            const brokenName = brokenInstance
              ? catalog.find((r) => r.id === brokenInstance.itemId)?.name ||
                'Fishing Gear'
              : 'Fishing Gear';

            try {
              await breakMutationRef.current.mutateAsync({
                type: targetType,
                rodDamage: rodDamageRef.current,
                reelDamage: reelDamageRef.current,
              });
            } catch {
              console.error('Failed to sync gear break');
            }

            dispatch(
              setLossEvent({
                reason: 'tension',
                itemNames: [brokenName],
              }),
            );
          },
          onPhaseChange: (phase, wasHooked, isScaredAway) => {
            audioRef.current.onPhaseChange(phase);
            if (phase === 'escaped') {
              const activeBait = playerRef.current?.activeBait || 'worm';
              const isLure = activeBait.startsWith('lure_');

              // Determine if we should lose items
              let shouldLoseHook = false;
              let shouldLoseBait = false;

              if (isScaredAway) {
                // Was just a fish interested, but player pulled away. Bait is 100% safe.
                shouldLoseHook = false;
                shouldLoseBait = false;
              } else if (isLure) {
                // Lures are both bait and hook. 5% chance to lose on escape.
                if (Math.random() < 0.02) {
                  shouldLoseHook = true;
                }
              } else {
                // For regular bait:
                // 1. Bait is definitely lost if the fish was hooked.
                // 2. If it was only a nibble (not hooked), there's a 50% chance it was eaten anyway.
                shouldLoseBait = wasHooked ? true : Math.random() < 0.5;

                // 3. Hook is only lost if the fish was actually hooked, and even then, only by chance.
                // If the fish just swam away (wasHooked=false), the hook is 100% safe.
                if (wasHooked && Math.random() < 0.1) {
                  shouldLoseHook = true;
                }
              }

              if (
                shouldLoseHook ||
                shouldLoseBait ||
                rodDamageRef.current > 0 ||
                reelDamageRef.current > 0
              ) {
                const baitName = BAITS[activeBait]?.name || activeBait;

                const currentHookUid = playerRef.current?.equippedHookUid;
                const hookInstance = playerRef.current?.gearItems.find(
                  (g: IOwnedGearItem) => g.uid === currentHookUid,
                );
                const hookName = hookInstance
                  ? SHOP_HOOKS.find((h) => h.id === hookInstance.itemId)
                      ?.name || 'Hook'
                  : 'Hook';

                // Send mutation to sync gear damage and potentially lost hooks/baits
                breakMutationRef.current.mutate({
                  type: shouldLoseHook ? 'hook' : 'bait',
                  baitId:
                    shouldLoseHook || shouldLoseBait ? activeBait : undefined,
                  rodDamage: rodDamageRef.current,
                  reelDamage: reelDamageRef.current,
                });

                if (shouldLoseHook || shouldLoseBait) {
                  dispatch(
                    setLossEvent({
                      reason: 'escape',
                      itemNames: shouldLoseHook
                        ? isLure
                          ? [baitName]
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
            // Reset damage on new cast
            rodDamageRef.current = 0;
            reelDamageRef.current = 0;
          },
          onHookFish: () => audioRef.current.onHook(),
          onPlayerReeling: (isReeling) => {
            isReelingRef.current = isReeling;
            audioRef.current.onReelingState(isReeling);
          },
          onTimeOfDayChange: (tod) => {
            audioRef.current.onTimeOfDayChange(currentLakeId, tod);
          },
          onDebugToggle: (visible) => setDebugActive(visible),
          onEchoSounderToggle: (visible) => setIsEchoSounderActive(visible),
          onGearDamaged: (rodDamage, reelDamage) => {
            // Accumulate damage to send at the end of the catch/break
            rodDamageRef.current += rodDamage;
            reelDamageRef.current += reelDamage;
          },
          onSnagStart: () => {
            setIsSnagActive(true);
            GameEvents.emit('snagStart', null);
          },
          onSnagEnd: async (success) => {
            setIsSnagActive(false);
            GameEvents.emit('snagEnd', success);
            if (!success) {
              audioRef.current.onLineBroke();
              const baitId = playerRef.current?.activeBait || 'worm';
              const baitName = BAITS[baitId]?.name || baitId;

              const currentHookUid = playerRef.current?.equippedHookUid;
              const hookInstance = playerRef.current?.gearItems.find(
                (g: IOwnedGearItem) => g.uid === currentHookUid,
              );
              const hookName = hookInstance
                ? SHOP_HOOKS.find((h) => h.id === hookInstance.itemId)?.name ||
                  'Hook'
                : 'Hook';

              try {
                await breakMutationRef.current.mutateAsync({
                  type: 'line',
                  baitId,
                  lostMeters: 10,
                  rodDamage: rodDamageRef.current,
                  reelDamage: reelDamageRef.current,
                });
              } catch {
                console.error('Failed to sync snag loss');
              }

              dispatch(
                setLossEvent({
                  reason: 'snag',
                  itemNames: [baitName, hookName],
                  lostMeters: 10,
                }),
              );
            }
          },
          onCastError: (msgId) => {
            dispatch(addToast({ type: 'warning', message: t(msgId) }));
          },
          onResetCast: (prevPhase) => {
            if (prevPhase === 'idle') return;

            const player = playerRef.current;
            if (!player) return;

            const activeBait = player.activeBait;
            const isLure = activeBait?.startsWith('lure_');

            // 5% chance for bait to fall off when extracting float/feeder rigs
            if (activeBait && !isLure && Math.random() < 0.05) {
              breakMutationRef.current.mutate({
                type: 'bait',
                baitId: activeBait,
                rodDamage: rodDamageRef.current,
                reelDamage: reelDamageRef.current,
              });

              dispatch(
                addToast({ type: 'info', message: t('game.bait_fell_off') }),
              );
            }
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

      // Initial sync with server data
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
        const activeGroundbait = p.activeGroundbait || 'none';

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

        scene.setActiveBait(activeBait, baitName, baitAvailable);
        scene.setActiveGroundbait(
          activeGroundbait,
          state.game.groundbaitExpiresAt,
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
      dispatch(resetGame());
      dispatch(setCurrentLake(null)); // Clear lake so scene tears down
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

    sceneRef.current.setActiveBait(player.activeBait, baitName, baitCount > 0);
  }, [player, player?.activeBait, player?.consumables, player?.gearItems]);

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
  }, [
    player,
    player?.equippedRodUid,
    player?.equippedReelUid,
    player?.equippedLineUid,
    player?.equippedHookUid,
    player?.gearItems,
  ]);

  return {
    containerRef,
    sceneRef,
    isLoading,
    debugActive,
    isSnagActive,
    isEchoSounderActive,
  };
}
