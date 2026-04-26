import Skeleton from 'react-loading-skeleton';

import styles from './ProfileModal.module.css';

export const ProfileSkeleton = () => {
  return (
    <>
      <div className={styles.top}>
        <div className={styles.avatarLink}>
          <div
            className={`${styles.avatarWrapper} ${styles.avatarWrapper_skeleton}`}
          >
            <Skeleton circle height={92} width={92} />
          </div>
        </div>
        <div className={styles.mainInfo}>
          <div className={styles.name}>
            <Skeleton width={140} height={28} />
          </div>
          <Skeleton width={70} height={16} borderRadius={4} />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.statItem}>
          <Skeleton width={50} height={11} />
          <Skeleton width={30} height={18} />
        </div>
        <div className={styles.statItem}>
          <Skeleton width={60} height={11} />
          <Skeleton width={30} height={18} />
        </div>
        <div className={styles.statItem}>
          <Skeleton width={60} height={12} />
          <Skeleton width={70} height={18} />
        </div>
      </div>
    </>
  );
};
