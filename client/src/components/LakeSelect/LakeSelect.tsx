import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';

import { useAppDispatch } from '@/hooks/core/useAppStore';
import { usePlayerQuery } from '@/queries/player.queries';
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

  const handleSelect = (lakeId: string) => {
    dispatch(setCurrentLake(lakeId));
    dispatch(navigateTo('game'));
  };

  const collapseTimeouts = useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});
  const expandTimeouts = useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});

  const collapse = (id: string, isInstant = false) => {
    const p = descRefs.current[id];
    const preview = previewRefs.current[id];
    const card = cardRefs.current[id];

    if (!p || !preview || !card) return;

    if (isInstant) {
      const cTimeout = collapseTimeouts.current[id];
      if (cTimeout) clearTimeout(cTimeout);
      const eTimeout = expandTimeouts.current[id];
      if (eTimeout) clearTimeout(eTimeout);

      p.style.transition = 'none';
      preview.style.transition = 'none';

      p.style.maxHeight = '';
      p.style.overflowY = '';
      p.style.webkitLineClamp = '2';
      (p.style as CSSStyleDeclaration & { lineClamp: string }).lineClamp = '2';
      preview.style.height = '';
      card.style.height = '';
      card.classList.remove(styles['is-expanded']);

      void p.offsetHeight;
      p.style.transition = '';
      preview.style.transition = '';

      delete collapseTimeouts.current[id];
      return;
    }

    if (p) {
      p.style.maxHeight = '40px';
      p.style.overflowY = 'hidden';
    }
    if (preview) {
      preview.style.height = '';
    }

    const cTimeout = collapseTimeouts.current[id];
    if (cTimeout) {
      clearTimeout(cTimeout);
    }
    const eTimeout = expandTimeouts.current[id];
    if (eTimeout) {
      clearTimeout(eTimeout);
    }

    collapseTimeouts.current[id] = setTimeout(() => {
      const currentP = descRefs.current[id];
      const currentCard = cardRefs.current[id];
      if (currentP) {
        currentP.style.maxHeight = '';
        currentP.style.webkitLineClamp = '2';
        (
          currentP.style as CSSStyleDeclaration & { lineClamp: string }
        ).lineClamp = '2';
      }
      if (currentCard) {
        currentCard.style.height = '';
        currentCard.classList.remove(styles['is-expanded']);
      }
      delete collapseTimeouts.current[id];
    }, 300);
  };

  const expand = (id: string) => {
    const card = cardRefs.current[id];
    const p = descRefs.current[id];
    const preview = previewRefs.current[id];

    if (!p || !card || !preview) return;

    const cTimeout = collapseTimeouts.current[id];
    if (cTimeout) {
      clearTimeout(cTimeout);
      delete collapseTimeouts.current[id];
    }

    card.style.height = `${card.offsetHeight}px`;
    card.classList.add(styles['is-expanded']);

    const startHeight = p.clientHeight;
    p.style.maxHeight = `${startHeight}px`;
    p.style.webkitLineClamp = 'unset';
    (p.style as CSSStyleDeclaration & { lineClamp: string }).lineClamp =
      'unset';

    const fullHeight = p.scrollHeight;
    void p.offsetHeight;

    const isSmallHeight = window.innerHeight < 500;
    const isSmallWidth = window.innerWidth < 600;

    const targetHeight = isSmallHeight
      ? '40px'
      : isSmallWidth
        ? '90px'
        : '70px';

    preview.style.height = targetHeight;
    p.style.maxHeight = `${fullHeight}px`;

    const eTimeout = expandTimeouts.current[id];
    if (eTimeout) {
      clearTimeout(eTimeout);
    }

    expandTimeouts.current[id] = setTimeout(() => {
      const currentP = descRefs.current[id];
      if (currentP) currentP.style.overflowY = 'auto';
      expandTimeouts.current[id] = null;
    }, 300);
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      if (expandedIdRef.current) {
        collapse(expandedIdRef.current, true);
        expandedIdRef.current = null;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

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
