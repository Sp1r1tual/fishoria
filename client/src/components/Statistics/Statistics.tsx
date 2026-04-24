import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import type { ILakeStatMetadata } from '@/common/types';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { ExpandButton } from '../UI/buttons/ExpandButton/ExpandButton';

import { usePlayerQuery } from '@/queries/player.queries';

import { LAKES } from '@/common/configs/game';

import forestLakeDay from '@/assets/locations/01_forest_lake_day.webp';
import canalDay from '@/assets/locations/02_pasture_canal_day.webp';
import reservoirDay from '@/assets/locations/03_reservoir_day.webp';

import statisticsIcon from '@/assets/ui/statistics.webp';

import styles from './Statistics.module.css';

const LAKE_PREVIEWS: Record<string, string> = {
  forest_lake: forestLakeDay,
  pasture_canal: canalDay,
  fish_farm: reservoirDay,
};

export function Statistics() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: player } = usePlayerQuery();

  const lakeStats = player?.lakeStats || [];
  const lakesToShow = LAKES;

  const [expandedLakeId, setExpandedLakeId] = useState<string | null>(null);

  return (
    <ScreenContainer
      title={t('statistics.title')}
      titleIcon={statisticsIcon}
      onBack={() => navigate('/')}
      className={styles.statistics}
    >
      <section className={styles['statistics__grid']}>
        {lakesToShow.map((lake) => {
          const stats = lakeStats.find(
            (s: ILakeStatMetadata) => s.lakeId === lake.id,
          ) || {
            id: '',
            lakeId: lake.id,
            totalCaught: 0,
            totalWeight: 0,
            records: {},
            minWeights: {},
            speciesCounts: {},
            speciesWeights: {},
          };

          const records =
            (typeof stats.records === 'string'
              ? JSON.parse(stats.records)
              : stats.records) || {};
          const minWeights =
            (typeof stats.minWeights === 'string'
              ? JSON.parse(stats.minWeights)
              : stats.minWeights) || {};
          const speciesCounts =
            (typeof stats.speciesCounts === 'string'
              ? JSON.parse(stats.speciesCounts)
              : stats.speciesCounts) || {};
          const speciesWeights =
            (typeof stats.speciesWeights === 'string'
              ? JSON.parse(stats.speciesWeights)
              : stats.speciesWeights) || {};

          const fishIds = Object.keys(records);
          const isExpanded = expandedLakeId === lake.id;

          return (
            <article
              key={lake.id}
              className={`glass ${styles['stats-card']} ${isExpanded ? styles['stats-card--expanded'] : ''}`}
            >
              <div className={styles['stats-card__header-preview']}>
                <img
                  src={LAKE_PREVIEWS[lake.id]}
                  alt={`${lake.name} preview`}
                  className={styles['stats-card__preview-img']}
                />
                <div className={styles['stats-card__overlay']} />
              </div>

              <div className={styles['stats-card__body']}>
                <div className={styles['stats-card__main-info']}>
                  <h3 className={styles['stats-card__title']}>
                    {t(`lakes.${lake.id}.name`)}
                  </h3>

                  <div className={styles['stats-card__summaries']}>
                    <div className={styles['stats-card__summary-item']}>
                      {t('statistics.totalCaught')}:{' '}
                      <span>{stats.totalCaught}</span>
                    </div>
                    <div className={styles['stats-card__summary-item']}>
                      {t('statistics.totalWeight')}:{' '}
                      <span>
                        {(stats.totalWeight ?? 0).toFixed(2)} {t('units.kg')}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={styles['stats-card__toggle']}
                  onClick={() => setExpandedLakeId(isExpanded ? null : lake.id)}
                >
                  <span>{t('statistics.details')}</span>

                  <ExpandButton isExpanded={isExpanded} />
                </div>

                <div
                  className={`${styles['stats-card__details']} ${isExpanded ? styles['stats-card__details--open'] : ''}`}
                >
                  <div className={styles['stats-card__species-list']}>
                    {fishIds.length === 0 ? (
                      <div className={styles['stats-card__empty']}>
                        {t('statistics.noRecords')}
                      </div>
                    ) : (
                      fishIds.map((fishId) => {
                        const maxWeight = records[fishId] || 0;
                        const minWeight = minWeights[fishId] ?? 0;
                        const totalWeight = speciesWeights[fishId] ?? 0;
                        const count = speciesCounts[fishId] ?? 1;
                        const name = t(`fish.${fishId}.name`);

                        return (
                          <div
                            key={fishId}
                            className={styles['stats-card__species-item']}
                          >
                            <div
                              className={styles['stats-card__species-header']}
                            >
                              <span
                                className={styles['stats-card__species-name']}
                              >
                                {name}
                              </span>
                              <span
                                className={styles['stats-card__species-count']}
                              >
                                x{count}
                              </span>
                            </div>
                            <div className={styles['stats-card__species-grid']}>
                              <div className={styles['stats-card__spec-data']}>
                                <label>{t('statistics.minWeight')}:</label>
                                <span>
                                  {minWeight.toFixed(3)} {t('units.kg')}
                                </span>
                              </div>
                              <div className={styles['stats-card__spec-data']}>
                                <label>{t('statistics.maxWeight')}:</label>
                                <span>
                                  {maxWeight.toFixed(3)} {t('units.kg')}
                                </span>
                              </div>
                              <div className={styles['stats-card__spec-data']}>
                                <label>{t('statistics.speciesWeight')}:</label>
                                <span>
                                  {totalWeight.toFixed(2)} {t('units.kg')}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </ScreenContainer>
  );
}
