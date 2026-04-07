import { useEffect, useState, type RefObject } from 'react';

/**
 * Uses a ResizeObserver to track the height of an element, returning the height
 * plus an optional safe gap. Useful for creating dynamic constraints or bounding boxes.
 */
export const useDynamicBounds = (
  targetRef: RefObject<HTMLElement | null>,
  safeGap: number = 60,
  fallbackHeight: number = 500,
  dependencies: unknown[] = [],
) => {
  const [minAllowedHeight, setMinAllowedHeight] = useState(fallbackHeight);

  useEffect(() => {
    if (!targetRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMinAllowedHeight(
          (entry.target as HTMLElement).offsetHeight + safeGap,
        );
      }
    });

    observer.observe(targetRef.current);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, safeGap, ...dependencies]);

  return minAllowedHeight;
};
