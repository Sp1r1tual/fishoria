/**
 * Single shared AudioContext for the entire application.
 * This ensures we don't hit browser limits and makes unlocking easier on iOS.
 */
let sharedCtx: AudioContext | null = null;

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
