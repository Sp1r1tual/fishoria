import type { TFunction } from 'i18next';

import type { GearItemType, GearTypeType } from '@/hooks/game/useShop';

import coinIcon from '@/assets/ui/coin.webp';
import { ItemIcon } from '../UI/ItemIcon/ItemIcon';

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

          return (
            <div
              key={item.id}
              className={[
                styles['shop-item'],
                isOwned ? styles['shop-item--owned'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => canBuy && onBuy(item)}
              style={{ cursor: canBuy ? 'pointer' : 'default' }}
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
                      'Starter'
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

              <div className={styles['shop-item__footer']}>
                <div className={styles['shop-item__owned']}>
                  {t('shop.ownedCount', { count: ownedCount })}
                </div>
                <div className={styles['shop-item__status']}>
                  <span
                    className={[
                      styles['shop-item__buy-label'],
                      !canBuy ? styles['shop-item__buy-label--disabled'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {isOwned
                      ? t('shop.owned')
                      : item.price === 0
                        ? t('shop.free')
                        : t('shop.buyItem')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
