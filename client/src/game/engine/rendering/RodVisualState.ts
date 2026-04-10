import type { GamePhaseType, ITensionState } from '@/common/types';

import type { Fish } from '@/game/domain/fish/Fish';

interface IRodVisualInput {
  phase: GamePhaseType;
  isCast: boolean;
  hookX: number;
  hookY: number;
  castX: number;
  castY: number;
  canvasHeight: number;
  renderScale: number;
  tension: ITensionState;
  hookedFish: Fish | null;
  isSpinning: boolean;
  playerReeling: boolean;
  hookDepthM: number;
  groundDepthM: number;
  currentLureDepthM: number;
  rigType: string | undefined;
  maxInterest: number;
  time: number;
  timeSinceCast: number;
}

interface IRodVisualOutput {
  baseX: number;
  baseY: number;
  aimX: number;
  aimY: number;
  lineTargetX: number;
  lineTargetY: number;
  rodTension: number;
  lineSlack: number;
}

/**
 * Computes the rod and line visual state (base position, aim, tension, slack)
 * from the current fishing state. Pure function — no mutations.
 */
export function computeRodVisuals(input: IRodVisualInput): IRodVisualOutput {
  const {
    phase,
    isCast,
    hookX,
    hookY,
    castX,
    castY,
    canvasHeight: H,
    renderScale,
    tension,
    hookedFish,
    isSpinning,
    playerReeling,
    hookDepthM,
    groundDepthM,
    currentLureDepthM,
    rigType,
    maxInterest,
    time,
    timeSinceCast,
  } = input;

  const baseX = isCast
    ? Math.max(70 * renderScale, hookX - 150 * renderScale)
    : 70 * renderScale;
  const baseY = H;

  // Final tip target position
  const aimX = isCast ? (phase === 'reeling' ? hookX : castX) : baseX;
  const aimY = isCast
    ? phase === 'reeling'
      ? hookY
      : castY
    : baseY - 100 * renderScale;

  const lineTargetX =
    isCast && !isSpinning && (phase === 'waiting' || phase === 'bite')
      ? castX
      : isCast
        ? hookX
        : baseX;

  let lineTargetY =
    isCast && !isSpinning && (phase === 'waiting' || phase === 'bite')
      ? castY
      : isCast
        ? hookY
        : baseY;

  // Sync line with bobber animation
  if (
    isCast &&
    !isSpinning &&
    rigType !== 'feeder' &&
    (phase === 'waiting' || phase === 'bite')
  ) {
    const isLayingOnSide = hookDepthM > groundDepthM;
    let sinkY = 0;

    if (!isLayingOnSide) {
      if (phase === 'waiting') {
        if (maxInterest > 0.15) {
          const pulse = Math.sin(time * 0.05) * maxInterest;
          sinkY = Math.max(0, pulse * 14 * renderScale);
        } else {
          const bobCycle = Math.sin(time * 0.005);
          sinkY = bobCycle * 3 * renderScale;
        }
      } else if (phase === 'bite') {
        sinkY = 5 * renderScale;
      }
    } else {
      if (phase === 'waiting') {
        if (maxInterest > 0.15) {
          const pulse = Math.sin(time * 0.05) * maxInterest;
          sinkY = pulse * 2 * renderScale;
        }
      } else if (phase === 'bite') {
        sinkY = (4 + Math.sin(time * 0.15) * 2) * renderScale;
      }
    }

    lineTargetY += sinkY;
  }

  let rodTension = 0;
  let lineSlack = 0;

  if (phase === 'reeling') {
    rodTension = tension.value;
    const vy = hookedFish?.velocity.y ?? 0;
    lineSlack = vy > 0.1 ? Math.min(1.0, vy * 0.4) : 0;
  } else if (phase === 'bite') {
    rodTension = tension.value;
    lineSlack = 0;
  } else if (isCast && isSpinning && phase === 'waiting') {
    if (playerReeling) {
      lineSlack = 0;
      rodTension = 0.08;
    } else {
      const depthRatio = currentLureDepthM / Math.max(0.1, groundDepthM);
      // Slack increases with depth ratio, but is capped by absolute depth
      // Shallow water (e.g. 1m) should have less visual slack than deep water (e.g. 5m)
      const depthFactor = Math.min(1.0, 0.3 + (groundDepthM / 4.0) * 0.7);
      const baseSlack = (0.1 + Math.pow(depthRatio, 1.2) * 0.75) * depthFactor;
      const subtleWave = Math.sin(time * 1.5) * 0.02 * depthRatio;
      lineSlack = Math.max(0, Math.min(1.0, baseSlack + subtleWave));
      rodTension = 0;
    }
  } else if (isCast && phase === 'waiting') {
    // Float is always relaxed, Feeder (donka) is always tight
    const depthFactor = Math.min(1.0, 0.3 + (groundDepthM / 4.0) * 0.7);
    const baseSlack = rigType === 'feeder' ? 0.04 : 0.85 * depthFactor;

    // Add subtle water current and fish-nibble micro-movements
    const currentWave = Math.sin(time * 1.2) * 0.015;
    const nibbleJitter =
      maxInterest > 0.4 ? Math.sin(time * 15) * (maxInterest - 0.4) * 0.04 : 0;

    lineSlack = Math.max(
      0.01,
      baseSlack + currentWave - (rigType === 'feeder' ? 0 : nibbleJitter),
    );

    if (rigType === 'feeder') {
      const shakeAmount =
        maxInterest > 0.3
          ? (maxInterest - 0.3) *
            0.125 *
            (1 + Math.sin(time * (7.5 + maxInterest * 15)))
          : 0;
      rodTension = shakeAmount;
      lineSlack = Math.max(0, lineSlack - shakeAmount * 0.1);
    }
  } else if (isCast && phase === 'escaped') {
    rodTension = 0;
    lineSlack = 1.0;
  }

  // Add cast "whipping" effect to the rod tip immediately after casting
  if (isCast && phase === 'waiting' && timeSinceCast < 1.0) {
    // Starts bent forward (due to cast momentum) then oscillates backward/forward rapidly while decaying
    const rodWhip =
      Math.exp(-timeSinceCast * 6) * Math.cos(timeSinceCast * 25) * 0.35;
    rodTension += rodWhip;
  }

  return {
    baseX,
    baseY,
    aimX,
    aimY,
    lineTargetX,
    lineTargetY,
    rodTension,
    lineSlack,
  };
}
