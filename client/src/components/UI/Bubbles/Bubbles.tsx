import { useState } from 'react';

import styles from './Bubbles.module.css';

type Bubble = {
  left: number;
  size: number;
  duration: number;
  delay: number;
};

const generateBubbles = (count: number): Bubble[] =>
  Array.from({ length: count }).map(() => {
    const duration = 12 + Math.random() * 13;
    return {
      left: Math.random() * 100,
      size: 6 + Math.random() * 12,
      duration: duration,
      delay: -Math.random() * duration,
    };
  });

interface BubblesProps {
  count?: number;
  className?: string;
}

export const Bubbles = ({ count = 18, className = '' }: BubblesProps) => {
  const [bubbles] = useState<Bubble[]>(() => generateBubbles(count));

  return (
    <div
      className={`${styles.bubbles} ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {bubbles.map((b, i) => (
        <span
          key={i}
          role="presentation"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
