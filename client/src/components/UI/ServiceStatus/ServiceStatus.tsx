import type { ConnectionStatusType } from '@/common/types';

import { OnlineDot } from '../OnlineDot/OnlineDot';

import styles from './ServiceStatus.module.css';

interface ServiceStatusProps {
  status: ConnectionStatusType;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function ServiceStatus({
  status,
  label,
  onClick,
  className = '',
}: ServiceStatusProps) {
  return (
    <div
      className={`${styles.container} ${styles[`container--${status}`]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'presentation'}
    >
      <OnlineDot status={status} />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
