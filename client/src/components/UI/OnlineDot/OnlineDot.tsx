import type { ConnectionStatusType } from '@/common/types';

import styles from './OnlineDot.module.css';

interface OnlineDotProps {
  status: ConnectionStatusType;
  size?: 'md' | 'sm';
  className?: string;
}

export function OnlineDot({
  status,
  size = 'md',
  className = '',
}: OnlineDotProps) {
  return (
    <div
      className={`${styles.dot} ${styles[`dot--${status}`]} ${
        styles[`dot--${size}`]
      } ${className}`}
      title={`Status: ${status}`}
    />
  );
}
