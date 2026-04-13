import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';

import { FISH_SPECIES } from '@/common/configs/game';

import guideIcon from '@/assets/ui/guide.webp';

import styles from './Guide.module.css';

export function Guide() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fishList = Object.values(FISH_SPECIES);

  return (
    <ScreenContainer
      title={t('guide.title')}
      titleIcon={guideIcon}
      onBack={() => navigate('/')}
      className={styles.guide}
    >
      <section className={styles['guide__content']}>
        {fishList.map((fish) => (
          <article
            key={fish.id}
            className={`glass ${styles['guide__fish-card']}`}
          >
            <div className={styles['guide__fish-info']}>
              <div className={styles['guide__fish-header']}>
                <SkeletonImage
                  src={fish.imageUrl}
                  alt={fish.name}
                  width={100}
                  height={60}
                  objectFit="contain"
                  wrapperClassName={styles['guide__fish-icon']}
                />
                <h3 className={styles['guide__fish-name']}>
                  {t(`fish.${fish.id}.name`)}
                </h3>
              </div>
              <div className={styles['guide__fish-details']}>
                <p>
                  <strong>{t('guide.description')}:</strong>{' '}
                  {t(`fish.${fish.id}.description`)}
                </p>
                <p>
                  <strong>{t('guide.weightRange')}:</strong>{' '}
                  {fish.weightRange.min} - {fish.weightRange.max} kg
                </p>
                <p>
                  <strong>{t('guide.favoredBaits')}:</strong>{' '}
                  {fish.preferredBaits
                    .map((b) => t(`baits.${b}.name`))
                    .join(', ') || t('guide.any')}
                </p>
                <p>
                  <strong>{t('guide.favoredMix')}:</strong>{' '}
                  {fish.preferredGroundbait !== 'none'
                    ? t(`groundbaits.${fish.preferredGroundbait}.name`)
                    : t('guide.noPreference')}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </ScreenContainer>
  );
}
