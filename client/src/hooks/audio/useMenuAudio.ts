import { useEffect } from 'react';

import { useClickSound } from './useSoundEffect';

import { useAppSelector } from '@/hooks/core/useAppStore';

import {
  getSharedAudioContext,
  resumeSharedAudioContext,
  isIOS,
} from '@/common/media/audio-context';

// ---------------------------------------------------------------------------
// Music playlist – tracks rotate after each one finishes
// ---------------------------------------------------------------------------
const MUSIC_URLS = [
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/ui/main_theme_1.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy91aS9tYWluX3RoZW1lXzEubXAzIiwiaWF0IjoxNzc1ODU4NTQyLCJleHAiOjQ4OTc5MjI1NDJ9.4tO1WzKsLCqgTiQbVwZOKzyLjNIq4ETa1l18rca89Co',
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/ui/main_theme_2.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy91aS9tYWluX3RoZW1lXzIubXAzIiwiaWF0IjoxNzc1ODU3NDQ0LCJleHAiOjQ4OTc5MjE0NDR9.x3vBk9_neLPBfJflTYV992DyNQi08snn4A0FDXQY9fY',
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/ui/main_theme_3.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy91aS9tYWluX3RoZW1lXzMubXAzIiwiaWF0IjoxNzc1ODU4MTc5LCJleHAiOjQ4OTc5MjIxNzl9.iP_8KHf9ImXdX4eachOgDvErWGcF9R4oFjgCtUMZTg4',
];

const musicTracks = MUSIC_URLS.map((url) => {
  const audio = new Audio(new URL(url).href);
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  return audio;
});

// Start from a random track each session for variety
let currentTrackIndex = Math.floor(Math.random() * musicTracks.length);

let musicGainNode: GainNode | null = null;
const connectedTracks = new Set<HTMLAudioElement>();

function ensureAllTracksConnected() {
  if (!musicGainNode) {
    try {
      const ctx = getSharedAudioContext();
      musicGainNode = ctx.createGain();
      musicGainNode.connect(ctx.destination);
    } catch (e) {
      console.warn('Failed to create music GainNode:', e);
      return null;
    }
  }

  for (const track of musicTracks) {
    if (!connectedTracks.has(track)) {
      try {
        const ctx = getSharedAudioContext();
        const source = ctx.createMediaElementSource(track);
        source.connect(musicGainNode);
        connectedTracks.add(track);
      } catch (error) {
        console.warn('Failed to connect music track:', error);
      }
    }
  }

  return musicGainNode;
}

function getCurrentTrack() {
  return musicTracks[currentTrackIndex];
}

function pauseAllTracks() {
  musicTracks.forEach((t) => t.pause());
}

export function unlockMusicTracks() {
  musicTracks.forEach((track) => {
    track.muted = true;
    const p = track.play();

    // Pause synchronously so it doesn't actually output sound,
    // but Safari still registers the user-interaction unlock.
    track.pause();
    track.currentTime = 0;

    if (p !== undefined) {
      p.then(() => {
        track.muted = false;
      }).catch(() => {
        track.muted = false;
      });
    } else {
      track.muted = false;
    }
  });
}

// ---------------------------------------------------------------------------
// HMR cleanup – stop old Audio elements when module is replaced
// ---------------------------------------------------------------------------
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    pauseAllTracks();
    musicTracks.forEach((t) => {
      t.src = '';
    });
  });
}

/**
 * useMenuAudio – App-level hook that manages menu music playlist and click SFX.
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
  // Track rotation – when current track ends, play the next one
  // ------------------------------------------------------------------
  useEffect(() => {
    const handlers = musicTracks.map((track) => {
      const handler = () => {
        if (track !== getCurrentTrack()) return;
        currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
        const next = getCurrentTrack();
        next.currentTime = 0;
        next.volume = 1;
        next.play().catch(() => {});
      };
      track.addEventListener('ended', handler);
      return { track, handler };
    });

    return () => {
      handlers.forEach(({ track, handler }) =>
        track.removeEventListener('ended', handler),
      );
    };
  }, []);

  // ------------------------------------------------------------------
  // Music – smooth fade in/out based on settings AND the musicActive flag
  // ------------------------------------------------------------------
  useEffect(() => {
    const shouldPlay = musicActive && musicEnabled;
    const targetVolume = shouldPlay ? musicVolume / 100 : 0;

    // Helper to ramp volume to target
    const syncMenuVolume = (target: number) => {
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }

      const gainNode = ensureAllTracksConnected();
      if (!gainNode) return;

      fadeInterval = setInterval(() => {
        const diff = target - currentMenuVolume;
        if (Math.abs(diff) < 0.01) {
          currentMenuVolume = target;
          gainNode.gain.value = currentMenuVolume;

          if (currentMenuVolume <= 0 && target === 0) pauseAllTracks();

          if (fadeInterval) clearInterval(fadeInterval);
          fadeInterval = null;
        } else {
          currentMenuVolume += diff > 0 ? 0.01 : -0.015;
          const level = Math.max(0, Math.min(1, currentMenuVolume));
          gainNode.gain.value = level;
        }
      }, 20);
    };

    if (shouldPlay) {
      const track = getCurrentTrack();
      if (track.paused) {
        currentMenuVolume = 0;
        const gainNode = ensureAllTracksConnected();
        if (gainNode) gainNode.gain.value = 0;
        track.volume = 1; // Keep HTML volume at max
        track.currentTime = 0;
        track.play().catch(() => {});
      }
      syncMenuVolume(targetVolume);
    } else {
      syncMenuVolume(0);
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseAllTracks();
      } else {
        if (isIOS && musicGainNode) {
          currentMenuVolume = 0;
          musicGainNode.gain.value = 0;
          // Nudge currentTime slightly to clear any stuck buffers on iOS
          const track = getCurrentTrack();
          if (track.currentTime > 0.1) {
            track.currentTime += 0.05;
          }
        }

        resumeSharedAudioContext();

        if (musicActive && musicEnabled) {
          setTimeout(
            () => {
              const track = getCurrentTrack();
              if (track.paused) track.play().catch(() => {});
              syncMenuVolume(targetVolume); // Re-trigger the fade-in
            },
            isIOS ? 250 : 0,
          );
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
    };
  }, [musicActive, musicEnabled, musicVolume]);

  return { playClick };
}
