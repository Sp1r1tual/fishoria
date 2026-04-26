import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';
import { WoodySelect } from '../UI/WoodySelect/WoodySelect';

import { FISH_SPECIES, LAKES } from '@/common/configs/game';

import guideIcon from '@/assets/ui/guide.webp';

import styles from './Guide.module.css';

export function Guide() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedLake, setSelectedLake] = useState<string>('all');
  const allFish = Object.values(FISH_SPECIES);

  const getFishHabitats = (fishId: string) => {
    return LAKES.filter((lake) =>
      lake.fishSpawns.species?.some((s) => s.speciesId === fishId),
    ).map((lake) => t(`lakes.${lake.id}.name`));
  };

  const filteredFish = allFish.filter((fish) => {
    if (selectedLake === 'all') return true;
    const lake = LAKES.find((l) => l.id === selectedLake);
    return (
      lake?.fishSpawns.species?.some((s) => s.speciesId === fish.id) || false
    );
  });

  return (
    <ScreenContainer
      title={t('guide.title')}
      titleIcon={guideIcon}
      onBack={() => navigate('/')}
      className={styles.guide}
      width="lg"
    >
      <div>
        <div className={styles['guide__filter']}>
          <label
            htmlFor="lake-filter"
            className={`glass ${styles['guide__filter-label']}`}
          >
            {t('guide.filterByLake', 'Filter by Lake')}:
          </label>
          <WoodySelect
            size="sm"
            value={selectedLake}
            onChange={(val) => setSelectedLake(val)}
            options={[
              { value: 'all', label: t('guide.allLakes', 'All Lakes') },
              ...LAKES.map((lake) => ({
                value: lake.id,
                label: t(`lakes.${lake.id}.name`),
              })),
            ]}
          />
        </div>
        <section className={styles['guide__content']}>
          {filteredFish.map((fish) => (
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
                  <div className={styles['guide__fish-title-wrapper']}>
                    <h3 className={styles['guide__fish-name']}>
                      {t(`fish.${fish.id}.name`)}
                    </h3>
                  </div>
                </div>
                <div className={styles['guide__fish-details']}>
                  <p>
                    <strong>{t('guide.description')}:</strong>{' '}
                    {t(`fish.${fish.id}.description`)}
                  </p>
                  <p>
                    <strong>{t('guide.habitats')}:</strong>{' '}
                    {getFishHabitats(fish.id).join(', ') || t('guide.any')}
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
      </div>
    </ScreenContainer>
  );
}
