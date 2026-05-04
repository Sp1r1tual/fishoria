import { useEffect, useRef } from 'react';

import { TimeManager } from '@/game/managers/TimeManager';
import { GameEvents } from '@/game/engine/GameEvents';

import clockIcon from '@/assets/ui/clock.webp';

import styles from './GameClock.module.css';

interface IGameClockProps {
  className?: string;
  iconClassName?: string;
  mode?: 'game' | 'real';
}

export function GameClock({
  className = '',
  iconClassName = '',
  mode = 'game',
}: IGameClockProps) {
  const timeTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const update = () => {
      if (timeTextRef.current) {
        const now = TimeManager.getTime(mode);
        timeTextRef.current.innerText = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        });
      }
    };

    update();

    const interval = setInterval(update, 1000);
    const unbind = GameEvents.on(
      'timeUpdate',
      (data: { hour: number; mode: string }) => {
        if (data.mode === mode) {
          update();
        }
      },
    );

    return () => {
      clearInterval(interval);
      unbind();
    };
  }, [mode]);

  return (
    <div className={`${styles.clock} ${className}`}>
      <img
        src={clockIcon}
        alt="time"
        className={`${styles.clock__icon} ${iconClassName}`}
      />
      <span ref={timeTextRef} className={styles.clock__text}></span>
    </div>
  );
}
