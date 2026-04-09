import { useEffect, useRef, useCallback } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';

import type { GamePhaseType, TimeOfDayType } from '@/common/types';

// ---------------------------------------------------------------------------
// Web Audio API engine — pre-decoded buffers for zero-latency SFX
// ---------------------------------------------------------------------------
import {
  getSharedAudioContext,
  resumeSharedAudioContext,
  getSharedSfxGainNode,
  syncSharedSfxVolume,
} from '@/common/media/audio-context';

// ---------------------------------------------------------------------------
// SFX source URLs (resolved at build time by Vite)
// ---------------------------------------------------------------------------
const SFX_URLS = {
  casting: new URL('../../assets/music/casting.mp3', import.meta.url).href,
  fishingBell: new URL('../../assets/music/fishing-bell.mp3', import.meta.url)
    .href,
  hauling: new URL('../../assets/music/hauling_fish.mp3', import.meta.url).href,
  winding: new URL('../../assets/music/reel_winding.mp3', import.meta.url).href,
  unwinding: new URL('../../assets/music/reel_unwinding.mp3', import.meta.url)
    .href,
  purchase: new URL('../../assets/music/metal_coin_rattle.mp3', import.meta.url)
    .href,
  click: new URL('../../assets/music/click.wav', import.meta.url).href,
} as const;

type SfxKey = keyof typeof SFX_URLS;

// Pre-decoded AudioBuffers (filled by loadSfxBuffers)
const sfxBuffers: Partial<Record<SfxKey, AudioBuffer>> = {};

// Active looping source nodes (so we can .stop() them)
const activeLoops: Partial<
  Record<SfxKey, { source: AudioBufferSourceNode; gain: GainNode }>
> = {};

/** Fetch + decode all SFX into AudioBuffers for instant playback */
async function loadSfxBuffers() {
  const ctx = getSharedAudioContext();
  const entries = Object.entries(SFX_URLS) as [SfxKey, string][];
  await Promise.allSettled(
    entries.map(async ([key, url]) => {
      try {
        const res = await fetch(url);
        const ab = await res.arrayBuffer();
        sfxBuffers[key] = await ctx.decodeAudioData(ab);
      } catch (e) {
        console.warn(`Failed to pre-decode SFX: ${key}`, e);
      }
    }),
  );
}

// ---------------------------------------------------------------------------
// Ambient tracks — HTMLAudioElement is fine (long music, latency irrelevant)
// ---------------------------------------------------------------------------
const AMBIENT: Record<string, HTMLAudioElement> = {
  forest_lake_day: new Audio(
    'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/scenes/forest_lake_day.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy9zY2VuZXMvZm9yZXN0X2xha2VfZGF5Lm1wMyIsImlhdCI6MTc3NTQ2NzAwMiwiZXhwIjo0ODk3NTMxMDAyfQ.KLYkcU4bnnbOEAR2Qq9jVaV_W_m8m2OBjHazHClMPtM',
  ),
  forest_lake_night: new Audio(
    'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/scenes/forest_lake_night.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy9zY2VuZXMvZm9yZXN0X2xha2VfbmlnaHQubXAzIiwiaWF0IjoxNzc1NDY3MDI2LCJleHAiOjQ4OTc1MzEwMjZ9.c_TGZmGI6zW3U9XkfHduVqdZf7BL0W4wnw-IVyATmkg',
  ),
  fish_farm_day: new Audio(
    'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/scenes/resirvour_day.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy9zY2VuZXMvcmVzaXJ2b3VyX2RheS5tcDMiLCJpYXQiOjE3NzU0NjcwNDksImV4cCI6NDg5NzUzMTA0OX0.Wx_FooANOlh61LqRhZA2ClclXqYTZww0zjoFmFYRYHw',
  ),
  fish_farm_night: new Audio(
    'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/scenes/resirvour_night.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy9zY2VuZXMvcmVzaXJ2b3VyX25pZ2h0Lm1wMyIsImlhdCI6MTc3NTQ2NzA2NywiZXhwIjo0ODk3NTMxMDY3fQ.XzqGgJv15mmDe0-59TxMyjOx8wevzJ5guKuDmeLPzB8',
  ),
  rain: new Audio(
    'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/sounds/scenes/rain.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3NvdW5kcy9zY2VuZXMvcmFpbi5tcDMiLCJpYXQiOjE3NzU0NjcwODQsImV4cCI6NDg5NzUzMTA4NH0.fppFBHNBC-mEdyXHHrxJ7dDuzm_7z_DXRwMH0GTbASU',
  ),
};

Object.values(AMBIENT).forEach((a) => {
  a.loop = true;
  a.preload = 'auto';
  a.crossOrigin = 'anonymous';
});

let ambientGainNode: GainNode | null = null;
const connectedAmbients = new Set<HTMLAudioElement>();

