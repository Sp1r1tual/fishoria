import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useScrollCssVar } from '@/hooks/ui/useScrollCssVar';
import { useDynamicBounds } from '@/hooks/game/useDynamicBounds';
import { useResetScrollOnMount } from '@/hooks/ui/useResetScrollOnMount';

import { Footer } from '@/components/Footer/Footer';
import { Masonry } from '@/components/landing/Masonry';
import { BrandingHeader } from '@/components/landing/BrandingHeader';
import { BottomInfo } from '@/components/landing/BottomInfo';
import { CompanyBranding } from '@/components/landing/CompanyBranding';
import { Bubbles } from '@/components/UI/Bubbles/Bubbles';
import { AuthBox } from '@/components/landing/AuthBox';
import { ScrollHint } from '@/components/landing/ScrollHint';
import { TapHint } from '@/components/landing/TapHint';

import styles from './LandingPage.module.css';

export const LandingPage = () => {
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

  const minAllowedHeight = useDynamicBounds(leftColumnRef, 60, 500, []);
  useScrollCssVar(containerRef, containerRef, '--scroll-y');
  const dynamicMinHeight = `max(${minAllowedHeight}px, calc(100svh - calc(var(--scroll-y, 0px) * 1.5)))`;

  return (
    <main ref={containerRef} className={styles.container}>
      <Bubbles count={30} aria-hidden="true" />
      <div className={styles.background} aria-hidden="true" />

      <div className={styles.content}>
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
              <TapHint hidden={isFormOpen} hideOnHover />
            </div>
          </div>

          <CompanyBranding />
        </section>
      </div>

      <div className={styles.footerWrapper}>
        <Footer />
      </div>
    </main>
  );
};
