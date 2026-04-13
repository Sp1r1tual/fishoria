import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { GroundbaitTypeType, GamePhaseType } from '@/common/types';

import { HUDSlot } from '../HUDSlot/HUDSlot';

import { usePlayerQuery } from '@/queries/player.queries';
import { useEquipMutation } from '@/queries/inventory.queries';

import type { LakeScene } from '@/game/engine/scenes/LakeScene';

import { GROUNDBAITS, GROUNDBAIT_IDS } from '@/common/configs/game';

import styles from './Picker.module.css';

interface IGroundbaitPickerProps {
  sceneRef: React.RefObject<LakeScene | null>;
  phase: GamePhaseType;
}

export function GroundbaitPicker({ sceneRef, phase }: IGroundbaitPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { data: player } = usePlayerQuery();
  const activeGroundbait = player?.activeGroundbait || 'none';
  const equipMutation = useEquipMutation();

  const groundbaitCounts =
    player?.consumables
      .filter((c: { itemType: string }) => c.itemType === 'groundbait')
      .reduce(
        (
          acc: Record<string, number>,
          c: { itemId: string; quantity: number },
        ) => ({ ...acc, [c.itemId]: c.quantity }),
        {},
      ) || {};

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

  const actualOpen = isOpen && phase === 'idle';

  const currentGBConfig = GROUNDBAITS[activeGroundbait];

  const getGBIcon = (id: string, config: { icon?: string }) => {
    const icon = config?.icon || '🍱';
    if (icon.includes('/')) {
      return <img src={icon} alt={id} className={styles['picker__icon-img']} />;
    }
    return <span className={styles['picker__icon-emoji']}>{icon}</span>;
  };

  const getSlotIcon = (_id: string, config: { icon?: string }) => {
    const icon = config?.icon || '🍱';
    if (icon.includes('/')) {
      return (
        <img
          src={icon}
          alt="groundbait"
          className={styles['picker__slot-icon-img']}
        />
      );
    }
    return <span style={{ fontSize: '1.8rem' }}>{icon}</span>;
  };

  const availableItems = GROUNDBAIT_IDS.filter(
    (id) => (groundbaitCounts[id] ?? 0) > 0,
  ).map((id) => GROUNDBAITS[id]);

  return (
    <div className={styles['picker-container']} ref={pickerRef}>
      {actualOpen && (
        <div
          className={`${styles['picker__dropdown']} ${styles['picker__dropdown--gb']}`}
        >
          <div className={styles['picker__label']}>{t('hud.groundbait')}</div>
          <div className={styles['picker__wheel']}>
            {availableItems.map((item) => {
              const id = item.id;
              const count = groundbaitCounts[id] ?? 0;

              return (
                <div
                  key={id}
                  className={`${styles['picker__step']} ${styles['picker__step--gb']} ${activeGroundbait === id ? styles['picker__step--active'] : ''}`}
                  onClick={() => {
                    const gb = id as GroundbaitTypeType;
                    equipMutation.mutate({
                      targetType: 'groundbait',
                      targetId: gb,
                    });
                    sceneRef.current?.setActiveGroundbait(gb, null);
                    setIsOpen(false);
                  }}
                >
                  {getGBIcon(id, item)}
                  <span>
                    {t(`groundbaits.${id}.name`)}{' '}
                    {id !== 'none' ? `(${count})` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <HUDSlot
        active={actualOpen}
        disabled={phase !== 'idle'}
        onClick={() => {
          if (phase === 'idle') setIsOpen(!isOpen);
        }}
        badge={
          activeGroundbait !== 'none'
            ? groundbaitCounts[activeGroundbait]
            : undefined
        }
      >
        {currentGBConfig && getSlotIcon(activeGroundbait, currentGBConfig)}
      </HUDSlot>
    </div>
  );
}
