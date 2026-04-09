import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import type { IGadgetConfig } from '@/common/types';

import { useShop } from '@/hooks/game/useShop';
import { useClickSound } from '@/hooks/audio/useClickSound';

import { ConfirmChoiceModal } from '../UI/modals/ConfirmChoiceModal/ConfirmChoiceModal';
import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { GlassPanel } from '../UI/GlassPanel/GlassPanel';
import { GearSection } from './GearSection';
import { ItemIcon } from '../UI/ItemIcon/ItemIcon';

import {
  BAITS,
  BAIT_IDS,
  GROUNDBAITS,
  GROUNDBAIT_IDS,
  SHOP_RODS,
  SHOP_REELS,
  SHOP_LINES,
  SHOP_HOOKS,
  SHOP_GADGETS,
} from '@/common/configs/game';

import coinIcon from '@/assets/ui/coin.webp';
import shopIcon from '@/assets/ui/keepnet.webp';

import styles from './Shop.module.css';

const TABS = [
  'bait',
  'groundbait',
  'rods',
  'reels',
  'lines',
  'hooks',
  'gadgets',
] as const;
type TabType = (typeof TABS)[number];

export function Shop() {
  const navigate = useNavigate();
  const playClick = useClickSound();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('bait');

  const {
    money,
    baitCounts,
    groundbaitCounts,
    qtys,
    modal,
    closeModal,
    decreaseQty,
    increaseQty,
    getOwnedCount,
    handleBuyBait,
    handleBuyGroundbait,
    handleBuyGear,
    handleBuyGadget,
    isUniqueGadget,
  } = useShop();

  return (
    <>
      <ScreenContainer
        title={t('shop.title')}
        titleIcon={shopIcon}
        onBack={() => navigate('/')}
        className={styles.shop}
        headerExtra={
          <div className={styles['shop__balance']}>
            <img
              src={coinIcon}
              alt="coins"
              className={styles['shop__coin-icon']}
            />
            {money}
          </div>
        }
      >
        <div className={styles['shop__content_wrapper']}>
          <GlassPanel>
            <div className={styles['shop__tabs']}>
              {TABS.map((tab) => (
                <WoodyButton
                  key={tab}
                  variant={activeTab === tab ? 'green' : 'brown'}
                  size="sm"
                  className={styles['shop__tab']}
                  onClick={() => setActiveTab(tab)}
                  label={t(`shop.tabs.${tab}`)}
                />
              ))}
            </div>
          </GlassPanel>

          <div className={styles['shop__tabs-container']}>
            {activeTab === 'bait' && (
              <div className={styles['shop__section']}>
                <div className={styles['shop__section-title']}>
                  {t('shop.tabs.bait')}
                </div>
                <div className={styles['shop__grid']}>
                  {BAIT_IDS.map((id) => {
                    const bait = BAITS[id];
                    const qty = qtys[id] ?? 1;
                    return (
                      <div key={id} className={styles['shop-item']}>
                        <div className={styles['shop-item__top']}>
                          <div className={styles['shop-item__icon']}>
                            <ItemIcon icon={bait.icon} />
                          </div>
                          <div className={styles['shop-item__info']}>
                            <div className={styles['shop-item__name']}>
                              {t(`baits.${bait.id}.name`)}
                            </div>
                            <div className={styles['shop-item__price']}>
                              <img
                                src={coinIcon}
                                alt="coins"
                                className={styles['shop-item__coin-icon-sm']}
                              />
                              {bait.price} {t('shop.perEach')}
                            </div>
                          </div>
                        </div>

                        <div className={styles['shop-item__desc']}>
                          {t(`baits.${bait.id}.description`)}
                        </div>
                        <div className={styles['shop-item__owned']}>
                          {t('inventory.title')}:{' '}
                          <span>{baitCounts[id] ?? 0}</span>
                        </div>

                        <div className={styles['shop-item__footer']}>
                          <div className={styles['shop-item__qty-control']}>
                            <WoodyButton
                              variant="brown"
                              size="sm"
                              className={styles['shop-item__qty-btn']}
                              onClick={() => decreaseQty(id)}
                            >
                              -
                            </WoodyButton>
                            <input
                              id={`bait-qty-${id}`}
                              name={`bait-qty-${id}`}
                              type="number"
                              min={1}
                              max={99}
                              value={qty}
                              className={styles['shop-item__qty']}
                              readOnly
                            />
                            <WoodyButton
                              variant="brown"
                              size="sm"
                              className={styles['shop-item__qty-btn']}
                              onClick={() => increaseQty(id)}
                            >
                              +
                            </WoodyButton>
                          </div>
                          <WoodyButton
                            variant="brown"
                            size="sm"
                            className={styles['shop-item__buy-btn']}
                            onClick={() => handleBuyBait(id)}
                            disabled={money < bait.price * qty}
                            label={t('shop.buyButton', { qty })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'groundbait' && (
              <div className={styles['shop__section']}>
                <div className={styles['shop__section-title']}>
                  {t('shop.tabs.groundbait')}
                </div>
                <div className={styles['shop__grid']}>
                  {GROUNDBAIT_IDS.map((id) => {
                    const gb = GROUNDBAITS[id];
                    const qty = qtys[id] ?? 1;
                    return (
                      <div key={id} className={styles['shop-item']}>
                        <div className={styles['shop-item__top']}>
                          <div className={styles['shop-item__icon']}>
                            <ItemIcon icon={gb.icon} />
                          </div>
                          <div className={styles['shop-item__info']}>
                            <div className={styles['shop-item__name']}>
                              {t(`groundbaits.${gb.id}.name`)}
                            </div>
                            <div className={styles['shop-item__price']}>
                              <img
                                src={coinIcon}
                                alt="coins"
                                className={styles['shop-item__coin-icon-sm']}
                              />
                              {gb.price} {t('shop.perEach')}
                            </div>
                          </div>
                        </div>

                        <div className={styles['shop-item__desc']}>
                          {t(`groundbaits.${gb.id}.description`)}
                        </div>
                        <div className={styles['shop-item__owned']}>
                          {t('inventory.title')}:{' '}
                          <span>{groundbaitCounts[id] ?? 0}</span>
                        </div>

                        <div className={styles['shop-item__footer']}>
                          <div className={styles['shop-item__qty-control']}>
                            <WoodyButton
                              variant="brown"
                              size="sm"
                              className={styles['shop-item__qty-btn']}
                              onClick={() => decreaseQty(id)}
                            >
                              -
                            </WoodyButton>
                            <input
                              id={`gb-qty-${id}`}
                              name={`gb-qty-${id}`}
                              type="number"
                              min={1}
                              max={99}
                              value={qty}
                              className={styles['shop-item__qty']}
                              readOnly
                            />
                            <WoodyButton
                              variant="brown"
                              size="sm"
                              className={styles['shop-item__qty-btn']}
                              onClick={() => increaseQty(id)}
                            >
                              +
                            </WoodyButton>
                          </div>
                          <WoodyButton
                            variant="brown"
                            size="sm"
                            className={styles['shop-item__buy-btn']}
                            onClick={() => handleBuyGroundbait(id)}
                            disabled={money < gb.price * qty}
                            label={t('shop.buyButton', { qty })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'rods' && (
              <GearSection
                title={t('shop.tabs.rods')}
                items={SHOP_RODS}
                type="rod"
                onBuy={(item) => {
                  playClick();
                  handleBuyGear('rod', item);
                }}
                money={money}
                ownedCountFn={getOwnedCount}
                isUniqueGadget={isUniqueGadget}
                styles={styles}
                t={t}
              />
            )}
            {activeTab === 'reels' && (
              <GearSection
                title={t('shop.tabs.reels')}
                items={SHOP_REELS}
                type="reel"
                onBuy={(item) => {
                  playClick();
                  handleBuyGear('reel', item);
                }}
                money={money}
                ownedCountFn={getOwnedCount}
                isUniqueGadget={isUniqueGadget}
                styles={styles}
                t={t}
              />
            )}
            {activeTab === 'lines' && (
              <GearSection
                title={t('shop.tabs.lines')}
                items={SHOP_LINES}
                type="line"
                onBuy={(item) => {
                  playClick();
                  handleBuyGear('line', item);
                }}
                money={money}
                ownedCountFn={getOwnedCount}
                isUniqueGadget={isUniqueGadget}
                styles={styles}
                t={t}
              />
            )}
            {activeTab === 'hooks' && (
              <GearSection
                title={t('shop.tabs.hooks')}
                items={SHOP_HOOKS}
                type="hook"
                onBuy={(item) => {
                  playClick();
                  handleBuyGear('hook', item);
                }}
                money={money}
                ownedCountFn={getOwnedCount}
                isUniqueGadget={isUniqueGadget}
                styles={styles}
                t={t}
              />
            )}
            {activeTab === 'gadgets' && (
              <GearSection
                title={t('shop.tabs.gadgets')}
                items={SHOP_GADGETS}
                type="gadget"
                onBuy={(item) => {
                  playClick();
                  handleBuyGadget(item as IGadgetConfig);
                }}
                money={money}
                ownedCountFn={getOwnedCount}
                isUniqueGadget={isUniqueGadget}
                styles={styles}
                t={t}
              />
            )}
          </div>
        </div>
      </ScreenContainer>

      <ConfirmChoiceModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        icon={modal.icon}
        price={modal.price}
        coinIcon={coinIcon}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />
    </>
  );
}
