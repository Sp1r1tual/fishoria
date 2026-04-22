import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import type {
  GamePhaseType,
  IOwnedGearItem,
  RetrieveSpeedType,
} from '@/common/types';

import { HUDSlot } from '../HUDSlot/HUDSlot';

import { GameEvents } from '@/game/engine/GameEvents';
import { setBaseDepth } from '@/store/slices/gameSlice';
import { usePlayerQuery } from '@/queries/player.queries';

import type { LakeScene } from '@/game/engine/scenes/LakeScene';

import { SHOP_HOOKS, SHOP_RODS, getLakeById } from '@/common/configs/game';

import depthIcon from '@/assets/ui/depth.webp';

import styles from '../DepthPicker/Picker.module.css';

interface IGearParameterPickerProps {
  sceneRef: React.RefObject<LakeScene | null>;
  phase: GamePhaseType;
}

export function GearParameterPicker({
  sceneRef,
  phase,
}: IGearParameterPickerProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const baseDepth = useAppSelector((s) => s.game.baseDepth);
  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);
  const { data: player } = usePlayerQuery();

  const [currentSpeed, setCurrentSpeed] = useState<RetrieveSpeedType>('normal');

  const rodInstance = player?.gearItems.find(
    (g: IOwnedGearItem) => g.uid === player.equippedRodUid,
  );
  const rodConfig = rodInstance
    ? SHOP_RODS.find((r) => r.id === rodInstance.itemId)
    : null;
  const isSpinning = rodConfig?.rodCategory === 'spinning';

  const hookInstance = player?.gearItems.find(
    (g: IOwnedGearItem) => g.uid === player.equippedHookUid,
  );
  const hookConfig = hookInstance
    ? SHOP_HOOKS.find((h) => h.id === hookInstance.itemId)
    : null;

  const isDepthRod =
    rodConfig?.rodCategory === 'float' && hookConfig?.rigType !== 'feeder';

  const curLake = currentLakeId ? getLakeById(currentLakeId) : null;
  const maxLakeDepthCm = Math.floor((curLake?.depthMap.maxDepth ?? 3.0) * 100);

  useEffect(() => {
    const unsub = GameEvents.on('retrieveSpeed', (val) => {
      setCurrentSpeed(val);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen && pickerRef.current) {
      setTimeout(() => {
        const activeItem = pickerRef.current?.querySelector(
          `.${styles['picker__step--active']}`,
        );
        activeItem?.scrollIntoView({ block: 'center', behavior: 'auto' });
      }, 0);
    }
  }, [isOpen, baseDepth, currentSpeed]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isSpinning && !isDepthRod) return null;

  const onSetSpeed = (s: RetrieveSpeedType) => {
    setCurrentSpeed(s);
    sceneRef.current?.setRetrieveSpeed(s);
    setIsOpen(false);
  };

  const onSetDepth = (d: number) => {
    dispatch(setBaseDepth(d));
    sceneRef.current?.setBaseDepth?.(d);
    setIsOpen(false);
  };

  const speedSteps: { label: string; val: RetrieveSpeedType }[] = [
    { label: t('hud.speed.slow'), val: 'slow' },
    { label: t('hud.speed.normal'), val: 'normal' },
    { label: t('hud.speed.fast'), val: 'fast' },
  ];

  const depthSteps = [];
  for (let d = 10; d <= maxLakeDepthCm; d += 10) {
    depthSteps.push({ label: `${d}cm`, val: d });
  }

  const isActionEnabled = isSpinning
    ? phase === 'waiting' || phase === 'reeling' || phase === 'idle'
    : phase === 'idle';

  return (
    <div className={styles['picker-container']} ref={pickerRef}>
      {isOpen && isActionEnabled && (
        <div
          className={`${styles['picker__dropdown']} ${isSpinning ? styles['picker__dropdown--speed'] : styles['picker__dropdown--depth']}`}
        >
          <div className={styles['picker__label']}>
            {isSpinning ? t('hud.retrievalSpeed') : t('hud.depth')}
          </div>
          <div className={styles['picker__wheel']}>
            {isSpinning
              ? speedSteps.map((s) => (
                  <div
                    key={s.val}
                    className={`${styles['picker__step']} ${currentSpeed === s.val ? styles['picker__step--active'] : ''}`}
                    onClick={() => onSetSpeed(s.val)}
                  >
                    {s.label}
                  </div>
                ))
              : depthSteps.map((s) => (
                  <div
                    key={s.val}
                    className={`${styles['picker__step']} ${baseDepth === s.val ? styles['picker__step--active'] : ''}`}
                    onClick={() => onSetDepth(s.val)}
                  >
                    {s.label}
                  </div>
                ))}
          </div>
        </div>
      )}

      <HUDSlot
        active={isOpen}
        disabled={!isActionEnabled}
        onClick={() => {
          if (isActionEnabled) setIsOpen(!isOpen);
        }}
        badge={isSpinning ? t(`hud.speed.${currentSpeed}`) : `${baseDepth}cm`}
      >
        <img
          src={depthIcon}
          className={styles['picker__slot-icon-img']}
          alt="gear-meta"
        />
      </HUDSlot>
    </div>
  );
}
