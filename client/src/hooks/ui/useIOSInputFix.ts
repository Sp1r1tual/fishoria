import { useEffect, useCallback } from 'react';

import { isIOS } from '@/common/utils/device.util';

/**
 * A hook to fix iOS Chrome/Safari issues where the page scrolls automatically
 * when an input is focused and doesn't return to its original position.
 * It uses the VisualViewport API to detect when the keyboard is closed
 * and resets the scroll position to 0.
 */
export function useIOSInputFix() {
  const resetScroll = useCallback(() => {
    if (isIOS) {
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
      }, 50);
    }
  }, []);

  useEffect(() => {
    if (!isIOS || !window.visualViewport) return;

    const handleViewportChange = () => {
      if (
        window.visualViewport &&
        window.visualViewport.height >= window.innerHeight - 10
      ) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
      }
    };

    const viewport = window.visualViewport;
    viewport.addEventListener('resize', handleViewportChange);
    viewport.addEventListener('scroll', handleViewportChange);

    return () => {
      viewport.removeEventListener('resize', handleViewportChange);
      viewport.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  return {
    resetScroll,
    inputProps: isIOS
      ? {
          onFocus: resetScroll,
          onBlur: resetScroll,
        }
      : {},
  };
}
