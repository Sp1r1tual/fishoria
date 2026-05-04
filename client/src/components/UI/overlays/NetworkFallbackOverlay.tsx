import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import type { RootState } from '@/store/store';

import styles from './NetworkFallbackOverlay.module.css';

export const NetworkFallbackOverlay: React.FC = () => {
  const isNetworkOffline = useSelector(
    (state: RootState) => state.ui.isNetworkOffline,
  );
  const { t } = useTranslation();

  if (!isNetworkOffline) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.spinner} />
        <h2 className={styles.title}>{t('network.offline.title')}</h2>
        <p className={styles.description}>{t('network.offline.description')}</p>
      </div>
    </div>
  );
};
