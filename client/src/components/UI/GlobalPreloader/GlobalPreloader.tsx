import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Bubbles } from '../Bubbles/Bubbles';

import mainLoading from '@/assets/global/main_loading.webp';

import styles from './GlobalPreloader.module.css';

export const GlobalPreloader = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

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
      </div>
    </div>
  );
};
