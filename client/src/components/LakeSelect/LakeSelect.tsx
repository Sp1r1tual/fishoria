import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '@/hooks/core/useAppStore';
import { usePlayerQuery } from '@/queries/player.queries';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';

import { navigateTo } from '@/store/slices/uiSlice';
import { setCurrentLake } from '@/store/slices/gameSlice';

import { LAKES } from '@/common/configs/game';

import boatIcon from '@/assets/ui/boat.webp';

import styles from './LakeSelect.module.css';

export function LakeSelect() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { data: player } = usePlayerQuery();
  const descRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const expandedIdRef = useRef<string | null>(null);
  const initialHeightsRef = useRef<Record<string, number>>({});

  const handleSelect = (lakeId: string) => {
    dispatch(setCurrentLake(lakeId));
    dispatch(navigateTo('game'));
  };

  const collapse = (id: string) => {
    const p = descRefs.current[id];
    const preview = previewRefs.current[id];

    if (p) {
      p.style.maxHeight = '';
      p.style.webkitLineClamp = '2';
    }
    if (preview) {
      preview.style.height = '';
    }
  };

  const expand = (id: string) => {
    const card = cardRefs.current[id];
    const p = descRefs.current[id];
    const preview = previewRefs.current[id];

    if (!p || !card || !preview) return;

    if (!initialHeightsRef.current[id]) {
      initialHeightsRef.current[id] = card.getBoundingClientRect().height;
    }
    card.style.height = `${initialHeightsRef.current[id]}px`;

    const startHeight = p.clientHeight;
    p.style.maxHeight = `${startHeight}px`;
    p.style.webkitLineClamp = 'unset';

    const fullHeight = p.scrollHeight;
    void p.offsetHeight;

    preview.style.height = '80px';
    p.style.maxHeight = `${fullHeight}px`;
  };

  const handleDescClick = (lakeId: string) => {
    if (expandedIdRef.current === lakeId) {
      collapse(lakeId);
      expandedIdRef.current = null;
    } else {
      if (expandedIdRef.current) {
        collapse(expandedIdRef.current);
      }
      expand(lakeId);
      expandedIdRef.current = lakeId;
    }
  };

  return (
    <ScreenContainer
      title={t('lakeSelect.title')}
      titleIcon={boatIcon}
      onBack={() => dispatch(navigateTo('mainMenu'))}
      className={styles['lake-select']}
    >
      <div className={`${styles['lake-select__grid']} fade-in`}>
        {LAKES.map((lake) => (
          <div
            key={lake.id}
            id={`lake-card-${lake.id}`}
            ref={(el) => {
              cardRefs.current[lake.id] = el;
            }}
            className={styles['lake-card']}
          >
            <div
              ref={(el) => {
                previewRefs.current[lake.id] = el;
              }}
              className={styles['lake-card__preview']}
              style={{
                backgroundImage: `url(${lake.timeOfDayConfig.day.bgImageUrl})`,
              }}
            >
              <div className={styles['lake-card__overlay']} />
            </div>
            <div className={styles['lake-card__badge']}>
              Lv.{lake.unlockLevel}
            </div>

            <div className={styles['lake-card__body']}>
              <div className={styles['lake-card__content']}>
                <div className={styles['lake-card__name']}>
                  {t(`lakes.${lake.id}.name`)}
                </div>
                <p
                  ref={(el) => {
                    descRefs.current[lake.id] = el;
                  }}
                  className={styles['lake-card__desc']}
                  onClick={() => handleDescClick(lake.id)}
                >
                  {t(`lakes.${lake.id}.description`)}
                </p>
              </div>
              <div className={styles['lake-card__stats']}>
                <div className={styles['lake-card__stat']}>
                  {t('hud.depth')}:{' '}
                  <span>
                    {lake.depthMap.minDepth}–{lake.depthMap.maxDepth}m
                  </span>
                </div>
              </div>
            </div>

            {player && player.level < lake.unlockLevel ? (
              <WoodyButton
                variant="red"
                size="sm"
                className={styles['lake-card__action']}
                label={t('lakeSelect.locked')}
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            ) : (
              <WoodyButton
                variant="green"
                size="sm"
                className={styles['lake-card__action']}
                label={t('lakeSelect.go')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(lake.id);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </ScreenContainer>
  );
}
