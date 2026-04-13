import { useCallback } from 'react';

import { useClickSound } from '@/hooks/audio/useSoundEffect';

import styles from './WoodyButton.module.css';

interface WoodyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'brown' | 'red';
  size?: 'sm' | 'md' | 'lg';
  icon?: string | React.ReactNode;
  label?: string;
  isTile?: boolean;
  isBackBtn?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  className?: string;
  children?: React.ReactNode;
  playSound?: boolean;
  badge?: number | string | boolean;
}

export const WoodyButton = ({
  variant = 'brown',
  size = 'md',
  icon,
  label,
  isTile = false,
  isBackBtn = false,
  mobileOnly = false,
  desktopOnly = false,
  className = '',
  children,
  playSound = true,
  badge,
  onClick,
  ...props
}: WoodyButtonProps) => {
  const playClick = useClickSound();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (playSound) playClick();
      if (onClick) onClick(e);
    },
    [playSound, playClick, onClick],
  );

  const buttonClasses = [
    styles['woody-button'],
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    isTile ? styles['tile-style'] : '',
    isBackBtn ? styles['back-nav-btn'] : '',
    mobileOnly ? styles['mobile-only'] : '',
    desktopOnly ? styles['desktop-only'] : '',
    className,
  ]
    .join(' ')
    .trim();

  return (
    <button className={buttonClasses} onClick={handleClick} {...props}>
      {icon && (
        <span className={styles.icon}>
          {typeof icon === 'string' ? <img src={icon} alt="" /> : icon}
        </span>
      )}
      {label && <span className={styles.label}>{label}</span>}
      {badge && (
        <span className={styles.badge}>{badge === true ? '' : badge}</span>
      )}
      {children}
    </button>
  );
};
