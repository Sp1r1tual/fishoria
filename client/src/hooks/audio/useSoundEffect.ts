import { useCallback, useRef, useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';

import {
  getSharedAudioContext,
  resumeSharedAudioContext,
  getSharedSfxGainNode,
} from '@/common/media/audio-context';

// ---------------------------------------------------------------------------
// Pre-defined sound URLs & preload helpers
// ---------------------------------------------------------------------------
export const SOUND_URLS = {
  click: new URL('../../assets/music/click.wav', import.meta.url).href,
  ding: new URL('../../assets/music/ding.mp3', import.meta.url).href,
  achievement: new URL('../../assets/music/achievements.mp3', import.meta.url)
    .href,
} as const;

// ---------------------------------------------------------------------------
// Centralized sound buffer cache shared across all hook instances.
// Each sound is identified by its URL and decoded only once.
// ---------------------------------------------------------------------------
const bufferCache = new Map<string, AudioBuffer>();
const rawDataCache = new Map<string, ArrayBuffer>();

/**
 * Pre-fetch raw audio bytes eagerly (no AudioContext needed).
 * Call this at module level for sounds that must have zero-latency on first play.
 */
function eagerFetchSound(url: string) {
  if (rawDataCache.has(url)) return;
  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((ab) => {
      rawDataCache.set(url, ab);
    })
    .catch(() => {});
}

/**
 * Pre-decode an audio file into the buffer cache.
 * Must be called after AudioContext is unlocked (e.g. from unlockAudio).
 */
export async function preloadSoundBuffer(url: string) {
  if (bufferCache.has(url)) return;
  try {
    const ctx = getSharedAudioContext();
    const raw = rawDataCache.get(url);
    const ab: ArrayBuffer =
      raw ?? (await fetch(url).then((r) => r.arrayBuffer()));
    const decoded = await ctx.decodeAudioData(ab);
    bufferCache.set(url, decoded);
  } catch (error) {
    console.error(`Failed to pre-decode sound: ${url}`, error);
  }
}

/**
 * useSoundEffect – universal hook for playing a one-shot SFX via Web Audio API.
 * Returns a stable `play` callback that respects the global sfxEnabled setting.
 */
export function useSoundEffect(url: string, eager = false) {
  const sfxEnabled = useAppSelector((s) => s.settings.sfxEnabled);

  const sfxEnabledRef = useRef(sfxEnabled);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  const play = useCallback(() => {
    if (!sfxEnabledRef.current) return;

    resumeSharedAudioContext();

    const cached = bufferCache.get(url);

    if (cached) {
      const ctx = getSharedAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = cached;
      source.connect(getSharedSfxGainNode());
      source.start(0);
      return;
    }

    // Fallback: if eager mode is on and we have raw bytes, decode and play now
    if (eager) {
      const raw = rawDataCache.get(url);
      if (raw) {
        const ctx = getSharedAudioContext();
        ctx
          .decodeAudioData(raw.slice(0))
          .then((decoded) => {
            bufferCache.set(url, decoded);
            const source = ctx.createBufferSource();
            source.buffer = decoded;
            source.connect(getSharedSfxGainNode());
            source.start(0);
          })
          .catch(() => {});
      }
    }
  }, [url, eager]);

  return play;
}

// Eagerly fetch click sound at module load for zero-latency first click
eagerFetchSound(SOUND_URLS.click);

/** Convenience preloaders (call after AudioContext is unlocked) */
export const preloadClickBuffer = () => preloadSoundBuffer(SOUND_URLS.click);
export const preloadDingBuffer = () => preloadSoundBuffer(SOUND_URLS.ding);
export const preloadAchievementBuffer = () =>
  preloadSoundBuffer(SOUND_URLS.achievement);

/** Convenience hooks */
export const useClickSound = () => useSoundEffect(SOUND_URLS.click, true);
export const useDingSound = () => useSoundEffect(SOUND_URLS.ding);
export const useAchievementSound = () => useSoundEffect(SOUND_URLS.achievement);
