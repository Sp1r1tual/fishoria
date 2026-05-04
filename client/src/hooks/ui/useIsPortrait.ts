import { useLayoutEffect, useState } from 'react';

export function useIsPortrait(): boolean {
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerWidth < window.innerHeight,
  );

  useLayoutEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      setIsPortrait(window.innerWidth < window.innerHeight);
    };

    const handleOrientationChange = () => {
      check();
      window.clearTimeout(timer);
      timer = setTimeout(check, 100);
      timer = setTimeout(check, 300);
    };

    const mql = window.matchMedia('(orientation: portrait)');
    mql.addEventListener('change', handleOrientationChange);
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.clearTimeout(timer);
      mql.removeEventListener('change', handleOrientationChange);
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return isPortrait;
}
