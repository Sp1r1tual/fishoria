import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { IGearItemBase } from '@/common/types';

import { GearItem } from './GearItem';

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
}: IGearCategoryProps) {
  const { t: translate } = useTranslation();

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
      <h3 className={styles['gear__section-title']}>{title}</h3>
      {isUnavailable ? (
        <div className={styles['gear__empty']}>{unavailableMessage}</div>
      ) : items.length === 0 ? (
        <div className={styles['gear__empty']}>{t('inventory.empty')}</div>
      ) : (
        <div className={styles['gear__grid']}>
          {items.map((item, idx) => {
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
