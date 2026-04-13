import { useTranslation } from 'react-i18next';

import type { IFishCatch, CatchResultType } from '@/common/types';

import { useClickSound } from '@/hooks/audio/useSoundEffect';
import { useAppDispatch } from '@/hooks/core/useAppStore';

import { UniversalModal } from '@/components/UI/modals/UniversalModal/UniversalModal';
import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';

import {
  useCatchFishMutation,
  useBreakGearMutation,
} from '@/queries/game.queries';
import { clearCatch, resetGame } from '@/store/slices/gameSlice';

import type { LakeScene } from '@/game/engine/scenes/LakeScene';

import { getFishQuality, getFishQualityLabel } from '@/common/utils/fish.utils';

import trashIcon from '@/assets/ui/trash_icon.webp';

import styles from './CatchPopup.module.css';

interface ICatchPopupProps {
  result: CatchResultType;
  sceneRef: React.RefObject<LakeScene | null>;
}

export function CatchPopup({ result, sceneRef }: ICatchPopupProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const playClick = useClickSound();
  const catchMutation = useCatchFishMutation();
  const breakMutation = useBreakGearMutation();

  const handleKeep = () => {
    playClick();
    if (result.type === 'fish') {
      const fish = result as IFishCatch;
      const maxW = fish.species.weightRange.max;
      catchMutation.mutate({
        speciesId: fish.species.id,
        speciesName: fish.species.name,
        weight: fish.weight,
        length: fish.length,
        lakeId: fish.lakeId,
        lakeName: fish.lakeName,
        baitUsed: fish.baitUsed,
        method: fish.method,
        maxWeight: maxW,
        sizeRank: getFishQualityLabel(fish.weight, maxW),
        isReleased: false,
        rodDamage: fish.rodDamage || 0,
        reelDamage: fish.reelDamage || 0,
      });
    }
    dispatch(clearCatch());
    dispatch(resetGame());
    sceneRef.current?.resetCast();
  };

  const handleRelease = () => {
    playClick();
    if (result.type === 'fish') {
      const fish = result as IFishCatch;
      const maxW = fish.species.weightRange.max;
      catchMutation.mutate({
        speciesId: fish.species.id,
        speciesName: fish.species.name,
        weight: fish.weight,
        length: fish.length,
        lakeId: fish.lakeId,
        lakeName: fish.lakeName,
        baitUsed: fish.baitUsed,
        method: fish.method,
        maxWeight: maxW,
        sizeRank: getFishQualityLabel(fish.weight, maxW),
        isReleased: true,
        rodDamage: fish.rodDamage || 0,
        reelDamage: fish.reelDamage || 0,
      });
    } else if (result.type === 'trash') {
      const trash = result as import('../../common/types').ITrashCatch;
      if (trash.rodDamage || trash.reelDamage) {
        breakMutation.mutate({
          type: 'bait',
          rodDamage: trash.rodDamage || 0,
          reelDamage: trash.reelDamage || 0,
        });
      }
    }
    dispatch(clearCatch());
    dispatch(resetGame());
    sceneRef.current?.resetCast();
  };

  if (result.type === 'trash') {
    return (
      <UniversalModal
        isOpen={true}
        type="default"
        title={t(`trash.${result.name}.name`)}
        header={
          <div className={styles.trashImageContainer}>
            <img src={trashIcon} alt="Trash" className={styles.trashImage} />
          </div>
        }
        actions={
          <WoodyButton
            id="catch-discard"
            variant="green"
            onClick={handleRelease}
            label={t('catch.discard')}
          />
        }
      >
        <p className={styles.trashDesc}>
          {t(`trash.${result.name}.description`)}
        </p>
      </UniversalModal>
    );
  }

  const fish = result as IFishCatch;

  const maxW = fish.species.weightRange.max;
  const { isTrophy } = getFishQuality(fish.weight, maxW);
  const sizeRank = getFishQualityLabel(fish.weight, maxW);

  const sizeRankLabel = t(`catch.${sizeRank}`);

  return (
    <UniversalModal
      isOpen={true}
      type={isTrophy ? 'success' : 'info'}
      title={t(`fish.${fish.species.id}.name`)}
      description={
        <div className={styles.statsRow}>
          <span>{sizeRankLabel}</span>
          <span className={styles.dot}>•</span>
          <span>{fish.weight.toFixed(3)} kg</span>
        </div>
      }
      header={
        <div className={styles.fishImageContainer}>
          <img
            className={styles.fishImage}
            src={fish.species.imageUrl}
            alt={fish.species.name}
          />
        </div>
      }
      actions={
        <>
          <WoodyButton
            id="catch-keep"
            onClick={handleKeep}
            label={t('catch.keep')}
            variant="green"
          />

          <WoodyButton
            id="catch-release"
            onClick={handleRelease}
            label={t('catch.release')}
            variant="brown"
          />
        </>
      }
    >
      <div className={styles.fishBody}>
        <p className={styles.fishDesc}>
          {t(`fish.${fish.species.id}.description`)}
        </p>

        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <span>{t('catch.baitUsed')}</span>
            <span>
              {fish.baitUsed.includes('_') || !fish.baitUsed.includes(' ')
                ? t(`baits.${fish.baitUsed.toLowerCase()}.name`)
                : fish.baitUsed}
            </span>
          </div>
          <div className={styles.metaRow}>
            <span>{t('catch.caughtAt')}</span>
            <span>{t(`lakes.${fish.lakeId}.name`)}</span>
          </div>
        </div>
      </div>
    </UniversalModal>
  );
}
