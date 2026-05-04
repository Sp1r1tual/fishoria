import type {
  IHookConfig,
  ILakeSceneCallbacks,
  IReelingResult,
  ITensionState,
  IRodConfig,
  IReelConfig,
  ILineConfig,
  RigTypeType,
} from '@/common/types';

import { TensionSystem } from './TensionSystem';
import { pullFishToShore, applyFishAutonomousMovement } from './ReelingPhysics';
import { generateCatch } from './CatchResult';
import type { Fish } from '@/game/domain/fish/Fish';

import { GEAR_WEAR, REELING_PHYSICS } from '@/common/configs/game';

interface IReelingUpdateParams {
  hookedFish: Fish;
  tension: ITensionState;
  playerReeling: boolean;
  playerRelaxing: boolean;
  deltaTime: number;
  canvasWidth: number;
  canvasHeight: number;
  rodConfig: IRodConfig | null;
  reelConfig: IReelConfig | null;
  lineConfig: ILineConfig | null;
  hookConfig: IHookConfig | null;
  accumRodWear: number;
  accumReelWear: number;
  castDistanceM: number;
  activeBaitId: string;
  lakeId: string;
  lakeName: string;
  trashChance: number;
  waterBoundaryY: number;
  getDepthAt: (nx: number, ny: number) => number;
  isPositionAllowed?: (x: number, y: number) => boolean;
}

export function updateReelingPhase(
  params: IReelingUpdateParams,
  callbacks: ILakeSceneCallbacks,
): IReelingResult {
  const {
    hookedFish,
    playerReeling,
    playerRelaxing,
    deltaTime,
    canvasHeight: H,
    rodConfig,
    reelConfig,
    lineConfig,
    hookConfig,
    castDistanceM,
    activeBaitId,
    lakeId,
    lakeName,
  } = params;

  const tension = TensionSystem.update({
    current: params.tension,
    fishAggression: hookedFish.config.behavior.aggression,
    fishWeight: hookedFish.weight,
    rodMaxWeight: rodConfig?.maxWeight ?? 1,
    reelMaxWeight: reelConfig?.maxWeight ?? 1,
    lineMaxWeight: lineConfig?.maxWeight ?? 1,
    hookMaxWeight: hookConfig?.maxWeight ?? 1,
    hookQuality: hookConfig?.quality ?? 0.1,
    timeHooked: hookedFish.stateTimer,
    playerReeling,
    playerRelaxing,
    deltaTime,
  });

  callbacks.onTensionChange(
    tension.value,
    tension.isBroken,
    tension.isOverloaded,
    tension.escapeProgress,
  );

  const wearMulti = 1.0 + tension.value * GEAR_WEAR.tensionWearMultiplier;
  const dtSec = deltaTime;
  let accumRodWear =
    params.accumRodWear + dtSec * GEAR_WEAR.rodWearPerSecond * wearMulti;
  let accumReelWear =
    params.accumReelWear +
    dtSec *
      (playerReeling ? GEAR_WEAR.reelWearReeling : GEAR_WEAR.reelWearIdle) *
      wearMulti;

  if (
    accumRodWear >= GEAR_WEAR.wearFlushThreshold ||
    accumReelWear >= GEAR_WEAR.wearFlushThreshold
  ) {
    callbacks.onGearDamaged?.(accumRodWear, accumReelWear);
    accumRodWear = 0;
    accumReelWear = 0;
  }

  if (tension.isBroken) {
    if (accumRodWear > 0 || accumReelWear > 0) {
      callbacks.onGearDamaged?.(accumRodWear, accumReelWear);
      accumRodWear = 0;
      accumReelWear = 0;
    }

    if (tension.brokenGearType === 'rod' || tension.brokenGearType === 'reel') {
      callbacks.onGearBroke(tension.brokenGearType);
    } else {
      const lostMeters = Math.max(
        1,
        Math.floor(1 + Math.random() * (castDistanceM - 1)),
      );
      callbacks.onLineBroke(
        lostMeters,
        tension.brokenGearType as 'line' | 'hook',
      );
    }
    return {
      tension,
      accumRodWear,
      accumReelWear,
      hookX: hookedFish.position.x,
      hookY: hookedFish.position.y,
      newPhase: 'broken',
      catchResult: null,
    };
  }

  if (tension.isEscaped) {
    return {
      tension,
      accumRodWear,
      accumReelWear,
      hookX: hookedFish.position.x,
      hookY: hookedFish.position.y,
      newPhase: 'escaped',
      catchResult: null,
    };
  }

  if (playerReeling) {
    const gearMaxWeight = Math.min(
      rodConfig?.maxWeight ?? 1,
      reelConfig?.maxWeight ?? 1,
    );
    pullFishToShore(
      hookedFish,
      hookedFish.position.x,
      H,
      reelConfig?.speed ?? 1.0,
      gearMaxWeight,
      deltaTime,
      params.getDepthAt,
      params.waterBoundaryY * H,
      params.canvasWidth,
    );
    hookedFish.combatTimer = 0;
  } else {
    applyFishAutonomousMovement(
      hookedFish,
      deltaTime,
      params.canvasWidth,
      H,
      params.waterBoundaryY,
      params.isPositionAllowed,
    );

    const waterHeight = Math.max(1, H * (1 - params.waterBoundaryY));
    const nx = Math.max(
      0,
      Math.min(1, hookedFish.position.x / params.canvasWidth),
    );
    const ny = Math.max(
      0,
      Math.min(
        1,
        (hookedFish.position.y - H * params.waterBoundaryY) / waterHeight,
      ),
    );
    hookedFish.depth = params.getDepthAt(nx, ny);
  }

  const hookX = hookedFish.position.x;
  const hookY = hookedFish.position.y;

  const scale = H / REELING_PHYSICS.referenceHeight;
  const isAtShore =
    H - hookY <= Math.max(10 * scale, REELING_PHYSICS.shoreBoundaryPx);

  if (isAtShore && playerReeling) {
    let method: RigTypeType = 'float';

    if (hookConfig?.rigType) {
      method = hookConfig.rigType;
    } else if (rodConfig?.rodCategory) {
      method = rodConfig.rodCategory.toLowerCase() as RigTypeType;
    }

    const result = generateCatch(
      hookedFish.config,
      hookedFish.weight,
      activeBaitId,
      method,
      lakeId,
      lakeName,
      hookedFish.isTrash,
    );

    return {
      tension,
      accumRodWear,
      accumReelWear,
      hookX,
      hookY,
      newPhase: 'caught',
      catchResult: result,
    };
  }

  return {
    tension,
    accumRodWear,
    accumReelWear,
    hookX,
    hookY,
    newPhase: null,
    catchResult: null,
  };
}
