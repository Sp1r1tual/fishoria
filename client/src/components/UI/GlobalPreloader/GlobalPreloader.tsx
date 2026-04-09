import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Bubbles } from '../Bubbles/Bubbles';

import mainLoading from '@/assets/global/main_loading.webp';

import styles from './GlobalPreloader.module.css';

interface GlobalPreloaderProps {
  children?: React.ReactNode;
  delay?: number;
}

export const GlobalPreloader = ({
  children,
  delay = 700,
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

  return (
    <div
      className={`${styles.globalPreloader} ${visible ? styles.visible : ''}`}
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
