import { useTranslation } from 'react-i18next';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';
import { BluredOverlay } from '@/components/UI/BluredOverlay/BluredOverlay';
import { Bubbles } from '@/components/UI/Bubbles/Bubbles';

import mainBg from '@/assets/ui/main_menu_background.webp';

import styles from './ServerUnavailable.module.css';

export const ServerUnavailable = () => {
  const { t } = useTranslation();

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

          <h1 className={styles.title}>{t('common.serverUnavailableTitle')}</h1>

          <p className={styles.description}>
            {t('common.serverUnavailableDesc')}
          </p>

          <div className={styles.buttonWrapper}>
            <WoodyButton
              variant="brown"
              size="md"
              onClick={() => (window.location.href = '/')}
              label={t('common.refresh')}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
