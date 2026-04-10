import { useState, useEffect, useRef } from 'react';

import styles from './TapHint.module.css';

interface TapHintProps {
  hidden?: boolean;
  hideOnHover?: boolean;
  text?: string;
}

export const TapHint = ({ hidden, hideOnHover, text }: TapHintProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleInteraction = () => {
      setIsVisible(false);
    };

    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('mousedown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (!hideOnHover || !isVisible) return;

    const parent = hintRef.current?.parentElement;
    if (!parent) return;

    const handleHover = () => setIsVisible(false);
    parent.addEventListener('mouseenter', handleHover, { once: true });

    return () => {
      parent.removeEventListener('mouseenter', handleHover);
    };
  }, [hideOnHover, isVisible]);

  if (!isVisible || hidden) return null;

  return (
    <div ref={hintRef} className={styles.tapHint} aria-hidden="true">
      <div className={styles.ripple}>
        <svg
          className={styles.handIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      </div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};
