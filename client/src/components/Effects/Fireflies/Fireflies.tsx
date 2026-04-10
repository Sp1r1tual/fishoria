import React, { useState } from 'react';

import styles from './Fireflies.module.css';

interface FirefliesProps {
  count?: number;
}

export const Fireflies = ({ count = 15 }: FirefliesProps) => {
  const [fireflies] = useState(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 5 + 84,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.5,
    }));
  });

  return (
    <div className={styles['fireflies-container']}>
      {fireflies.map((f) => (
        <div
          key={f.id}
          className={styles.firefly}
          style={
            {
              '--size': `${f.size}px`,
              '--left': `${f.left}%`,
              '--top': `${f.top}%`,
              '--duration': `${f.duration}s`,
              '--delay': `${f.delay}s`,
              '--opacity': f.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
