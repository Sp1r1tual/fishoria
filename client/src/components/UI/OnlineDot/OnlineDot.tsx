import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <span
      className={`${styles.dot} ${styles[`dot--${status}`]} ${
        styles[`dot--${size}`]
      } ${className}`}
      title={`${t('common.status', 'Status')}: ${t(`online.status.${status}`, status)}`}
    >
      ●
    </span>
  );
}
