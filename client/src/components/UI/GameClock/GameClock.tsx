import { useEffect, useRef } from 'react';

import { TimeManager } from '@/game/managers/TimeManager';

import clockIcon from '@/assets/ui/clock.webp';

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
    if (timeTextRef.current) {
      const initTime = TimeManager.getTime(mode);
      timeTextRef.current.innerText = initTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const interval = setInterval(() => {
      if (timeTextRef.current) {
        const now = TimeManager.getTime(mode);
        timeTextRef.current.innerText = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
    >
      <img src={clockIcon} alt="time" className={iconClassName} />
      <span ref={timeTextRef}></span>
    </div>
  );
}
