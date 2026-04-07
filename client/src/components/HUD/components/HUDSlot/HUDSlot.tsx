import styles from './HUDSlot.module.css';

interface IHUDSlotProps {
  children?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  badgeClassName?: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  attention?: boolean;
  id?: string;
}

export function HUDSlot({
  children,
  badge,
  onClick,
  className = '',
  badgeClassName = '',
  active = false,
  disabled = false,
  title = '',
  attention = false,
  id,
}: IHUDSlotProps) {
  const circleClass = [
    styles['hud-slot__circle'],
    active ? styles['hud-slot__circle--active'] : '',
    disabled ? styles['hud-slot__circle--disabled'] : '',
    attention ? styles['hud-slot__circle--attention'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['hud-slot']} id={id}>
      <div
        className={circleClass}
        onClick={!disabled ? onClick : undefined}
        title={title}
        role="button"
      >
        {children}
        {attention && (
          <div className={styles['hud-slot__attention-marker']}>!</div>
        )}
      </div>
      {badge !== undefined && (
        <div className={`${styles['hud-slot__badge']} ${badgeClassName}`}>
          {badge}
        </div>
      )}
    </div>
  );
}
