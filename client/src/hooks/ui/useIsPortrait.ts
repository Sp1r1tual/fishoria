import { useEffect, useState } from 'react';

export function useIsPortrait(): boolean {
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerWidth < window.innerHeight,
  );

  useEffect(() => {
    const check = () => setIsPortrait(window.innerWidth < window.innerHeight);
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return isPortrait;
}
