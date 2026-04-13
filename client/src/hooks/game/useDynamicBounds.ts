import { useLayoutEffect, useState, type RefObject } from 'react';

export const useDynamicBounds = (
  targetRef: RefObject<HTMLElement | null>,
  safeGap: number = 60,
  fallbackHeight: number = 500,
  dependencies: unknown[] = [],
) => {
  const [minAllowedHeight, setMinAllowedHeight] = useState(() => {
    return targetRef.current
      ? targetRef.current.offsetHeight + safeGap
      : fallbackHeight;
  });

  useLayoutEffect(() => {
    if (!targetRef.current) return;

    setMinAllowedHeight(targetRef.current.offsetHeight + safeGap);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height =
          entry.borderBoxSize?.[0]?.blockSize ??
          (entry.target as HTMLElement).offsetHeight;
        setMinAllowedHeight(height + safeGap);
      }
    });

    observer.observe(targetRef.current);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, safeGap, ...dependencies]);

  return minAllowedHeight;
};
