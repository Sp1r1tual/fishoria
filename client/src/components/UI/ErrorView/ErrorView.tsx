import styles from './ErrorView.module.css';

interface IErrorViewProps {
  message?: string;
  className?: string;
  icon?: string;
  noPadding?: boolean;
}

export function ErrorView({
  message,
  className = '',
  icon = '⚠️',
  noPadding = false,
}: IErrorViewProps) {
  return (
    <div
      className={`${styles.container} ${noPadding ? styles.noPadding : ''} ${className}`}
    >
      <div className={styles.icon}>{icon}</div>
      {message && <div className={styles.text}>{message}</div>}
    </div>
  );
}
