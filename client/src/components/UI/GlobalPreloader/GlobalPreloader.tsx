import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Bubbles } from '../Bubbles/Bubbles';

import styles from './GlobalPreloader.module.css';

export const GlobalPreloader = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`${styles.globalPreloader} ${visible ? styles.visible : ''}`}
    >
      <Bubbles />
      <div className={styles.text}>{t('common.loading')}</div>
    </div>
  );
};
