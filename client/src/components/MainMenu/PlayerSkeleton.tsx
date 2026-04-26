import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import styles from './MainMenu.module.css';

export const PlayerSkeleton = () => {
  return (
    <section className={`glass ${styles['main-menu__player']}`}>
      <div className={styles['main-menu__player-top']}>
        <div className={styles['main-menu__avatar-img']}>
          <Skeleton
            circle
            height="100%"
            containerClassName={styles['main-menu__avatar-img']}
          />
        </div>

        <div className={styles['main-menu__player-info']}>
          <div className={styles['main-menu__name-group']}>
            <div className={styles['main-menu__player-name']}>
              <Skeleton width={120} />
            </div>
          </div>
          <div className={styles['main-menu__level-row']}>
            <div className={styles['main-menu__player-meta']}>
              <Skeleton width={60} />
            </div>
            <div className={styles['main-menu__xp-counter']}>
              <Skeleton width={80} />
            </div>
          </div>
          <div className={styles['main-menu__xp-bar']}>
            <Skeleton height={4} borderRadius={2} />
          </div>
        </div>
      </div>

      <div className={styles['main-menu__player-bottom']}>
        <div className={styles['main-menu__money']}>
          <Skeleton width={60} height={24} />
        </div>

        <div className={styles['main-menu__weather']}>
          <Skeleton width={80} height={20} />
        </div>

        <div className={styles['main-menu__time']}>
          <Skeleton width={60} height={20} />
        </div>
      </div>
    </section>
  );
};
