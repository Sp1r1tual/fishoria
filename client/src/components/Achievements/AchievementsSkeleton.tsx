import Skeleton from 'react-loading-skeleton';

import styles from './Achievements.module.css';

export const AchievementsSkeleton = () => (
  <div className={styles.achievement_list}>
    {[1, 2, 3, 4].map((i) => (
      <article key={i} className={`glass ${styles.achievement_card}`}>
        <div className={styles.achievement_card__header}>
          <div
            className={styles.achievement_card__image}
            style={{
              overflow: 'hidden',
              padding: 0,
              background: 'transparent',
            }}
          >
            <Skeleton height="100%" style={{ display: 'block' }} />
          </div>
          <div className={styles.achievement_card__info}>
            <Skeleton width="60%" height={24} style={{ marginBottom: '8px' }} />
            <Skeleton count={1} height={16} width="90%" />
          </div>
        </div>

        <div className={styles.achievement_card__footer}>
          <Skeleton width={100} height={24} />
        </div>
      </article>
    ))}
  </div>
);
