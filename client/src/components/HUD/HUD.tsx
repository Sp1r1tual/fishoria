import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';

import type { IOwnedGearItem } from '@/common/types';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';
import { DebugTerminal } from './DebugTerminal/DebugTerminal';
import { LakeInfo } from './LakeInfo/LakeInfo';
import { TensionIndicator } from './TensionIndicator/TensionIndicator';
import { LureDepthIndicator } from './LureDepthIndicator/LureDepthIndicator';
import { ActionControl } from './ActionControl/ActionControl';
import { HUDActionButtons } from './HUDActionButtons/HUDActionButtons';
import { LevelBar } from '@/components/UI/LevelBar/LevelBar';
import { DebugLegend } from '@/components/UI/DebugLegend/DebugLegend';
import { OverloadOverlay } from './OverloadOverlay/OverloadOverlay';
import { GameChat } from './GameChat/GameChat';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { navigateTo } from '@/store/slices/uiSlice';
import {
  clearPendingEquips,
  setCurrentLake,
  setGroundbaitExpiry,
  resetGame,
} from '@/store/slices/gameSlice';
import { useEquipMutation } from '@/queries/inventory.queries';
import { usePlayerQuery } from '@/queries/player.queries';
import { store } from '@/store/store';

import { InventoryService } from '@/services/inventory.service';
import { GameEvents } from '@/game/engine/GameEvents';
import { TimeManager } from '@/game/managers/TimeManager';
import type { LakeScene } from '@/game/engine/scenes/LakeScene';

import { getLakeById } from '@/common/configs/game';
import { SHOP_HOOKS, SHOP_RODS } from '@/common/configs/game';
import { TIME_SYSTEM } from '@/common/configs/game/system.config';

import styles from './HUD.module.css';

interface IHUDProps {
  sceneRef: React.RefObject<LakeScene | null>;
  topOnly?: boolean;
  bottomOnly?: boolean;
  debugActive?: boolean;
}

