import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';
import { BluredOverlay } from '@/components/UI/BluredOverlay/BluredOverlay';
import { Bubbles } from '@/components/UI/Bubbles/Bubbles';

import mainBg from '@/assets/ui/main_menu_background.webp';

import styles from './ServerUnavailable.module.css';

export const ServerUnavailable = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      initialLoader.classList.add('loader-hidden');
      setTimeout(() => initialLoader.remove(), 600);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${mainBg})` }}
        aria-hidden="true"
      />
      <BluredOverlay opacity={0.6} blurSize="10px" aria-hidden="true" />

      <Bubbles aria-hidden="true" />

      <main className={styles.content}>
        <div className={`glass fade-in ${styles.card}`}>
          <p className={styles.errorCode} aria-hidden="true">
            500
          </p>

          <h1 className={styles.title}>{t('serverUnavailable.title')}</h1>

          <p className={styles.description}>
            {t('serverUnavailable.description')}
          </p>

          <div className={styles.buttonWrapper}>
            <WoodyButton
              variant="brown"
              size="md"
              onClick={() => (window.location.href = '/')}
              label={t('common.retry')}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
