import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  BaitTypeType,
  GamePhaseType,
  IBaitConfig,
  IHookConfig,
  IOwnedGearItem,
} from '@/common/types';

import { HUDSlot } from '../HUDSlot/HUDSlot';

import { usePlayerQuery } from '@/queries/player.queries';
import { useEquipMutation } from '@/queries/inventory.queries';

import type { LakeScene } from '@/game/engine/scenes/LakeScene';
import { BAITS, BAIT_IDS, SHOP_HOOKS } from '@/common/configs/game';

import styles from './Picker.module.css';

interface IBaitPickerProps {
  sceneRef: React.RefObject<LakeScene | null>;
  phase: GamePhaseType;
  isSpinningRod: boolean;
}

export function BaitPicker({
  sceneRef,
  phase,
  isSpinningRod,
}: IBaitPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { data: player } = usePlayerQuery();
  const equipMutation = useEquipMutation();

  const activeBait = player?.activeBait || 'worm';

  const consumables = player?.consumables ?? [];
  const gearItems = player?.gearItems ?? [];

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

  const equippedHookInstance = player?.gearItems.find(
    (g: IOwnedGearItem) => g.uid === player.equippedHookUid,
  );
  const currentHook = equippedHookInstance
    ? SHOP_HOOKS.find((h) => h.id === equippedHookInstance.itemId)
    : null;

  const isLure = activeBait.startsWith('lure_');
  const activeCount = isLure
    ? gearItems.filter((g: IOwnedGearItem) => g.itemId === activeBait).length
    : (consumables.find(
        (c: { itemId: string; itemType: string; quantity: number }) =>
          c.itemId === activeBait && c.itemType === 'bait',
      )?.quantity ?? 0);

  const baitNeedsAttention =
    activeCount === 0 ||
    (isSpinningRod && !isLure) ||
    (!isSpinningRod && isLure);

  const currentBaitConfig = isLure
    ? currentHook
    : BAITS[activeBait] || currentHook;

  const getBaitIcon = (id: string, config: IBaitConfig | IHookConfig) => {
    const icon =
      config?.icon ||
      (id === 'lure_wobbler' ? '🐟' : id === 'lure_spoon' ? '🥄' : '🐛');
    if (icon.includes('/')) {
      return <img src={icon} alt={id} className={styles['picker__icon-img']} />;
    }
    return <span className={styles['picker__icon-emoji']}>{icon}</span>;
  };

  const getSlotIcon = (id: string, config: IBaitConfig | IHookConfig) => {
    const icon =
      config?.icon ||
      (id === 'lure_wobbler' ? '🐟' : id === 'lure_spoon' ? '🥄' : '🐛');
    if (icon.includes('/')) {
      return (
        <img
          src={icon}
          alt="bait"
          className={styles['picker__slot-icon-img']}
        />
      );
    }
    return <span style={{ fontSize: '1.8rem' }}>{icon}</span>;
  };

  const availableItems = isSpinningRod
    ? SHOP_HOOKS.filter(
        (h) =>
          h.rigType === 'spinning' &&
          gearItems.some((gi: IOwnedGearItem) => gi.itemId === h.id),
      )
    : BAIT_IDS.filter(
        (id) =>
          (consumables.find(
            (c: { itemId: string; itemType: string; quantity: number }) =>
              c.itemId === id && c.itemType === 'bait',
          )?.quantity ?? 0) > 0,
      ).map((id) => BAITS[id]);

  return (
    <div className={styles['picker-container']} ref={pickerRef}>
      {actualOpen && (
        <div
          className={`${styles['picker__dropdown']} ${styles['picker__dropdown--bait']}`}
        >
          <div className={styles['picker__label']}>{t('hud.bait')}</div>
          <div className={styles['picker__wheel']}>
            {availableItems.map((item) => {
              const id = item.id;
              const count = isSpinningRod
                ? gearItems.filter((gi: IOwnedGearItem) => gi.itemId === id)
                    .length
                : (consumables.find(
                    (c: {
                      itemId: string;
                      itemType: string;
                      quantity: number;
                    }) => c.itemId === id && c.itemType === 'bait',
                  )?.quantity ?? 0);
              const isLureItem = id.startsWith('lure_');

              return (
                <div
                  key={id}
                  className={`${styles['picker__step']} ${styles['picker__step--bait']} ${activeBait === id ? styles['picker__step--active'] : ''}`}
                  onClick={() => {
                    const bait = id as BaitTypeType;

                    if (isLureItem) {
                      const lureConfig = SHOP_HOOKS.find((h) => h.id === id);
                      const matchingInstance = gearItems.find(
                        (inst: IOwnedGearItem) => inst.itemId === id,
                      );
                      if (lureConfig && matchingInstance) {
                        equipMutation.mutate({
                          equips: [
                            { targetType: 'hook', uid: matchingInstance.uid },
                            { targetType: 'bait', targetId: bait },
                          ],
                        });
                      }
                    } else {
                      equipMutation.mutate({
                        targetType: 'bait',
                        targetId: bait,
                      });
                    }

                    sceneRef.current?.setActiveBait(
                      bait,
                      isLureItem ? item.name : (BAITS[bait]?.name ?? bait),
                      count > 0,
                    );
                    setIsOpen(false);
                  }}
                >
                  {getBaitIcon(id, item)}
                  <span>
                    {isLureItem
                      ? t(`gear_items.${id}.name`)
                      : t(`baits.${id}.name`)}{' '}
                    ({count})
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
        attention={baitNeedsAttention}
        onClick={() => {
          if (phase === 'idle') setIsOpen(!isOpen);
        }}
        badge={activeCount}
      >
        {currentBaitConfig && getSlotIcon(activeBait, currentBaitConfig)}
      </HUDSlot>
    </div>
  );
}