function ensureAmbientConnected(audio: HTMLAudioElement) {
  try {
    const ctx = getSharedAudioContext();
    if (!ambientGainNode) {
      ambientGainNode = ctx.createGain();
      ambientGainNode.gain.value = 0; // Default to silent to prevent leaks during unlock
      ambientGainNode.connect(ctx.destination);
    }
    if (!connectedAmbients.has(audio)) {
      const source = ctx.createMediaElementSource(audio);
      source.connect(ambientGainNode);
      connectedAmbients.add(audio);
    }
  } catch (e) {
    console.warn('Failed to connect ambient to AudioContext:', e);
  }
  return ambientGainNode;
}

// ---------------------------------------------------------------------------
// iOS/Safari Autoplay & Latency Fix
// ---------------------------------------------------------------------------
let isAudioUnlocked = false;

export async function unlockAudio() {
  if (isAudioUnlocked) return;
  isAudioUnlocked = true;

  try {
    // 1. Resume shared AudioContext
    await resumeSharedAudioContext();
    const ctx = getSharedAudioContext();

    // Play a 1-sample silent buffer to fully unlock the context
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);

    // 2. Unlock HTMLAudioElement pipeline
    // On iOS Safari, we must play/pause each audio element during the first user interaction
    // to allow them to be played later by non-user events (like weather changes).
    const silentURI =
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    const silent = new Audio(silentURI);
    silent.muted = true;
    silent
      .play()
      .then(() => silent.pause())
      .catch(() => {});

    Object.values(AMBIENT).forEach((bgAudio) => {
      // Connect to AudioContext immediately so we can control volume via GainNode
      ensureAmbientConnected(bgAudio);

      bgAudio.muted = true; // Use muted (volume is read-only on iOS)
      bgAudio
        .play()
        .then(() => {
          bgAudio.pause();
          bgAudio.muted = false;
          bgAudio.currentTime = 0;
        })
        .catch(() => {
          bgAudio.muted = false;
        });
    });

    // Resume multiple times to be absolutely sure
    const resumeOnAnyInteraction = () => {
      resumeSharedAudioContext();
      window.removeEventListener('click', resumeOnAnyInteraction);
      window.removeEventListener('touchstart', resumeOnAnyInteraction);
    };
    window.addEventListener('click', resumeOnAnyInteraction);
    window.addEventListener('touchstart', resumeOnAnyInteraction);
  } catch {
    // ignore
  }

  // 3. Pre-decode all SFX in the background (non-blocking)
  loadSfxBuffers();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useGameAudio(manageAmbient = true) {
  const { sfxEnabled, sfxVolume, ambientEnabled, ambientVolume } =
    useAppSelector((s) => s.settings);
  const weather = useAppSelector((s) => s.game.weather);
  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);

  const sfxEnabledRef = useRef(sfxEnabled);
  const sfxVolumeRef = useRef(sfxVolume);
  const ambientEnabledRef = useRef(ambientEnabled !== false);
  const ambientVolumeRef = useRef(ambientVolume ?? 60);

  const currentPhaseRef = useRef<GamePhaseType>('idle');
  const unwindingTimeoutRef = useRef<number | null>(null);
  const currentAmbientRef = useRef<HTMLAudioElement | null>(null);

  // Keep refs in sync & update active loop volumes
  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
    sfxVolumeRef.current = sfxVolume;
    ambientEnabledRef.current = ambientEnabled !== false;
    ambientVolumeRef.current = ambientVolume ?? 60;

    syncSharedSfxVolume(sfxEnabled, sfxVolume);

    if (manageAmbient) {
      // Sync ambient
      if (currentAmbientRef.current) {
        const gainNode = ensureAmbientConnected(currentAmbientRef.current);
        if (ambientEnabled !== false && weather !== 'rain') {
          if (gainNode) gainNode.gain.value = (ambientVolume ?? 60) / 100;
          currentAmbientRef.current.volume = 1;
          if (currentAmbientRef.current.paused)
            currentAmbientRef.current.play().catch(() => {});
        } else {
          currentAmbientRef.current.pause();
        }
      }

      // Rain
      if (currentLakeId && weather === 'rain' && ambientEnabled !== false) {
        const gainNode = ensureAmbientConnected(AMBIENT.rain);
        if (gainNode) gainNode.gain.value = (ambientVolume ?? 60) / 100;
        AMBIENT.rain.volume = 1;
        if (AMBIENT.rain.paused) AMBIENT.rain.play().catch(() => {});
      } else {
        AMBIENT.rain.pause();
      }
    }
  }, [
    sfxEnabled,
    sfxVolume,
    ambientEnabled,
    ambientVolume,
    weather,
    currentLakeId,
    manageAmbient,
  ]);

  // -------------------------------------------------------------------------
  // Web Audio playback helpers
  // -------------------------------------------------------------------------

  /** Play a one-shot SFX — near-zero latency via pre-decoded AudioBuffer */
  const playOnce = useCallback((key: SfxKey) => {
    if (!sfxEnabledRef.current) return;
    const buffer = sfxBuffers[key];
    if (!buffer) return;

    resumeSharedAudioContext();

    const ctx = getSharedAudioContext();
    const source = ctx.createBufferSource();
    const destNode = getSharedSfxGainNode();

    source.buffer = buffer;
    source.connect(destNode);
    source.start(0);
  }, []);

  /** Start a looping SFX (winding/unwinding) */
  const startLoop = useCallback((key: SfxKey) => {
    if (!sfxEnabledRef.current) return;
    if (activeLoops[key]) return; // already playing

    const buffer = sfxBuffers[key];
    if (!buffer) return;

    resumeSharedAudioContext();

    const ctx = getSharedAudioContext();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain(); // Keep local gain just for easy stopping/disconnecting if needed, or mute
    const destNode = getSharedSfxGainNode();

    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(destNode);
    source.start(0);

    activeLoops[key] = { source, gain };
  }, []);

  /** Stop a looping SFX */
  const stopLoop = useCallback((key: SfxKey) => {
    const entry = activeLoops[key];
    if (entry) {
      try {
        entry.source.stop();
      } catch {
        /* already stopped */
      }
      entry.source.disconnect();
      entry.gain.disconnect();
      delete activeLoops[key];
    }
  }, []);

  const stopAllLoops = useCallback(() => {
    if (unwindingTimeoutRef.current !== null) {
      window.clearTimeout(unwindingTimeoutRef.current);
      unwindingTimeoutRef.current = null;
    }
    stopLoop('winding');
    stopLoop('unwinding');
  }, [stopLoop]);

  // -------------------------------------------------------------------------
  // Public callbacks
  // -------------------------------------------------------------------------
  const onCast = useCallback(() => {
    stopAllLoops();
    playOnce('casting');
  }, [playOnce, stopAllLoops]);

  const lastBellTimeRef = useRef(0);
  const playBell = useCallback(() => {
    const now = Date.now();
    if (now - lastBellTimeRef.current < 500) return;
    lastBellTimeRef.current = now;
    playOnce('fishingBell');
  }, [playOnce]);

  const onBite = useCallback(() => {
    playBell();
  }, [playBell]);

  const onHook = useCallback(() => {}, []);

  const onCatch = useCallback(() => {
    stopAllLoops();
    playOnce('hauling');
  }, [playOnce, stopAllLoops]);

  const onLineBroke = useCallback(() => {
    stopAllLoops();
  }, [stopAllLoops]);

  const onPurchase = useCallback(() => {
    playOnce('purchase');
  }, [playOnce]);

  const onClick = useCallback(() => {
    playOnce('click');
  }, [playOnce]);

  const onReelingState = useCallback(
    (playerReeling: boolean) => {
      const isReelingInFish = currentPhaseRef.current === 'reeling';
      const isRetrievingLure = currentPhaseRef.current === 'waiting';

      if (!isReelingInFish && !isRetrievingLure) return;

      if (unwindingTimeoutRef.current !== null) {
        window.clearTimeout(unwindingTimeoutRef.current);
        unwindingTimeoutRef.current = null;
      }

      if (playerReeling) {
        stopLoop('unwinding');
        startLoop('winding');
      } else {
        stopLoop('winding');
        unwindingTimeoutRef.current = window.setTimeout(() => {
          if (currentPhaseRef.current === 'reeling') {
            startLoop('unwinding');
          }
        }, 300);
      }
    },
    [startLoop, stopLoop],
  );

  const onPhaseChange = useCallback(
    (phase: GamePhaseType) => {
      currentPhaseRef.current = phase;
      if (phase !== 'reeling') {
        stopAllLoops();
      }
      if (phase === 'reeling') {
        if (unwindingTimeoutRef.current !== null) {
          window.clearTimeout(unwindingTimeoutRef.current);
        }
        unwindingTimeoutRef.current = window.setTimeout(() => {
          if (currentPhaseRef.current === 'reeling') {
            startLoop('unwinding');
          }
        }, 300);
      }
    },
    [stopAllLoops, startLoop],
  );

  const onTimeOfDayChange = useCallback(
    (lakeId: string | null, tod: TimeOfDayType | null) => {
      if (!lakeId || !tod) return;
      const isNight = tod === 'night';
      const trackKey = `${lakeId}_${isNight ? 'night' : 'day'}`;
      const targetAudio = AMBIENT[trackKey];

      if (currentAmbientRef.current !== targetAudio) {
        if (currentAmbientRef.current) {
          currentAmbientRef.current.pause();
        }
        currentAmbientRef.current = targetAudio;
      }

      if (targetAudio) {
        const gainNode = ensureAmbientConnected(targetAudio);
        if (gainNode)
          gainNode.gain.value = ambientEnabledRef.current
            ? ambientVolumeRef.current / 100
            : 0;

        targetAudio.volume = 1;

        if (
          ambientEnabledRef.current &&
          weather !== 'rain' &&
          targetAudio.paused
        ) {
          targetAudio.play().catch(() => {});
        } else if (weather === 'rain') {
          targetAudio.pause();
        }
      }
    },
    [weather],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      stopAllLoops();
      if (currentAmbientRef.current) {
        currentAmbientRef.current.pause();
        currentAmbientRef.current = null;
      }
      AMBIENT.rain.pause();
    };
  }, [stopAllLoops]);

  return {
    onCast,
    onBite,
    onHook,
    onCatch,
    onPurchase,
    onClick,
    onLineBroke,
    onReelingState,
    onPhaseChange,
    onTimeOfDayChange,
  };
}
