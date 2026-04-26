import { useEffect, useState } from 'react';

export function useIsPortrait(): boolean {
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerWidth < window.innerHeight,
  );

  useEffect(() => {
    let timer: number;
    const check = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setIsPortrait(window.innerWidth < window.innerHeight);
      }, 300);
    };
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return isPortrait;
}
