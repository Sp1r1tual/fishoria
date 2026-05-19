import { useEffect, useState } from 'react';

import styles from './Spinner.module.css';

interface SpinnerProps {
  visible?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  visible = true,
  size = 'sm',
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.spinnerContainer} ${visible ? styles.visible : styles.hidden} ${className}`}
    >
      <div className={`${styles.spinner} ${styles[size]}`} />
    </div>
  );
};
