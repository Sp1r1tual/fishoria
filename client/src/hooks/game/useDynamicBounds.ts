import { useLayoutEffect, type RefObject } from 'react';

export const useDynamicBounds = (
  targetRef: RefObject<HTMLElement | null>,
  applyRef: RefObject<HTMLElement | null>,
  cssVarName: string = '--min-allowed-height',
  safeGap: number = 60,
  dependencies: unknown[] = [],
) => {
  useLayoutEffect(() => {
    if (!targetRef.current || !applyRef.current) return;

    const setHeight = (height: number) => {
      applyRef.current?.style.setProperty(cssVarName, `${height + safeGap}px`);
    };

    setHeight(targetRef.current.offsetHeight);

    let timerId: number;

    const observer = new ResizeObserver((entries) => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        for (const entry of entries) {
          const height =
            entry.borderBoxSize?.[0]?.blockSize ??
            (entry.target as HTMLElement).offsetHeight;
          setHeight(height);
        }
      }, 300);
    });

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
      window.clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, applyRef, cssVarName, safeGap, ...dependencies]);
};
