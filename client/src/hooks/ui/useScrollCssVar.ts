import { useEffect, type RefObject } from 'react';

export const useScrollCssVar = (
  _containerRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  cssVarName: string = '--scroll-y',
) => {
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (targetRef.current) {
            targetRef.current.style.setProperty(
              cssVarName,
              `${window.scrollY}px`,
            );
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [targetRef, cssVarName]);
};
