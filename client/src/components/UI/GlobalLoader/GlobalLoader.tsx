import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router';

import styles from './GlobalLoader.module.css';

export function GlobalLoader() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let fadeOutTimeout: ReturnType<typeof setTimeout>;
    let startTimeout: ReturnType<typeof setTimeout>;
    let resetTimeout: ReturnType<typeof setTimeout>;

    let initTimeout: ReturnType<typeof setTimeout>;

    if (isLoading) {
      initTimeout = setTimeout(() => {
        setVisible(true);
        setProgress(0);
      }, 0);

      startTimeout = setTimeout(() => setProgress(15), 50);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + Math.random() * 10 + 2;
          if (prev < 80) return prev + Math.random() * 3 + 1;
          if (prev < 95) return prev + 0.5;
          return prev;
        });
      }, 300);
    } else {
      const finishTimeout = setTimeout(() => setProgress(100), 0);

      fadeOutTimeout = setTimeout(() => {
        setVisible(false);
        resetTimeout = setTimeout(() => setProgress(0), 400);
      }, 500);

      return () => {
        if (interval) clearInterval(interval);
        if (fadeOutTimeout) clearTimeout(fadeOutTimeout);
        if (startTimeout) clearTimeout(startTimeout);
        if (resetTimeout) clearTimeout(resetTimeout);
        if (initTimeout) clearTimeout(initTimeout);
        clearTimeout(finishTimeout);
      };
    }

    return () => {
      if (interval) clearInterval(interval);
      if (fadeOutTimeout) clearTimeout(fadeOutTimeout);
      if (startTimeout) clearTimeout(startTimeout);
      if (resetTimeout) clearTimeout(resetTimeout);
      if (initTimeout) clearTimeout(initTimeout);
    };
  }, [isLoading]);

  return (
    <div
      className={`${styles.loader} ${visible ? styles.visible : ''}`}
      id="global-route-loader"
      style={{
        transform: `scaleX(${progress / 100})`,
        transition:
          progress === 100
            ? 'transform 0.4s ease-out, opacity 0.4s ease-in-out'
            : progress === 0
              ? 'none'
              : 'transform 0.4s cubic-bezier(0.1, 0.05, 0, 1)',
      }}
    />
  );
}
