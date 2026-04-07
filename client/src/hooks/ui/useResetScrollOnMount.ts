import { useEffect } from 'react';

/**
 * Disables browser's native scroll restoration and forces scroll to top.
 * Useful for landing pages with dynamic/fluid layout heights that confuse the browser.
 */
export function useResetScrollOnMount() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Safety timeout for some browser engines
    const timer = setTimeout(() => window.scrollTo(0, 0), 10);
    return () => clearTimeout(timer);
  }, []);
}
