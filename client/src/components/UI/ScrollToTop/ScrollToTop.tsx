import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ScrollToTop.module.css';

export const ScrollToTop = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldBeVisible = scrollY > 400;
      setIsVisible((prev) => {
        if (prev !== shouldBeVisible) return shouldBeVisible;
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    buttonRef.current?.blur();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className={styles.wrapper}>
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
    </div>
  );
};
