import Skeleton from 'react-loading-skeleton';

import styles from './Quests.module.css';

export const QuestsSkeleton = () => (
  <div className={styles.quest_list}>
    {[1, 2, 3].map((i) => (
      <article
        key={i}
        className={`glass ${styles.quest_card} ${styles.skeleton}`}
      >
        <div className={styles.quest_card__header}>
          <div
            className={styles.quest_card__image}
            style={{ overflow: 'hidden', background: 'transparent' }}
          >
            <Skeleton height="100%" style={{ display: 'block' }} />
          </div>
          <div className={styles.quest_card__info} style={{ flex: 1 }}>
            <Skeleton width="60%" height={24} style={{ marginBottom: '8px' }} />
            <Skeleton count={2} height={14} />
          </div>
        </div>

        <div
          className={styles.quest_card__conditions}
          style={{ marginTop: '16px' }}
        >
          {[1].map((j) => (
            <div key={j} className={styles.quest_condition}>
              <div
                className={styles.quest_condition__label}
                style={{ marginBottom: '8px' }}
              >
                <Skeleton width="40%" height={14} />
                <Skeleton width="20%" height={14} />
              </div>
              <div
                className={styles.progress_bar}
                style={{ height: '12px', background: 'transparent' }}
              >
                <Skeleton
                  height="100%"
                  borderRadius="6px"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          className={styles.quest_card__footer}
          style={{ marginTop: '20px' }}
        >
          <div className={styles.quest_card__rewards}>
            <Skeleton width={70} height={28} borderRadius="20px" />
            <Skeleton width={70} height={28} borderRadius="20px" />
          </div>
          <Skeleton width={130} height={38} borderRadius="8px" />
        </div>
      </article>
    ))}
  </div>
);
