import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { useMenuAudio } from '@/hooks/audio/useMenuAudio';
import { useAppSelector } from '@/hooks/core/useAppStore';

import { syncSharedSfxVolume } from '@/common/media/audio-context';

export function AudioController() {
  const location = useLocation();
  const screen = useAppSelector((s) => s.ui.screen);
  const isInGame =
    location.pathname === '/' &&
    (screen === 'game' || screen === 'inventory' || screen === 'gear');

  useMenuAudio(!isInGame);

  // Centralized SFX volume sync — single source of truth for all SFX hooks
  const sfxEnabled = useAppSelector((s) => s.settings.sfxEnabled);
  const sfxVolume = useAppSelector((s) => s.settings.sfxVolume);

  useEffect(() => {
    syncSharedSfxVolume(sfxEnabled, sfxVolume);
  }, [sfxEnabled, sfxVolume]);

  return null;
}
