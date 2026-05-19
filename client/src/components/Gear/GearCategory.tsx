import { useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { IGearItemBase } from '@/common/types';

import { GearItem } from './GearItem';
import { SlidingTextTabs } from '../UI/SlidingTextTabs/SlidingTextTabs';

interface IGearCategoryProps {
  title: string;
  items: IGearItemBase[];
  currentId?: string;
  currentUid?: string | null;
  onEquip?: (item: IGearItemBase) => void;
  onDelete?: (item: IGearItemBase) => void;
  styles: Record<string, string>;
  readOnly?: boolean;
  t: TFunction;
  isUnavailable?: boolean;
  unavailableMessage?: string;
  isSpinningActive?: boolean;
}

export function GearCategory({
  title,
  items,
  currentId,
  currentUid,
  onEquip,
  onDelete,
  styles,
  readOnly,
  t,
  isUnavailable,
  unavailableMessage,
  isSpinningActive,
}: IGearCategoryProps) {
  const { t: translate } = useTranslation();
  const [rodFilter, setRodFilter] = useState<'all' | 'float' | 'spinning'>(
    'all',
  );
  const [hookFilter, setHookFilter] = useState<'all' | 'float' | 'feeder'>(
    'all',
  );

  const isRodsSection =
    title === translate('shop.tabs.rods') ||
    items.some((i) => i.itemType === 'rod');

  const isHooksSection =
    title === translate('shop.tabs.hooks') ||
    items.some((i) => i.itemType === 'hook');

  const filteredItems =
    isRodsSection && rodFilter !== 'all'
      ? items.filter(
          (item) =>
            (item as { rodCategory?: string }).rodCategory === rodFilter,
        )
      : isHooksSection && hookFilter !== 'all'
        ? items.filter(
            (item) => (item as { rigType?: string }).rigType === hookFilter,
          )
        : items;

  const getItemName = (item: IGearItemBase) => {
    let key = `gear_items.${item.id}.name`;
    if (title === translate('hud.bait')) key = `baits.${item.id}.name`;
    if (title === translate('hud.groundbait'))
      key = `groundbaits.${item.id}.name`;

    const translation = t(key);
    return translation === key
      ? item.name || item.id || 'Unknown'
      : translation;
  };

  const getItemDescription = (item: IGearItemBase) => {
    let key = `gear_items.${item.id}.description`;
    if (title === translate('hud.bait')) key = `baits.${item.id}.description`;
    if (title === translate('hud.groundbait'))
      key = `groundbaits.${item.id}.description`;

    const translation = t(key);
    return translation === key
      ? item.description || 'No description.'
      : translation;
  };

  const getEquippedLabel = () => {
    const isBaitOrGroundbait =
      title === translate('hud.bait') || title === translate('hud.groundbait');
    return isBaitOrGroundbait ? t('hud.active') : t('gear.equipped');
  };

  return (
    <div className={styles['gear__section']}>
      <div className={styles['gear__section-header']}>
        <h3 className={styles['gear__section-title']}>{title}</h3>
        {isRodsSection && (
          <SlidingTextTabs
            activeTab={rodFilter}
            onChange={(val) =>
              setRodFilter(val as 'all' | 'float' | 'spinning')
            }
            tabs={
              [
                { id: 'all', label: t('gear.categories.all') },
                { id: 'float', label: t('gear.categories.float') },
                { id: 'spinning', label: t('gear.categories.spinning') },
              ] as const
            }
          />
        )}
        {isHooksSection && !isSpinningActive && (
          <SlidingTextTabs
            activeTab={hookFilter}
            onChange={(val) => setHookFilter(val as 'all' | 'float' | 'feeder')}
            tabs={
              [
                { id: 'all', label: t('gear.categories.all') },
                { id: 'float', label: t('gear.categories.float_hook') },
                { id: 'feeder', label: t('gear.categories.feeder') },
              ] as const
            }
          />
        )}
      </div>
      {isUnavailable ? (
        <div className={styles['gear__empty']}>{unavailableMessage}</div>
      ) : filteredItems.length === 0 ? (
        <div className={styles['gear__empty']}>{t('inventory.empty')}</div>
      ) : (
        <div className={styles['gear__grid']}>
          {filteredItems.map((item, idx) => {
            const isBaitOrGroundbait =
              title === translate('hud.bait') ||
              title === translate('hud.groundbait');
            const tooltip = isBaitOrGroundbait
              ? t('common.discard')
              : t('common.remove');

            return (
              <GearItem
                key={item.uid || item.id || idx}
                item={item}
                isSelected={
                  currentUid ? item.uid === currentUid : item.id === currentId
                }
                readOnly={readOnly}
                onEquip={onEquip}
                onDelete={onDelete}
                styles={styles}
                t={t}
                getItemName={getItemName}
                getItemDescription={getItemDescription}
                equippedLabel={getEquippedLabel()}
                deleteTooltip={tooltip}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
