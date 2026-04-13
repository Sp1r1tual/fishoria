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
  retrieveSpeedMult: number;
  depthSystem: DepthSystem;
}

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

  const normX = hookX / W;
  const waterY = H * waterBoundaryY;
  const normY = Math.max(0, Math.min(1, (hookY - waterY) / (H - waterY)));
  const groundDepthM = depthSystem.getDepthAt(normX, normY);

  if (playerReeling) {
    const pullSpeed =
      SPINNING_LURE.reelingPullSpeedBase *
      dtSec *
      params.retrieveSpeedMult *
      (H / 800);

    const shoreBoundary = H * SPINNING_LURE.shoreBoundaryFraction;

    if (hookY < shoreBoundary) {
      hookY += pullSpeed;
      castX = hookX;
      castY = hookY;
    } else {
      reachedShore = true;
    }

    if (lureType === 'wobbler') {
      currentLureDepthM = Math.min(
        groundDepthM,
        currentLureDepthM +
          params.retrieveSpeedMult * SPINNING_LURE.wobblerDiveSpeed * dtSec,
      );
    } else {
      currentLureDepthM = Math.max(
        SPINNING_LURE.minDepth,
        currentLureDepthM -
          params.retrieveSpeedMult * SPINNING_LURE.generalRiseSpeed * dtSec,
      );
    }
  } else {
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
      currentLureDepthM = Math.max(
        SPINNING_LURE.minDepth,
        currentLureDepthM - SPINNING_LURE.wobblerFloatSpeed * dtSec,
      );
    }
  }

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
