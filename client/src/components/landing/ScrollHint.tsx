import { useEffect, useState } from 'react';

import styles from './ScrollHint.module.css';

interface ScrollHintProps {
  hidden?: boolean;
}

export const ScrollHint = ({ hidden }: ScrollHintProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 75) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || hidden) return null;

  return (
    <div className={styles.scrollHint}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 5V19M12 19L5 12M12 19L19 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
