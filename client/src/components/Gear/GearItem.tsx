import type { TFunction } from 'i18next';

import type { IGearItemBase } from '@/common/types';

import { CircleButton } from '../UI/buttons/CircleButton/CircleButton';
import { ConditionBar } from './ConditionBar';

interface IGearItemProps {
  item: IGearItemBase;
  isSelected: boolean;
  readOnly?: boolean;
  onEquip?: (item: IGearItemBase) => void;
  onDelete?: (item: IGearItemBase) => void;
  styles: Record<string, string>;
  t: TFunction;
  getItemName: (item: IGearItemBase) => string;
  getItemDescription: (item: IGearItemBase) => string;
  equippedLabel: string;
  deleteTooltip?: string;
}

export function GearItem({
  item,
  isSelected,
  readOnly,
  onEquip,
  onDelete,
  styles,
  t,
  getItemName,
  getItemDescription,
  equippedLabel,
  deleteTooltip,
}: IGearItemProps) {
  const isBroken =
    item.isBroken || (item.condition != null && item.condition <= 0);

  const conditionVal =
    item.condition != null && item.meters == null
      ? Math.floor(item.condition)
      : null;

  const isHook =
    (item.id || '').startsWith('lure_') || (item.id || '').startsWith('hook_');

  const showConditionBar = conditionVal !== null && !isHook;

  const lineLengthVal = item.meters != null ? Math.floor(item.meters) : null;
  const lineTotalVal = item.meters != null ? (item.totalLength ?? 100) : null;

  const conditionColor = (val: number) =>
    val < 20 ? '#ef4444' : val < 50 ? '#fbbf24' : '#4ade80';

  return (
    <div
      className={[
        styles['gear-item'],
        isSelected ? styles['gear-item--equipped'] : '',
        isBroken ? styles['gear-item--broken'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => {
        if (!readOnly && !isSelected && !isBroken && onEquip) {
          onEquip(item);
        }
      }}
      style={{
        cursor: readOnly || isSelected || isBroken ? 'default' : 'pointer',
      }}
    >
      {!readOnly && onDelete && item.uid && (
        <CircleButton
          variant={isSelected ? 'brown' : 'glass'}
          size="sm"
          className={styles['gear-item__delete-btn']}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          title={deleteTooltip || t('common.remove')}
        />
      )}

      {item.icon && (
        <div className={styles['gear-item__icon']}>
          {item.icon.includes('/') ? (
            <img
              src={item.icon}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span>{item.icon}</span>
          )}
        </div>
      )}

      <div className={styles['gear-item__info']}>
        <div className={styles['gear-item__name']}>
          {getItemName(item)}
          {item.count !== undefined && item.count > 1 && item.id !== 'none' && (
            <span className={styles['gear-item__count']}> ×{item.count}</span>
          )}
          {isBroken && (
            <span className={styles['gear-item__broken-label']}>
              {' '}
              [{t('hud.broken').toUpperCase()}]
            </span>
          )}
        </div>

        {showConditionBar && conditionVal !== null && (
          <ConditionBar
            value={conditionVal}
            max={100}
            label={`${t('gear.condition')}: ${conditionVal}%`}
            styles={styles}
            color={conditionColor(conditionVal)}
          />
        )}

        {lineLengthVal !== null && lineTotalVal !== null && (
          <ConditionBar
            value={lineLengthVal}
            max={lineTotalVal}
            label={`${t('gear.line')}: ${lineLengthVal}m / ${lineTotalVal}m`}
            styles={styles}
            color={
              lineLengthVal < 20
                ? '#ef4444'
                : lineLengthVal < lineTotalVal * 0.3
                  ? '#fbbf24'
                  : '#4ade80'
            }
          />
        )}

        <div className={styles['gear-item__desc']}>
          {getItemDescription(item)}
        </div>

        {isSelected && (
          <div className={styles['gear-item__status--equipped']}>
            {equippedLabel}
          </div>
        )}
        {isBroken && (
          <div className={styles['gear-item__status--broken']}>
            {t('hud.broken')}
          </div>
        )}
      </div>
    </div>
  );
}
