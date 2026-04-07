import type { IHookConfig, ISpinningLureState } from '@/common/types';

import type { DepthSystem } from '@/game/engine/systems/DepthSystem';
import { SPINNING_LURE } from '@/common/configs/game';

interface ISpinningLureUpdateParams {
  hookX: number;
  hookY: number;
  castX: number;
  castY: number;
  currentLureDepthM: number;
  canvasWidth: number;
  canvasHeight: number;
  waterBoundaryY: number;
  hookDepthM: number;
  playerReeling: boolean;
  deltaTime: number;
  hookConfig: IHookConfig;
  reelSpeed: number;
  depthSystem: DepthSystem;
}

/**
 * Manages spinning lure physics: depth changes, horizontal movement,
 * and idle sink/float behavior based on lure type.
 */
export function updateSpinningLure(
  params: ISpinningLureUpdateParams,
): ISpinningLureState {
  const {
    canvasWidth: W,
    canvasHeight: H,
    waterBoundaryY,
    hookConfig,
    deltaTime,
    depthSystem,
    playerReeling,
  } = params;

  const hookX = params.hookX;
  let hookY = params.hookY;
  let castX = params.castX;
  let castY = params.castY;
  let currentLureDepthM = params.currentLureDepthM;
  let reachedShore = false;

  const lureType = hookConfig.lureType;
  const dtSec = deltaTime / 60;

  // Dynamic ground depth under lure
  const normX = hookX / W;
  const waterY = H * waterBoundaryY;
  const normY = Math.max(0, Math.min(1, (hookY - waterY) / (H - waterY)));
  const groundDepthM = depthSystem.getDepthAt(normX, normY);

  if (playerReeling) {
    // Move strictly downward toward screen bottom (shore)
    const pullSpeed =
      SPINNING_LURE.reelingPullSpeedBase * dtSec * params.reelSpeed * (H / 800);

    const shoreBoundary = H * SPINNING_LURE.shoreBoundaryFraction;

    if (hookY < shoreBoundary) {
      hookY += pullSpeed;
      castX = hookX;
      castY = hookY;
    } else {
      reachedShore = true;
    }

    // Depth changes when reeling scale with reel speed
    if (lureType === 'wobbler') {
      // Dives when pulled
      currentLureDepthM = Math.min(
        groundDepthM,
        currentLureDepthM +
          params.reelSpeed * SPINNING_LURE.wobblerDiveSpeed * dtSec,
      );
    } else {
      // Rises when pulled
      currentLureDepthM = Math.max(
        SPINNING_LURE.minDepth,
        currentLureDepthM -
          params.reelSpeed * SPINNING_LURE.generalRiseSpeed * dtSec,
      );
    }
  } else {
    // Idle physics (sinking/floating)
    if (lureType === 'vibrotail') {
      currentLureDepthM = Math.min(
        groundDepthM,
        currentLureDepthM + SPINNING_LURE.vibrotailSinkSpeed * dtSec,
      );
    } else if (lureType === 'spoon') {
      currentLureDepthM = Math.min(
        groundDepthM,
        currentLureDepthM + SPINNING_LURE.spoonSinkSpeed * dtSec,
      );
    } else if (lureType === 'wobbler') {
      // Floats up when idle
      currentLureDepthM = Math.max(
        SPINNING_LURE.minDepth,
        currentLureDepthM - SPINNING_LURE.wobblerFloatSpeed * dtSec,
      );
    }
  }

  // Final clamp to bottom
  currentLureDepthM = Math.min(currentLureDepthM, groundDepthM);

  return {
    hookX,
    hookY,
    castX,
    castY,
    currentLureDepthM,
    groundDepthM,
    reachedShore,
  };
}
