import { useCallback, useRef, useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';
import {
  getSharedAudioContext,
  resumeSharedAudioContext,
} from '@/common/media/audio-context';

let soundBuffer: AudioBuffer | null = null;

const soundUrl = new URL('../../assets/music/achievements.mp3', import.meta.url)
  .href;

(async () => {
  try {
    const ctx = getSharedAudioContext();
    const res = await fetch(soundUrl);
    const ab = await res.arrayBuffer();
    soundBuffer = await ctx.decodeAudioData(ab);
  } catch (e) {
    console.error('Failed to pre-decode achievement sound', e);
  }
})();

/**
 * useAchievementSound – returns a `playAchievementSound` callback that respects sfx settings.
 */
export function useAchievementSound() {
  const { sfxEnabled, sfxVolume } = useAppSelector((s) => s.settings);

  const sfxEnabledRef = useRef(sfxEnabled);
  const sfxVolumeRef = useRef(sfxVolume);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
    sfxVolumeRef.current = sfxVolume;
  }, [sfxEnabled, sfxVolume]);

  const playAchievementSound = useCallback(() => {
    if (!sfxEnabledRef.current || !soundBuffer) return;

    resumeSharedAudioContext();

    const ctx = getSharedAudioContext();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = soundBuffer;
    gain.gain.value = sfxVolumeRef.current / 100;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
  }, []);

  return playAchievementSound;
}
