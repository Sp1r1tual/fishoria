import { useCallback, useRef, useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';
import {
  getSharedAudioContext,
  resumeSharedAudioContext,
  getSharedSfxGainNode,
} from '@/common/media/audio-context';

// ---------------------------------------------------------------------------
// Web Audio API click sound — pre-decoded buffer for zero-latency playback
// ---------------------------------------------------------------------------
let clickBuffer: AudioBuffer | null = null;

const clickUrl = new URL('../../assets/music/click.wav', import.meta.url).href;

// Eagerly fetch the raw bytes (doesn't require AudioContext or user gesture)
let clickRawData: ArrayBuffer | null = null;
fetch(clickUrl)
  .then((res) => res.arrayBuffer())
  .then((ab) => {
    clickRawData = ab;
  })
  .catch(() => {});

/**
 * Pre-decode click sound into an AudioBuffer.
 * Must be called after AudioContext is available (e.g. from unlockAudio).
 * Uses the eagerly pre-fetched raw data for instant decode.
 */
export async function preloadClickBuffer() {
  if (clickBuffer) return;
  try {
    const ctx = getSharedAudioContext();
    // Use pre-fetched data if available, otherwise fetch again
    const ab = clickRawData
      ? clickRawData
      : await fetch(clickUrl).then((r) => r.arrayBuffer());
    clickBuffer = await ctx.decodeAudioData(ab);
  } catch (e) {
    console.error('Failed to pre-decode click sound', e);
  }
}

/**
 * useClickSound – lightweight hook for click SFX via Web Audio API.
 * Returns a `playClick` callback that respects sfxEnabled.
 * Volume is controlled centrally via the shared SFX GainNode (synced in AudioController).
 */
export function useClickSound() {
  const sfxEnabled = useAppSelector((s) => s.settings.sfxEnabled);

  const sfxEnabledRef = useRef(sfxEnabled);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  const playClick = useCallback(() => {
    if (!sfxEnabledRef.current) return;

    // Trigger resume synchronously in the gesture
    resumeSharedAudioContext();

    // If buffer is ready, play immediately
    if (clickBuffer) {
      const ctx = getSharedAudioContext();
      const source = ctx.createBufferSource();
      const destNode = getSharedSfxGainNode();
      source.buffer = clickBuffer;
      source.connect(destNode);
      source.start(0);
      return;
    }

    // Buffer not ready yet (first click triggers unlockAudio + decode).
    // Try to decode now and play once ready.
    if (clickRawData) {
      const ctx = getSharedAudioContext();
      ctx
        .decodeAudioData(clickRawData.slice(0))
        .then((decoded) => {
          clickBuffer = decoded;
          const source = ctx.createBufferSource();
          const destNode = getSharedSfxGainNode();
          source.buffer = clickBuffer;
          source.connect(destNode);
          source.start(0);
        })
        .catch(() => {});
    }
  }, []);

  return playClick;
}
