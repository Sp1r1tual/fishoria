import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useClickSound } from '@/hooks/audio/useSoundEffect';
import { useGameAudio } from '@/hooks/audio/useGameAudio';

import type { IFishCatchMetadata } from '@/common/types/player.types';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { ScreenHeader } from '../UI/ScreenHeader/ScreenHeader';

import { useAppDispatch } from '@/hooks/core/useAppStore';
import { navigateTo, addToast } from '@/store/slices/uiSlice';
import { usePlayerQuery } from '@/queries/player.queries';
import { useSellMutation } from '@/queries/shop.queries';

import { FISH_SPECIES, ECONOMY } from '@/common/configs/game';

import coinIcon from '@/assets/ui/coin.webp';
import keepnetIcon from '@/assets/ui/keepnet.webp';

import styles from './Inventory.module.css';

export function Inventory({ isModal = false }: { isModal?: boolean }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: player } = usePlayerQuery();
  const sellMutation = useSellMutation();

  const money = player?.money ?? 0;
  const inventory = (player?.fishCatches ?? []).filter(
    (f: IFishCatchMetadata) => !f.isReleased,
  );

  const playClick = useClickSound();
  const { onPurchase } = useGameAudio(false);
  const { t } = useTranslation();

  const totalWeight = inventory.reduce(
    (s: number, f: IFishCatchMetadata) => s + f.weight,
    0,
  );
  const totalValue = inventory.reduce((s: number, f: IFishCatchMetadata) => {
    const species = FISH_SPECIES[f.speciesId as keyof typeof FISH_SPECIES];
    const multiplier = species?.priceMultiplier || 1.0;
    return s + Math.ceil(f.weight * ECONOMY.baseFishPricePerKg * multiplier);
  }, 0);

  const handleBack = () => {
    playClick();
    if (isModal) {
      dispatch(navigateTo('game'));
    } else {
      navigate('/');
    }
  };

  const handleSellAll = async () => {
    if (inventory.length === 0) return;
    const soldAmount = totalValue;
    playClick();
    onPurchase();
    try {
      await sellMutation.mutateAsync();
      dispatch(
        addToast({
          message: t('inventory.soldMessage', { value: soldAmount }),
          type: 'success',
        }),
      );
    } catch (e) {
      console.error('Failed to sell fish', e);
    }
  };

  const sellButton = inventory.length > 0 && (
    <WoodyButton
      variant="green"
      size="sm"
      id="sell-all-btn"
      onClick={handleSellAll}
      disabled={sellMutation.isPending}
    >
      {t('inventory.sellAll')} –{' '}
      <img
        src={coinIcon}
        alt="coins"
        className={styles['inventory__coin-icon-btn-sm']}
      />{' '}
      {totalValue}
    </WoodyButton>
  );

  const content = (
    <div
      className={`${styles['inventory__inner']} ${!isModal ? 'fade-in' : ''}`}
    >
      {isModal && (
        <>
          <ScreenHeader
            title={t('inventory.title')}
            titleIcon={keepnetIcon}
            onBack={handleBack}
            headerExtra={sellButton}
            sticky
          />
        </>
      )}

      <section className={styles['inventory__stats']}>
        <div className={styles['inventory__stat']}>
          <div className={styles['inventory__stat-value']}>
            {inventory.length}
          </div>
          <div className={styles['inventory__stat-label']}>
            {t('inventory.fish')}
          </div>
        </div>
        <div className={styles['inventory__stat']}>
          <div className={styles['inventory__stat-value']}>
            {totalWeight.toFixed(2)}
          </div>
          <div className={styles['inventory__stat-label']}>
            {t('inventory.totalKg')}
          </div>
        </div>
        <div className={styles['inventory__stat']}>
          <div
            className={
              styles['inventory__stat-value'] +
              ' ' +
              styles['inventory__stat-value--accent']
            }
          >
            <img
              src={coinIcon}
              alt="coins"
              className={styles['inventory__stat-icon']}
            />{' '}
            {totalValue}
          </div>
          <div className={styles['inventory__stat-label']}>
            {t('inventory.sellValue')}
          </div>
        </div>
        <div className={styles['inventory__stat']}>
          <div
            className={
              styles['inventory__stat-value'] +
              ' ' +
              styles['inventory__stat-value--accent']
            }
          >
            <img
              src={coinIcon}
              alt="coins"
              className={styles['inventory__stat-icon']}
            />{' '}
            {money}
          </div>
          <div className={styles['inventory__stat-label']}>
            {t('inventory.balance')}
          </div>
        </div>
      </section>

      {inventory.length === 0 ? (
        <section className={styles['inventory__empty-container']}>
          <div className={styles['inventory__empty']}>
            <div className={styles['inventory__empty-icon']}>🎣</div>
            <p>{t('inventory.empty')}</p>
            <p style={{ marginTop: 8 }}>{t('inventory.goFish')}</p>
          </div>
        </section>
      ) : (
        <>
          <section className={styles['inventory__table-container']}>
            <div className={styles['inventory__table-wrap']}>
              <table className={styles['inventory__table']}>
                <thead>
                  <tr>
                    <th>{t('inventory.table.fish')}</th>
                    <th>{t('inventory.table.weight')}</th>
                    <th>{t('inventory.table.bait')}</th>
                    <th>{t('inventory.table.lake')}</th>
                    <th>{t('inventory.table.value')}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((f: IFishCatchMetadata, i: number) => (
                    <tr key={i}>
                      <td className={styles['inventory__fish-name']}>
                        {t(`fish.${f.speciesId}.name`)}
                      </td>
                      <td className={styles['inventory__weight']}>
                        {f.weight.toFixed(3)} {t('units.kg')}
                      </td>
                      <td className={styles['inventory__bait-cell']}>
                        {t(`baits.${f.baitUsed}.name`)}
                      </td>
                      <td className={styles['inventory__lake-cell']}>
                        {t(`lakes.${f.lakeId}.name`)}
                      </td>
                      <td className={styles['inventory__value']}>
                        <img
                          src={coinIcon}
                          alt="coins"
                          className={styles['inventory__coin-icon-sm']}
                        />{' '}
                        {(() => {
                          const species =
                            FISH_SPECIES[
                              f.speciesId as keyof typeof FISH_SPECIES
                            ];
                          const multiplier = species?.priceMultiplier || 1.0;
                          return Math.ceil(
                            f.weight * ECONOMY.baseFishPricePerKg * multiplier,
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );

  if (isModal) {
    return <div className={styles.inventory__modal_wrap}>{content}</div>;
  }

  return (
    <ScreenContainer
      title={t('inventory.title')}
      titleIcon={keepnetIcon}
      onBack={handleBack}
      className={styles.inventory}
      headerExtra={sellButton}
    >
      {content}
    </ScreenContainer>
  );
}
