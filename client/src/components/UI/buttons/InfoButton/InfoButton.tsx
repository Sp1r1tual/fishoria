import styles from './InfoButton.module.css';

interface InfoButtonProps {
  onClick: (e: React.MouseEvent) => void;
  title?: string;
  className?: string;
}

export const InfoButton = ({
  onClick,
  title,
  className = '',
}: InfoButtonProps) => {
  return (
    <button
      className={`${styles.info_btn} ${className}`}
      onClick={onClick}
      title={title}
      type="button"
      aria-label="info"
    >
      <span className={styles.info_btn__icon}>i</span>
    </button>
  );
};
