import type { GamePhaseType, ITensionState } from '@/common/types';

interface IRodVisualInput {
  phase: GamePhaseType;
  isCast: boolean;
  hookX: number;
  hookY: number;
  castX: number;
  castY: number;
  bobberX?: number;
  bobberY?: number;
  canvasWidth: number;
  canvasHeight: number;
  renderScale: number;
  tension: ITensionState;
  isSpinning: boolean;
  playerReeling: boolean;
  hookDepthM: number;
  groundDepthM: number;
  currentLureDepthM: number;
  rigType: string | undefined;
  maxInterest: number;
  time: number;
  timeSinceCast: number;
  fishMovingTowardsPlayer: boolean;
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

export function computeRodVisuals(input: IRodVisualInput): IRodVisualOutput {
  const {
    phase,
    isCast,
    hookX,
    hookY,
    castX,
    castY,
    bobberX,
    bobberY,
    canvasHeight: H,
    renderScale,
    tension,
    isSpinning,
    playerReeling,
    hookDepthM,
    groundDepthM,
    currentLureDepthM,
    rigType,
    maxInterest,
    time,
    timeSinceCast,
    fishMovingTowardsPlayer,
  } = input;

  const isCombat = phase === 'reeling';
  const baseX = isCast
    ? isCombat
      ? Math.max(
          70 * renderScale,
          castX - 150 * renderScale + (hookX - castX) * 0.15,
        )
      : Math.max(70 * renderScale, hookX - 150 * renderScale)
    : 70 * renderScale;
  const baseY = H;

  const aimX = isCast ? (phase === 'reeling' ? hookX : castX) : baseX;
  const aimY = isCast
    ? phase === 'reeling'
      ? hookY
      : castY
    : baseY - 100 * renderScale;

  const isLayingOnSide =
    !isSpinning &&
    rigType !== 'feeder' &&
    hookDepthM > groundDepthM &&
    phase !== 'bite';

  const bobCycle = Math.sin(time * 0.3);
  let tilt = 0;

  if (isCast && !isSpinning && rigType !== 'feeder') {
    if (phase === 'waiting') {
      const pulse = Math.sin(time * 3.0) * maxInterest;
      if (maxInterest > 0.15) {
        if (isLayingOnSide) {
          tilt = Math.PI / 2.1 - pulse * 0.3;
        } else {
          tilt = bobCycle * 0.15;
        }
      } else if (!isLayingOnSide) {
        tilt = bobCycle * 0.15;
      } else {
        tilt = Math.PI / 2.1;
      }
    } else if (phase === 'bite') {
      tilt = 0;
    }
  }

  const stemAttachmentOffset =
    rigType === 'feeder' || isSpinning ? 0 : -0.5 * renderScale;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  const lineTargetX =
    isCast && !isSpinning && (phase === 'waiting' || phase === 'bite')
      ? (bobberX ?? castX) + sinT * stemAttachmentOffset
      : isCast
        ? hookX
        : baseX;

  const lineTargetY =
    isCast && !isSpinning && (phase === 'waiting' || phase === 'bite')
      ? (bobberY ?? castY) + cosT * stemAttachmentOffset
      : isCast
        ? hookY
        : baseY;

  let rodTension = 0;
  let lineSlack = 0;

  if (phase === 'reeling') {
    rodTension = tension.value;
    lineSlack = fishMovingTowardsPlayer && tension.value < 0.1 ? 0.5 : 0;
  } else if (phase === 'bite') {
    if (rigType === 'feeder') {
      const biteWave = Math.sin(time * 12) * 0.03;
      rodTension = 0.12 + biteWave;
      lineSlack = 0.01;
    } else {
      rodTension = tension.value;
      lineSlack = 0;
    }
  } else if (isCast && isSpinning && phase === 'waiting') {
    if (playerReeling) {
      lineSlack = 0;
      rodTension = 0.08;
    } else {
      const depthRatio = currentLureDepthM / Math.max(0.1, groundDepthM);

      const depthFactor = Math.min(1.0, 0.3 + (groundDepthM / 4.0) * 0.7);
      const baseSlack = (0.1 + Math.pow(depthRatio, 1.2) * 0.75) * depthFactor;
      const subtleWave = Math.sin(time * 0.9) * 0.01 * depthRatio;
      lineSlack = Math.max(0, Math.min(1.0, baseSlack + subtleWave));
      rodTension = 0;
    }
  } else if (isCast && phase === 'waiting') {
    const depthFactor = Math.min(1.0, 0.3 + (groundDepthM / 4.0) * 0.7);
    const baseSlack = rigType === 'feeder' ? 0.04 : 0.85 * depthFactor;

    const currentWave = Math.sin(time * 0.6) * 0.008;
    const nibbleJitter =
      maxInterest > 0.4 ? Math.sin(time * 900) * (maxInterest - 0.4) * 0.04 : 0;

    lineSlack = Math.max(
      0.01,
      baseSlack + currentWave - (rigType === 'feeder' ? 0 : nibbleJitter),
    );

    if (rigType === 'feeder') {
      let shakeAmount = 0;
      if (maxInterest > 0.1) {
        const freq1 = 4.0 + maxInterest * 5.0;
        const freq2 = freq1 * 0.73;

        const wave1 = Math.sin(time * freq1);
        const wave2 = Math.cos(time * freq2);

        const combinedWave = 1 + (wave1 + wave2) * 0.5;

        shakeAmount = (maxInterest - 0.1) * 0.08 * combinedWave;
      }
      rodTension = shakeAmount;
      lineSlack = Math.max(0, lineSlack - shakeAmount * 0.3);
    }
  } else if (isCast && phase === 'escaped') {
    rodTension = 0;
    lineSlack = 1.0;
  }

  if (isCast && phase === 'waiting' && timeSinceCast < 1.0) {
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
