import styles from './GameCanvas.module.css';

export function GameLoader({ t }: { t: (key: string) => string }) {
  return (
    <div className={styles['game-canvas__loader']}>
      <div className={styles['game-canvas__loader-spinner']} />
      <p>{t('loading')}</p>
    </div>
  );
}
