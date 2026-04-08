import { useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';
import { getSharedAudioContext } from '@/common/media/audio-context';
import { useClickSound } from './useClickSound';

// Module-level singletons — created once, never GC'd
const musicAudio = new Audio(
  new URL(
    'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/ui/main_theme.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy91aS9tYWluX3RoZW1lLm1wMyIsImlhdCI6MTc3NTQ2Njg5MywiZXhwIjo0ODk3NTMwODkzfQ.B190Q3cZ7C-vIA9tU4CMIurT73cZjYINZJbz2vfDv9A',
  ).href,
);
musicAudio.loop = true;
musicAudio.crossOrigin = 'anonymous'; // Required for Web Audio API if URL is cross-origin

let musicGainNode: GainNode | null = null;
let musicSourceNode: MediaElementAudioSourceNode | null = null;

function ensureMusicConnected() {
  if (musicGainNode) return musicGainNode;
  try {
    const ctx = getSharedAudioContext();
    musicGainNode = ctx.createGain();
    musicSourceNode = ctx.createMediaElementSource(musicAudio);
    musicSourceNode.connect(musicGainNode);
    musicGainNode.connect(ctx.destination);
  } catch (e) {
    console.warn('Failed to connect music to AudioContext:', e);
  }
  return musicGainNode;
}

/**
 * useMenuAudio – App-level hook that manages menu music and click SFX.
 *
 * @param musicActive  Pass `false` to pause music (e.g. while in-game).
 *                     Pass `true` (default) to let settings decide.
 */
let fadeInterval: ReturnType<typeof setInterval> | null = null;
let currentMenuVolume = 0;

export function useMenuAudio(musicActive = true) {
  const playClick = useClickSound();
  const { musicEnabled, musicVolume } = useAppSelector((s) => s.settings);

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
      const gainNode = ensureMusicConnected();
      if (musicAudio.paused) {
        currentMenuVolume = 0;
        if (gainNode) gainNode.gain.value = 0;
        musicAudio.volume = 1; // Keep HTML volume at max, use GainNode for control
        musicAudio.play().catch(() => {});
      }

      fadeInterval = setInterval(() => {
        const diff = targetVolume - currentMenuVolume;
        if (Math.abs(diff) < 0.01) {
          currentMenuVolume = targetVolume;
          if (gainNode)
            gainNode.gain.value = Math.max(0, Math.min(1, currentMenuVolume));
          if (fadeInterval) clearInterval(fadeInterval);
          fadeInterval = null;
        } else {
          currentMenuVolume += diff > 0 ? 0.02 : -0.02;
          if (gainNode)
            gainNode.gain.value = Math.max(0, Math.min(1, currentMenuVolume));
        }
      }, 20);
    } else {
      const gainNode = ensureMusicConnected();
      fadeInterval = setInterval(() => {
        currentMenuVolume = Math.max(0, currentMenuVolume - 0.03);
        if (gainNode)
          gainNode.gain.value = Math.max(0, Math.min(1, currentMenuVolume));
        if (currentMenuVolume <= 0) {
          musicAudio.pause();
          if (fadeInterval) clearInterval(fadeInterval);
          fadeInterval = null;
        }
      }, 20);
    }
  }, [musicActive, musicEnabled, musicVolume]);

  return { playClick };
}
