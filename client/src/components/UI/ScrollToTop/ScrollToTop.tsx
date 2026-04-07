import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { useAppSelector } from '@/hooks/core/useAppStore';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const screen = useAppSelector((state) => state.ui.screen);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, screen]);

  return null;
}
