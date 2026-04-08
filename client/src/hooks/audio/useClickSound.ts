import { useCallback, useRef, useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';
import {
  getSharedAudioContext,
  resumeSharedAudioContext,
  getSharedSfxGainNode,
  syncSharedSfxVolume,
} from '@/common/media/audio-context';

// ---------------------------------------------------------------------------
// Web Audio API click sound — pre-decoded buffer for zero-latency playback
// ---------------------------------------------------------------------------
let clickBuffer: AudioBuffer | null = null;

// Pre-decode click sound on first import
const clickUrl = new URL('../../assets/music/click.wav', import.meta.url).href;

(async () => {
  try {
    const ctx = getSharedAudioContext();
    const res = await fetch(clickUrl);
    const ab = await res.arrayBuffer();
    clickBuffer = await ctx.decodeAudioData(ab);
  } catch (e) {
    console.error('Failed to pre-decode click sound', e);
  }
})();

/**
 * useClickSound – lightweight hook for click SFX via Web Audio API.
 * Returns a `playClick` callback that respects sfxEnabled / sfxVolume.
 */
export function useClickSound() {
  const { sfxEnabled, sfxVolume } = useAppSelector((s) => s.settings);

  const sfxEnabledRef = useRef(sfxEnabled);
  const sfxVolumeRef = useRef(sfxVolume);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
    sfxVolumeRef.current = sfxVolume;
    syncSharedSfxVolume(sfxEnabled, sfxVolume);
  }, [sfxEnabled, sfxVolume]);

  const playClick = useCallback(() => {
    if (!sfxEnabledRef.current || !clickBuffer) return;

    // Trigger resume synchronously in the gesture
    resumeSharedAudioContext();

    const ctx = getSharedAudioContext();
    const source = ctx.createBufferSource();
    const destNode = getSharedSfxGainNode();
    source.buffer = clickBuffer;
    source.connect(destNode);
    source.start(0);
  }, []);

  return playClick;
}
