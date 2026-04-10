import { useCallback, useRef, useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';
import {
  getSharedAudioContext,
  resumeSharedAudioContext,
  getSharedSfxGainNode,
} from '@/common/media/audio-context';

let soundBuffer: AudioBuffer | null = null;

const soundUrl = new URL('../../assets/music/achievements.mp3', import.meta.url)
  .href;

/** Pre-decode achievement sound. Must be called after AudioContext is unlocked. */
export async function preloadAchievementBuffer() {
  if (soundBuffer) return;
  try {
    const ctx = getSharedAudioContext();
    const res = await fetch(soundUrl);
    const ab = await res.arrayBuffer();
    soundBuffer = await ctx.decodeAudioData(ab);
  } catch (e) {
    console.error('Failed to pre-decode achievement sound', e);
  }
}

/**
 * useAchievementSound – returns a `playAchievementSound` callback that respects sfx settings.
 * Volume is controlled centrally via the shared SFX GainNode (synced in AudioController).
 */
export function useAchievementSound() {
  const sfxEnabled = useAppSelector((s) => s.settings.sfxEnabled);

  const sfxEnabledRef = useRef(sfxEnabled);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  const playAchievementSound = useCallback(() => {
    if (!sfxEnabledRef.current || !soundBuffer) return;

    resumeSharedAudioContext();

    const ctx = getSharedAudioContext();
    const source = ctx.createBufferSource();
    const destNode = getSharedSfxGainNode();

    source.buffer = soundBuffer;
    source.connect(destNode);
    source.start(0);
  }, []);

  return playAchievementSound;
}
