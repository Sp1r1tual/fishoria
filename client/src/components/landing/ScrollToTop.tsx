import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ScrollToTop.module.css';

export const ScrollToTop = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    footerRef.current = document.querySelector('footer');

    const handleScroll = () => {
      const scrollY = window.scrollY;

      const shouldBeVisible = scrollY > 400;
      setIsVisible((prev) => {
        if (prev !== shouldBeVisible) return shouldBeVisible;
        return prev;
      });

      if (buttonRef.current && footerRef.current) {
        const footerRect = footerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visibleFooterHeight = Math.max(
          0,
          viewportHeight - footerRect.top,
        );

        buttonRef.current.style.setProperty(
          '--footer-offset',
          `${visibleFooterHeight}px`,
        );
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      ref={buttonRef}
      className={`${styles.scrollToTop} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label={t('landing.scrollToTop', 'Scroll to top')}
      type="button"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.icon}
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
};
