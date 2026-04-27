import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Bubbles } from '../Bubbles/Bubbles';

import mainLoading from '@/assets/global/main_loading.webp';

import styles from './GlobalPreloader.module.css';

interface GlobalPreloaderProps {
  children?: React.ReactNode;
  delay?: number;
  isInline?: boolean;
  className?: string;
}

export const GlobalPreloader = ({
  children,
  delay = 700,
  isInline = false,
  className = '',
}: GlobalPreloaderProps) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(delay === 0);
  const [prevDelay, setPrevDelay] = useState(delay);

  if (delay !== prevDelay) {
    setPrevDelay(delay);
    setVisible(delay === 0);
  }

  useEffect(() => {
    if (delay === 0 || visible) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, visible]);

  useEffect(() => {
    if (isInline) return;

    if (visible) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [visible, isInline]);

  return (
    <div
      className={`${styles.globalPreloader} ${visible ? styles.visible : ''} ${
        isInline ? styles.inline : ''
      } ${className}`}
    >
      <Bubbles />
      <div className={styles.loaderContent}>
        <img
          src={mainLoading}
          alt={t('common.loading')}
          className={styles.loaderImage}
        />
        {children && <div className={styles.loaderText}>{children}</div>}
      </div>
    </div>
  );
};
