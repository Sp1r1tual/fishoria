import styles from './StatBadge.module.css';

interface IStatBadgeProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  variant?: 'default' | 'online';
  className?: string;
  title?: string;
  isLoading?: boolean;
}

export function StatBadge({
  icon,
  label,
  variant = 'default',
  className = '',
  title,
  isLoading = false,
}: IStatBadgeProps) {
  return (
    <div
      className={`${styles.badge} ${styles[`badge--${variant}`]} ${className}`}
      title={title}
    >
      {isLoading ? (
        <span className={styles.spinner}>
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      {!isLoading && <span className={styles.label}>{label}</span>}
    </div>
  );
}
