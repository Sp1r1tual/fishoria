import React from 'react';

import { HUDSlot } from '../HUDSlot/HUDSlot';
import { BaitPicker } from '../BaitPicker/BaitPicker';
import { GroundbaitPicker } from '../GroundbaitPicker/GroundbaitPicker';
import { GearParameterPicker } from '../GearParameterPicker/GearParameterPicker';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { navigateTo } from '@/store/slices/uiSlice';

import type { LakeScene } from '@/game/engine/scenes/LakeScene';

import keepnetIcon from '@/assets/ui/keepnet.webp';
import equipmentIcon from '@/assets/ui/equipment.webp';
import echoSounderIcon from '@/assets/ui/echo_sounder.webp';

import styles from '@/components/HUD/HUD.module.css';

interface IHUDActionButtonsProps {
  sceneRef: React.RefObject<LakeScene | null>;
  isSpinningRod: boolean;
  needsAttention: boolean;
  hasEchoSounder: boolean;
  localEchoActive: boolean;
  onToggleEchoSounder: () => void;
}

export const HUDActionButtons = React.memo(function HUDActionButtons({
  sceneRef,
  isSpinningRod,
  needsAttention,
  hasEchoSounder,
  localEchoActive,
  onToggleEchoSounder,
}: IHUDActionButtonsProps) {
  const dispatch = useAppDispatch();
  const phase = useAppSelector((s) => s.game.phase);

  return (
    <>
      <HUDSlot onClick={() => dispatch(navigateTo('inventory'))}>
        <img
          src={keepnetIcon}
          className={styles['hud__slot-icon']}
          alt="keepnet"
        />
      </HUDSlot>

      <HUDSlot
        onClick={() => {
          if (phase === 'idle') dispatch(navigateTo('gear'));
        }}
        attention={needsAttention}
        disabled={phase !== 'idle'}
      >
        <img
          src={equipmentIcon}
          className={styles['hud__slot-icon']}
          alt="equipment"
        />
      </HUDSlot>

      {hasEchoSounder && (
        <HUDSlot onClick={onToggleEchoSounder} active={localEchoActive}>
          <img
            src={echoSounderIcon}
            className={styles['hud__slot-icon']}
            alt="echo sounder"
          />
        </HUDSlot>
      )}

      <BaitPicker
        sceneRef={sceneRef}
        phase={phase}
        isSpinningRod={isSpinningRod}
      />
      <GroundbaitPicker sceneRef={sceneRef} phase={phase} />
      <GearParameterPicker sceneRef={sceneRef} phase={phase} />
    </>
  );
});
