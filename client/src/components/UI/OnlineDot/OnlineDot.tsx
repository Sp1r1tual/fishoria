import type { ConnectionStatusType } from '@/common/types';

import styles from './OnlineDot.module.css';

interface OnlineDotProps {
  status: ConnectionStatusType;
  className?: string;
}

export function OnlineDot({ status, className = '' }: OnlineDotProps) {
  return (
    <div
      className={`${styles.dot} ${styles[`dot--${status}`]} ${className}`}
      title={`Status: ${status}`}
    />
  );
}
