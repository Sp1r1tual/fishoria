import { useEffect, useRef, useCallback } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';

// Module-level singletons — created once, never GC'd
const musicAudio = new Audio(
  new URL(
    'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/ui/main_theme.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy91aS9tYWluX3RoZW1lLm1wMyIsImlhdCI6MTc3NTQ2Njg5MywiZXhwIjo0ODk3NTMwODkzfQ.B190Q3cZ7C-vIA9tU4CMIurT73cZjYINZJbz2vfDv9A',
  ).href,
);
musicAudio.loop = true;

const clickAudio = new Audio(
  new URL('../assets/music/click.wav', import.meta.url).href,
);
clickAudio.preload = 'auto';

/**
 * useMenuAudio – App-level hook that manages menu music and click SFX.
 *
 * @param musicActive  Pass `false` to pause music (e.g. while in-game).
 *                     Pass `true` (default) to let settings decide.
 */
let fadeInterval: ReturnType<typeof setInterval> | null = null;
let currentMenuVolume = 0;

export function useMenuAudio(musicActive = true) {
  const { musicEnabled, musicVolume, sfxEnabled, sfxVolume } = useAppSelector(
    (s) => s.settings,
  );

  // ------------------------------------------------------------------
  // Music – smooth fade in/out based on settings AND the musicActive flag
  // ------------------------------------------------------------------
  useEffect(() => {
    const shouldPlay = musicActive && musicEnabled;
    const targetVolume = shouldPlay ? musicVolume / 100 : 0;

    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }

    if (shouldPlay) {
      if (musicAudio.paused) {
        currentMenuVolume = 0;
        musicAudio.volume = 0;
        musicAudio.play().catch(() => {});
      }

      fadeInterval = setInterval(() => {
        const diff = targetVolume - currentMenuVolume;
        if (Math.abs(diff) < 0.01) {
          currentMenuVolume = targetVolume;
          musicAudio.volume = Math.max(0, Math.min(1, currentMenuVolume));
          if (fadeInterval) clearInterval(fadeInterval);
          fadeInterval = null;
        } else {
          currentMenuVolume += diff > 0 ? 0.02 : -0.02; // Change by ~2% per 20ms
          musicAudio.volume = Math.max(0, Math.min(1, currentMenuVolume));
        }
      }, 20);
    } else {
      fadeInterval = setInterval(() => {
        currentMenuVolume = Math.max(0, currentMenuVolume - 0.03);
        musicAudio.volume = Math.max(0, Math.min(1, currentMenuVolume));
        if (currentMenuVolume <= 0) {
          musicAudio.pause();
          if (fadeInterval) clearInterval(fadeInterval);
          fadeInterval = null;
        }
      }, 20);
    }
  }, [musicActive, musicEnabled, musicVolume]);

  // ------------------------------------------------------------------
  // SFX – keep refs fresh so playClick never captures stale values
  // ------------------------------------------------------------------
  const sfxEnabledRef = useRef(sfxEnabled);
  const sfxVolumeRef = useRef(sfxVolume);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
    sfxVolumeRef.current = sfxVolume;
  }, [sfxEnabled, sfxVolume]);

  const playClick = useCallback(() => {
    if (!sfxEnabledRef.current) return;
    const clone = clickAudio.cloneNode() as HTMLAudioElement;
    clone.volume = Math.max(0, Math.min(1, sfxVolumeRef.current / 100));
    clone.play().catch(() => {});
  }, []);

  return { playClick };
}
