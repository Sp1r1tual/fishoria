import { useCallback, useRef, useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';
import {
  getSharedAudioContext,
  resumeSharedAudioContext,
  getSharedSfxGainNode,
} from '@/common/media/audio-context';

// ---------------------------------------------------------------------------
// Web Audio API ding sound — pre-decoded buffer for zero-latency playback
// ---------------------------------------------------------------------------
let dingBuffer: AudioBuffer | null = null;

const dingUrl = new URL('../../assets/music/ding.mp3', import.meta.url).href;

/** Pre-decode ding sound. Must be called after AudioContext is unlocked (e.g. from unlockAudio). */
export async function preloadDingBuffer() {
  if (dingBuffer) return;
  try {
    const ctx = getSharedAudioContext();
    const res = await fetch(dingUrl);
    const ab = await res.arrayBuffer();
    dingBuffer = await ctx.decodeAudioData(ab);
  } catch (e) {
    console.error('Failed to pre-decode ding sound', e);
  }
}

/**
 * useDingSound – returns a `playDing` callback that respects sfx settings.
 * Uses Web Audio API for zero latency.
 * Volume is controlled centrally via the shared SFX GainNode (synced in AudioController).
 */
export function useDingSound() {
  const sfxEnabled = useAppSelector((s) => s.settings.sfxEnabled);

  const sfxEnabledRef = useRef(sfxEnabled);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  const playDing = useCallback(() => {
    if (!sfxEnabledRef.current || !dingBuffer) return;

    // Trigger resume synchronously in the gesture
    resumeSharedAudioContext();

    const ctx = getSharedAudioContext();
    const source = ctx.createBufferSource();
    const destNode = getSharedSfxGainNode();
    source.buffer = dingBuffer;
    source.connect(destNode);
    source.start(0);
  }, []);

  return playDing;
}
