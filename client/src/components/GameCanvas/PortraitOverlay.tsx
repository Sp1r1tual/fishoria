import cellphoneIcon from '@/assets/ui/cellphone.webp';

import styles from './GameCanvas.module.css';

export function PortraitOverlay({ t }: { t: (key: string) => string }) {
  return (
    <div className={styles['game-canvas__portrait-overlay']}>
      <div className={styles['rotate-icon']}>
        <img
          src={cellphoneIcon}
          alt="Rotate"
          className={styles['rotate-icon-img']}
        />
      </div>
      <h2>{t('portrait.rotate')}</h2>
      <p>{t('portrait.hint')}</p>
    </div>
  );
}
