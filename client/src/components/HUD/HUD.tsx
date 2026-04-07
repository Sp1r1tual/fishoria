import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';

import type { IOwnedGearItem } from '@/common/types';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';
import { DebugTerminal } from './DebugTerminal/DebugTerminal';

import { LakeInfo } from './components/LakeInfo/LakeInfo';
import { TensionIndicator } from './components/TensionIndicator/TensionIndicator';
import { ActionControl } from './components/ActionControl/ActionControl';
import { HUDActionButtons } from './components/HUDActionButtons/HUDActionButtons';
import { LevelBar } from '../UI/LevelBar/LevelBar';
import { DebugLegend } from '../UI/DebugLegend/DebugLegend';

import { navigateTo } from '@/store/slices/uiSlice';
import {
  resetGame,
  setGroundbaitExpiry,
  setCurrentLake,
} from '@/store/slices/gameSlice';

import { GameEvents } from '@/game/engine/GameEvents';
import { TimeManager } from '@/game/managers/TimeManager';
import type { LakeScene } from '@/game/engine/scenes/LakeScene';

import { getLakeById } from '@/common/configs/game';
import { SHOP_HOOKS, SHOP_RODS } from '@/common/configs/game';

import jeepIcon from '@/assets/ui/jeep.webp';

import { usePlayerQuery } from '@/queries/player.queries';
import { store } from '@/store';

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

    sceneRef.current?.resetCast();
    dispatch(setGroundbaitExpiry(null));
    sceneRef.current?.setActiveGroundbait('none', null);
    dispatch(resetGame());
    dispatch(setCurrentLake(null));
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

  const hudClass = [
    styles.hud,
    topOnly ? styles['hud--top-only'] : '',
    bottomOnly ? styles['hud--bottom-only'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={hudClass}>
      {showTop && (
        <div className={styles['hud__top']}>
          <LakeInfo sceneRef={sceneRef} isDebugActive={localDebugActive} />

          <div className={styles['hud__top-center']}>
            <LevelBar />
          </div>

          <div className={styles['hud__top-right']}>
            <WoodyButton
              id="hud-exit"
              variant="brown"
              size="sm"
              onClick={handleExit}
              title={t('hud.titles.goHome')}
            >
              <img
                src={jeepIcon}
                alt="Leave"
                className={styles['hud__exit-icon']}
              />
            </WoodyButton>
          </div>

          {localDebugActive && (
            <DebugTerminal onClose={() => sceneRef.current?.toggleDebug()} />
          )}
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

          <TensionIndicator debugActive={localDebugActive} />

          <ActionControl
            sceneRef={sceneRef}
            isSpinningRod={isSpinningRod}
            localDebugActive={localDebugActive}
          />
        </div>
      )}

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
