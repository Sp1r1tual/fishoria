import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useScrollCssVar } from '@/hooks/ui/useScrollCssVar';
import { useDynamicBounds } from '@/hooks/game/useDynamicBounds';
import { useResetScrollOnMount } from '@/hooks/ui/useResetScrollOnMount';

import { LandingLayout } from '@/layouts/LandingLayout';
import { Masonry } from '@/components/landing/Masonry';
import { BrandingHeader } from '@/components/landing/BrandingHeader';
import { BottomInfo } from '@/components/landing/BottomInfo';
import { CompanyBranding } from '@/components/landing/CompanyBranding';
import { AuthBox } from '@/components/landing/AuthBox';
import { ScrollHint } from '@/components/landing/ScrollHint';
import { TapHint } from '@/components/landing/TapHint';
import { ScrollToTop } from '@/components/landing/ScrollToTop';

import styles from './Landing.module.css';

export const Landing = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);

  const [isSmallScreen, setIsSmallScreen] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 900px)').matches,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  useResetScrollOnMount();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');
    const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsSmallScreen(event.matches);
    };

    handleMediaChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  useDynamicBounds(leftColumnRef, containerRef, '--min-allowed-height', 60, []);
  useScrollCssVar(containerRef, containerRef, '--scroll-y');
  const dynamicMinHeight = `max(var(--min-allowed-height, 500px), calc(100dvh - calc(var(--scroll-y, 0px) * 1.5)))`;

  return (
    <LandingLayout
      ref={containerRef}
      bubbleCount={30}
      contentClassName={styles.content}
    >
      <section
        className={styles.topSection}
        style={{ minHeight: dynamicMinHeight }}
        aria-label={t('landing.hero.ariaLabel', 'Game introduction')}
      >
        <div ref={leftColumnRef} className={styles.leftColumn}>
          {!isFormOpen && (
            <div className={isSmallScreen ? '' : styles.fixedBranding}>
              <BrandingHeader />
            </div>
          )}

          <AuthBox
            onModeChange={(mode) => setIsFormOpen(mode !== 'selection')}
          />
        </div>

        {!isSmallScreen ? <Masonry /> : <ScrollHint hidden={isFormOpen} />}
      </section>

      <section
        className={styles.bottomReveal}
        aria-label={t('landing.features.ariaLabel', 'Game features')}
      >
        {isSmallScreen && <Masonry />}

        <div className={styles.bottomInfoContainer}>
          <div className={styles.bottomInfoHeader}>
            <h2>- {t('bottomInfo.title')} -</h2>
          </div>
          <div className={styles.bottomInfoWrapper}>
            <BottomInfo />
            <TapHint
              hidden={isFormOpen}
              hideOnHover
              top={isSmallScreen ? '25%' : '50%'}
            />
          </div>
          <CompanyBranding />
        </div>
      </section>

      <ScrollToTop />
    </LandingLayout>
  );
};
