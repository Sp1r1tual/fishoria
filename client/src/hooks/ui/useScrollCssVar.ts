import { useEffect, type RefObject } from 'react';

/**
 * Listens to window scroll and writes the scroll position as a CSS custom property
 * directly on the target element. Avoids React re-renders for high-performance
 * parallax / scroll-shrink effects.
 *
 * NOTE: Always uses window.scrollY regardless of the containerRef, because
 * `#root { overflow-x: hidden }` causes browsers to compute overflow-y: auto,
 * making findScroller incorrectly pick #root instead of window.
 */
export const useScrollCssVar = (
  _containerRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  cssVarName: string = '--scroll-y',
) => {
  useEffect(() => {
    if (!targetRef.current) return;

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
    // Establish the initial value immediately on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [targetRef, cssVarName]);
};
