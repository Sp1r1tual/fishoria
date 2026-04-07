import Skeleton from 'react-loading-skeleton';

import styles from './News.module.css';

export const NewsSkeleton = () => (
  <div className={styles.news__list}>
    {[1, 2].map((i) => (
      <div key={i} className={styles.newsItem}>
        <div className={styles.newsItem__imageWrap}>
          <Skeleton height="100%" containerClassName={styles.newsItem__image} />
        </div>
        <div className={styles.newsItem__body} style={{ width: '100%' }}>
          <Skeleton width="60%" height={32} style={{ marginBottom: '12px' }} />
          <Skeleton count={3} />
          <div
            className={styles.newsItem__footer}
            style={{ marginTop: '16px' }}
          >
            <Skeleton width={100} height={20} />
            <Skeleton width={120} height={36} />
          </div>
        </div>
      </div>
    ))}
  </div>
);