export function HUD({
  sceneRef,
  topOnly = false,
  bottomOnly = false,
  debugActive = false,
}: IHUDProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: player } = usePlayerQuery();
  const equipMutation = useEquipMutation();

  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);

  const rodInstance = player?.gearItems.find(
    (g: IOwnedGearItem) => g.uid === player.equippedRodUid,
  );

  const rodConfig = rodInstance
    ? SHOP_RODS.find((r) => r.id === rodInstance.itemId)
    : null;

  const reelInstance = player?.gearItems.find(
    (g: IOwnedGearItem) => g.uid === player.equippedReelUid,
  );

  const lineInstance = player?.gearItems.find(
    (g: IOwnedGearItem) => g.uid === player.equippedLineUid,
  );

  const hookInstance = player?.gearItems.find(
    (g: IOwnedGearItem) => g.uid === player.equippedHookUid,
  );

  const hookConfig = hookInstance
    ? SHOP_HOOKS.find((h) => h.id === hookInstance.itemId)
    : null;

  const playerRodIsBroken = rodInstance?.condition === 0;
  const playerRodCategory = rodConfig?.rodCategory;
  const playerReelIsBroken = reelInstance?.condition === 0;

  const hasRod = !!rodInstance;
  const hasReel = !!reelInstance;
  const hasLine = !!lineInstance;
  const hasHook = !!hookInstance;

  const hasEchoSounder = player?.hasEchoSounder ?? false;
  const hookRigType = hookConfig?.rigType;

  const curLake = currentLakeId ? getLakeById(currentLakeId) : null;

  const [localDebugActive, setLocalDebugActive] = useState(debugActive);
  const [localEchoActive, setLocalEchoActive] = useState(false);

  useEffect(() => {
    setLocalDebugActive(debugActive);
  }, [debugActive]);

  useEffect(() => {
    setLocalDebugActive(sceneRef.current?.isDebugVisible() ?? debugActive);
    setLocalEchoActive(sceneRef.current?.isEchoSounderVisible() ?? false);

    const unsubDebug = GameEvents.on('debug', (val) =>
      setLocalDebugActive(val),
    );
    const unsubEcho = GameEvents.on('echoSounder', (val) =>
      setLocalEchoActive(val),
    );

    return () => {
      unsubDebug();
      unsubEcho();
    };
  }, [sceneRef, debugActive]);

  const handleExit = () => {
    const state = store.getState();
    TimeManager.saveSessionData(
      state.game.weather,
      state.game.weatherForecast,
      state.game.lastWeatherUpdateHour,
    );

    const pendingEquips = state.game.pendingEquips;
    if (pendingEquips && pendingEquips.length > 0) {
      InventoryService.equip({ equips: pendingEquips }).catch((e) =>
        console.error('Failed to flush gears on exit', e),
      );
      dispatch(clearPendingEquips());
    }

    sceneRef.current?.resetCast();
    dispatch(setGroundbaitExpiry(null));
    sceneRef.current?.setActiveGroundbait('none', null);

    dispatch(setCurrentLake(null));

    if (player?.activeGroundbait && player.activeGroundbait !== 'none') {
      equipMutation.mutate({
        targetType: 'groundbait',
        targetId: 'none',
      });
    }

    dispatch(resetGame());
    dispatch(navigateTo('mainMenu'));
    navigate('/');
  };

  const handleToggleEchoSounder = useCallback(() => {
    sceneRef.current?.toggleEchoSounder();
    setLocalEchoActive(sceneRef.current?.isEchoSounderVisible() ?? false);
  }, [sceneRef, setLocalEchoActive]);

  const isGearBroken = playerRodIsBroken || playerReelIsBroken;
  const isGearMissing = !hasRod || !hasReel || !hasLine || !hasHook;
  const isSpinningRod = playerRodCategory === 'spinning';
  const isGearMismatch =
    hasRod &&
    hasHook &&
    ((isSpinningRod && hookRigType !== 'spinning') ||
      (!isSpinningRod && hookRigType === 'spinning'));

  const needsAttention = isGearBroken || isGearMissing || isGearMismatch;

  const showTop = !bottomOnly;
  const showBottom = !topOnly;

  const [isNight, setIsNight] = useState(false);

  const onlineMode = useAppSelector((s) => s.settings.onlineMode);

  useEffect(() => {
    const updateTime = () => {
      const now = TimeManager.getTime('game');
      const hour = now.getHours();
      setIsNight(
        hour >= TIME_SYSTEM.nightStart || hour < TIME_SYSTEM.morningStart,
      );
    };

    updateTime();
    const unsub = GameEvents.on('timeUpdate', updateTime);
    return () => unsub();
  }, []);

  const hudClass = [
    styles.hud,
    topOnly ? styles['hud--top-only'] : '',
    bottomOnly ? styles['hud--bottom-only'] : '',
    isNight ? styles['hud--night'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={hudClass}>
      {showTop && (
        <div className={styles['hud__top']}>
          <div className={styles['hud__top-left']}>
            <LakeInfo sceneRef={sceneRef} isDebugActive={localDebugActive} />
          </div>

          <div className={styles['hud__top-center']}>
            <LevelBar />
            <DebugTerminal
              isVisible={localDebugActive}
              onClose={() => sceneRef.current?.toggleDebug()}
            />
          </div>

          <div className={styles['hud__top-right']}>
            <div className={styles['hud__top-right-group']}>
              {onlineMode && <GameChat isNight={isNight} />}

              <div className={styles['hud__exit-wrapper']}>
                <WoodyButton
                  id="hud-exit"
                  variant="glass"
                  size="sm"
                  isSquare={true}
                  onClick={handleExit}
                  title={t('hud.titles.goHome')}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles['hud__exit-svg']}
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showBottom && (
        <div className={styles['hud__bottom-bar']}>
          <HUDActionButtons
            sceneRef={sceneRef}
            isSpinningRod={isSpinningRod}
            needsAttention={needsAttention}
            hasEchoSounder={hasEchoSounder}
            localEchoActive={localEchoActive}
            onToggleEchoSounder={handleToggleEchoSounder}
          />

          <TensionIndicator
            debugActive={localDebugActive}
            isSpinning={isSpinningRod}
          />

          <ActionControl
            sceneRef={sceneRef}
            isSpinningRod={isSpinningRod}
            localDebugActive={localDebugActive}
          />

          <div
            className={styles['hud__debug-btn']}
            onClick={() => sceneRef.current?.toggleDebug()}
            title="Toggle Debug"
          >
            &lt;/&gt;
          </div>
        </div>
      )}

      <LureDepthIndicator />
      <OverloadOverlay />

      {bottomOnly && (debugActive || localEchoActive) && curLake && (
        <div className={styles['hud__legend-container']}>
          <DebugLegend
            minDepth={curLake.depthMap.minDepth}
            maxDepth={curLake.depthMap.maxDepth}
          />
        </div>
      )}
    </div>
  );
}
