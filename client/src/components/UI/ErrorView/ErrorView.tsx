import styles from './ErrorView.module.css';

interface IErrorViewProps {
  message?: string;
  className?: string;
  icon?: string;
}

export function ErrorView({
  message,
  className = '',
  icon = '⚠️',
}: IErrorViewProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.icon}>{icon}</div>
      {message && <div className={styles.text}>{message}</div>}
    </div>
  );
}
