import { useClickSound } from '@/hooks/audio/useClickSound';

import styles from './DefaultButton.module.css';

interface DefaultButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'google';
  size?: 'sm' | 'md' | 'lg' | 'full';
  icon?: string | React.ReactNode;
  label?: string;
  className?: string;
  children?: React.ReactNode;
  playSound?: boolean;
}

export const DefaultButton = ({
  variant = 'primary',
  size = 'md',
  icon,
  label,
  className = '',
  children,
  playSound = true,
  onClick,
  ...props
}: DefaultButtonProps) => {
  const playClick = useClickSound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playSound) playClick();
    if (onClick) onClick(e);
  };

  const buttonClasses = [
    styles['default-button'],
    styles[`variant-${variant}`],
    styles[`size-${size}`],
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
      {children}
    </button>
  );
};
