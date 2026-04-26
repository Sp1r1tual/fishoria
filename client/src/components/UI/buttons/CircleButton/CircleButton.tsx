import { useCallback, type MouseEvent } from 'react';

import { useClickSound } from '@/hooks/audio/useSoundEffect';

import styles from './CircleButton.module.css';

interface ICircleButtonProps {
  onClick: (e: MouseEvent) => void;
  variant?: 'red' | 'brown' | 'glass' | 'danger' | 'wooden';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  title?: string;
  disabled?: boolean;
}

export const CircleButton = ({
  onClick,
  variant = 'glass',
  size = 'md',
  icon = '✕',
  className = '',
  title,
  disabled = false,
}: ICircleButtonProps) => {
  const playClick = useClickSound();

  const handleClick = useCallback(
    (e: MouseEvent) => {
      playClick();
      if (onClick) onClick(e);
    },
    [onClick, playClick],
  );

  return (
    <button
      className={`${styles.circle_btn} ${styles[`circle_btn--${variant}`]} ${styles[`circle_btn--${size}`]} ${className}`}
      onClick={handleClick}
      title={title}
      disabled={disabled}
      type="button"
    >
      <span className={styles.circle_btn__icon}>{icon}</span>
    </button>
  );
};
