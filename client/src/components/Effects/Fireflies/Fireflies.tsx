import React, { useState } from 'react';

import styles from './Fireflies.module.css';

interface IFirefly {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface IFirefliesProps {
  count?: number;
  spawnRangeY?: [number, number];
}

export const Fireflies = ({
  count = 15,
  spawnRangeY = [80, 90],
}: IFirefliesProps) => {
  const [fireflies] = useState<IFirefly[]>(() => {
    const [minY, maxY] = spawnRangeY;
    const range = maxY - minY;

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * range + minY,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.5,
    }));
  });

  return (
    <div className={styles['fireflies-container']}>
      {fireflies.map((f: IFirefly) => (
        <div
          key={f.id}
          className={styles['firefly-wrapper']}
          style={
            {
              '--left': `${f.left}%`,
              '--top': `${f.top}%`,
              '--duration': `${f.duration}s`,
              '--delay': `${f.delay}s`,
            } as React.CSSProperties
          }
        >
          <div
            className={styles.firefly}
            style={
              {
                '--size': `${f.size}px`,
                '--opacity': f.opacity,
              } as React.CSSProperties
            }
          />
        </div>
      ))}
    </div>
  );
};
