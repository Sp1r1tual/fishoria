/**
 * Single shared AudioContext for the entire application.
 * This ensures we don't hit browser limits and makes unlocking easier on iOS.
 */
let sharedCtx: AudioContext | null = null;
let sharedSfxGainNode: GainNode | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedCtx = new Ctor();
  }
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
  if (ctx.state === 'suspended') {
    await ctx
      .resume()
      .catch((e) => console.warn('Failed to resume AudioContext:', e));
  }
}
