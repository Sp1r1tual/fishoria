import { useClickSound } from '@/hooks/audio/useSoundEffect';

import styles from './Toggle.module.css';

interface ToggleProps {
  label?: string;
  isChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Toggle({
  label,
  isChecked,
  onChange,
  className = '',
}: ToggleProps) {
  const playClick = useClickSound();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playClick();
    onChange?.(e.target.checked);
  };

  return (
    <div className={`${styles.toggle} ${className}`}>
      {label && <span className={styles.label}>{label}</span>}
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className={styles.checkbox}
      />
    </div>
  );
}
