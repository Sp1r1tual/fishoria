import { useCallback, useRef, useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';
import {
  getSharedAudioContext,
  resumeSharedAudioContext,
  getSharedSfxGainNode,
  syncSharedSfxVolume,
} from '@/common/media/audio-context';

// ---------------------------------------------------------------------------
// Web Audio API ding sound — pre-decoded buffer for zero-latency playback
// ---------------------------------------------------------------------------
let dingBuffer: AudioBuffer | null = null;

// Pre-decode ding sound on first import
const dingUrl = new URL('../../assets/music/ding.mp3', import.meta.url).href;

(async () => {
  try {
    const ctx = getSharedAudioContext();
    const res = await fetch(dingUrl);
    const ab = await res.arrayBuffer();
    dingBuffer = await ctx.decodeAudioData(ab);
  } catch (e) {
    console.error('Failed to pre-decode ding sound', e);
  }
})();

/**
 * useDingSound – returns a `playDing` callback that respects sfx settings.
 * Uses Web Audio API for zero latency.
 */
export function useDingSound() {
  const { sfxEnabled, sfxVolume } = useAppSelector((s) => s.settings);

  const sfxEnabledRef = useRef(sfxEnabled);
  const sfxVolumeRef = useRef(sfxVolume);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
    sfxVolumeRef.current = sfxVolume;
    syncSharedSfxVolume(sfxEnabled, sfxVolume);
  }, [sfxEnabled, sfxVolume]);

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
