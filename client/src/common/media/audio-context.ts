/**
 * Single shared AudioContext for the entire application.
 * This ensures we don't hit browser limits and makes unlocking easier on iOS.
 */
let sharedCtx: AudioContext | null = null;
let sharedSfxGainNode: GainNode | null = null;

export const isIOS =
  typeof window !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh|Mac OS X/.test(navigator.userAgent) &&
      navigator.maxTouchPoints > 1));

export function getSharedAudioContext(): AudioContext {
  if (sharedCtx) return sharedCtx;

  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;

  sharedCtx = new Ctor();
  return sharedCtx;
}

/**
 * Returns a global GainNode meant for all SFX.
 * Changing the volume on this node immediately affects all playing short SFX.
 */
export function getSharedSfxGainNode(): GainNode {
  const ctx = getSharedAudioContext();
  if (!sharedSfxGainNode) {
    sharedSfxGainNode = ctx.createGain();
    sharedSfxGainNode.connect(ctx.destination);
  }
  return sharedSfxGainNode;
}

export function syncSharedSfxVolume(enabled: boolean, volumeLevel: number) {
  const gainNode = getSharedSfxGainNode();
  gainNode.gain.value = enabled
    ? Math.max(0, Math.min(1, volumeLevel / 100))
    : 0;
}

/**
 * Resumes the shared audio context.
 * Must be called from a user-initiated event (click, touch).
 */
export async function resumeSharedAudioContext(): Promise<void> {
  const ctx = getSharedAudioContext();
  if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
    await ctx
      .resume()
      .catch((error) => console.warn('Failed to resume AudioContext:', error));
  }
}

export async function suspendSharedAudioContext(): Promise<void> {
  const ctx = getSharedAudioContext();
  if (ctx.state === 'running') {
    await ctx
      .suspend()
      .catch((error) => console.warn('Failed to suspend AudioContext:', error));
  }
}
