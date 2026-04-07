import { useLocation } from 'react-router';

import { useAppSelector } from '@/hooks/core/useAppStore';
import { useMenuAudio } from '@/hooks/audio/useMenuAudio';

export function AudioController() {
  const location = useLocation();
  const screen = useAppSelector((s) => s.ui.screen);
  const isInGame =
    location.pathname === '/' &&
    (screen === 'game' || screen === 'inventory' || screen === 'gear');

  useMenuAudio(!isInGame);

  return null;
}
