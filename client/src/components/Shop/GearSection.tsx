import type { TFunction } from 'i18next';
import type { GearItemType, GearTypeType } from '@/hooks/game/useShop';
import type { IGearItemBase } from '@/common/types';

import coinIcon from '@/assets/ui/coin.webp';
import { ItemIcon } from '../UI/ItemIcon/ItemIcon';
import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';

interface IGearSectionProps {
  title: string;
  items: GearItemType[];
  type: GearTypeType;
  onBuy: (item: GearItemType) => void;
  money: number;
  ownedCountFn: (type: GearTypeType, id: string) => number;
  isUniqueGadget: (id: string) => boolean;
  styles: Record<string, string>;
  t: TFunction;
}

interface IGearItemDisplay extends IGearItemBase {
  maxWeight?: number;
  speed?: number;
  totalLength?: number;
  quality?: number;
}

export function GearSection({
  title,
  items,
  type,
  onBuy,
  money,
  ownedCountFn,
  isUniqueGadget,
  styles,
  t,
}: IGearSectionProps) {
  return (
    <div className={styles['shop__section']}>
      <div className={styles['shop__section-title']}>{title}</div>
      <div className={styles['shop__grid']}>
        {items.map((item) => {
          const ownedCount = ownedCountFn(type, item.id);
          const isOwned =
            type === 'gadget' && isUniqueGadget(item.id) && ownedCount > 0;
          const canBuy = money >= item.price && !isOwned;
          const displayItem = item as IGearItemDisplay;

          return (
            <div
              key={item.id}
              className={[
                styles['shop-item'],
                isOwned ? styles['shop-item--owned'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['shop-item__top']}>
                {item.icon && (
                  <div className={styles['shop-item__icon']}>
                    <ItemIcon icon={item.icon} />
                  </div>
                )}
                <div className={styles['shop-item__info']}>
                  <div className={styles['shop-item__name']}>
                    {t(`gear_items.${item.id}.name`)}
                  </div>
                  <div className={styles['shop-item__price']}>
                    {item.price === 0 ? (
                      t('shop.starter')
                    ) : (
                      <>
                        <img
                          src={coinIcon}
                          alt="coins"
                          className={styles['shop-item__coin-icon-sm']}
                        />
                        {item.price}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles['shop-item__desc']}>
                {t(`gear_items.${item.id}.description`)}
              </div>

              <div className={styles['shop-item__stats']}>
                {displayItem.maxWeight !== undefined && (
                  <div className={styles['shop-item__stat']}>
                    {t('gear.stats.maxWeight')}:{' '}
                    <span>
                      {displayItem.maxWeight}
                      {t('gear.stats.kg')}
                    </span>
                  </div>
                )}
                {displayItem.speed !== undefined && (
                  <div className={styles['shop-item__stat']}>
                    {t('gear.stats.speed')}: <span>{displayItem.speed}x</span>
                  </div>
                )}
                {displayItem.quality !== undefined && (
                  <div className={styles['shop-item__stat']}>
                    {t('gear.stats.quality')}:{' '}
                    <span>{Math.round(displayItem.quality * 100)}%</span>
                  </div>
                )}
              </div>

              <div className={styles['shop-item__footer']}>
                <div className={styles['shop-item__owned']}>
                  {t('shop.ownedCount', { count: ownedCount })}
                </div>
                <div className={styles['shop-item__status']}>
                  <WoodyButton
                    variant="brown"
                    size="sm"
                    className={styles['shop-item__buy-btn']}
                    onClick={() => onBuy(item)}
                    disabled={!canBuy}
                    label={
                      isOwned
                        ? t('shop.owned')
                        : item.price === 0
                          ? t('shop.free')
                          : t('shop.buyItem')
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
