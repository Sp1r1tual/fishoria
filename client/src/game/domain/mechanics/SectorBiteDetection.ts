import type {
  TimeOfDayType,
  WeatherType,
  RigTypeType,
  BaitTypeType,
  LureTypeType,
  IGroundbaitConfig,
} from '@/common/types';
import type { SectorSystem } from '@/game/engine/systems/SectorSystem';

import { LureFollower } from './LureFollower';

import { FISH_SPECIES, BITE_DETECTION } from '@/common/configs/game';

interface ISectorBiteParams {
  sectorSystem: SectorSystem;
  follower: LureFollower | null;
  baitType: BaitTypeType;
  hookPixelX: number;
  hookPixelY: number;
  canvasWidth: number;
  canvasHeight: number;
  waterBoundaryY: number;
  timeOfDay: TimeOfDayType;
  weather: WeatherType;
  deltaTime: number;
  hookDepthM: number;
  rigType?: RigTypeType;
  isMoving: boolean;
  isOnBottom: boolean;
  retrieveType: string;
  activeGroundbait: IGroundbaitConfig | null;
  getPreferredDepthRange: (speciesId: string) => { min: number; max: number };
  hasPotentialBiter?: boolean;
  potentialBiterSpeciesId?: string | null;
}

interface ISectorBiteResult {
  biteSpeciesId: string | null;
  newFollower: LureFollower | null;
  progress: number;
  progressSpeciesId: string | null;
}

export function detectSectorBite(params: ISectorBiteParams): ISectorBiteResult {
  const nx = params.hookPixelX / params.canvasWidth;
  const ny = params.hookPixelY / params.canvasHeight;

  const sector = params.sectorSystem.getSectorAt(nx, ny);
  if (!sector)
    return {
      biteSpeciesId: null,
      newFollower: params.follower,
      progress: 0,
      progressSpeciesId: null,
    };

  const dtSec = params.deltaTime / 60;
  let activeFollower = params.follower;

  if (activeFollower) {
    activeFollower.update(params.deltaTime, params.isMoving, true);
    if (activeFollower.state === 'attacking') {
      return {
        biteSpeciesId: activeFollower.speciesId,
        newFollower: null,
        progress: 1,
        progressSpeciesId: activeFollower.speciesId,
      };
    }
    if (activeFollower.state === 'lost') {
      activeFollower = null;
    }
    return {
      biteSpeciesId: null,
      newFollower: activeFollower,
      progress: activeFollower?.interest ?? 0,
      progressSpeciesId: activeFollower?.speciesId ?? null,
    };
  }

  let maxProgress = 0;
  let progressSpeciesId: string | null = null;
  const isSpinning = params.rigType === 'spinning';
  const speciesList = Object.entries(sector.availability);
  if (params.potentialBiterSpeciesId) {
    const pId = params.potentialBiterSpeciesId;
    const pEntry = speciesList.find(([id]) => id === pId);
    if (pEntry) {
      const idx = speciesList.indexOf(pEntry);
      speciesList.splice(idx, 1);
      speciesList.unshift(pEntry);
    }
  }

  for (const [speciesId, baseAvailability] of speciesList) {
    if (baseAvailability < 0.01) continue;

    const config = FISH_SPECIES[speciesId];
    if (!config) continue;

    const depthRange = params.getPreferredDepthRange(speciesId);
    const minD = depthRange.min;
    const maxD = depthRange.max;
    let depthScore =
      params.hookDepthM >= minD && params.hookDepthM <= maxD ? 1.0 : 0.0;

    if (depthScore === 0) {
      const gap = Math.min(
        Math.abs(params.hookDepthM - minD),
        Math.abs(params.hookDepthM - maxD),
      );
      depthScore = Math.max(
        0,
        1 - gap * BITE_DETECTION.verticalGapPenaltyFactor,
      );
    }
    if (depthScore < 0.1) continue;

    let lureTypeMultiplier = 1.0;
    if (isSpinning) {
      const lureType = params.baitType.replace('lure_', '') as LureTypeType;
      lureTypeMultiplier = config.lureMultipliers?.[lureType] ?? 1.0;
    }

    const baitScore = isSpinning
      ? config.isPredator
        ? 1.0 * lureTypeMultiplier
        : 0.0
      : config.preferredBaits.includes(params.baitType)
        ? 1.0
        : 0.0;

    if (baitScore <= 0) continue;

    const timeScore = config.activityByTimeOfDay[params.timeOfDay] ?? 0.5;
    const weatherScore = config.activityByWeather[params.weather] ?? 1.0;

    let groundbaitMultiplier = 1.0;
    if (params.activeGroundbait) {
      const g = params.activeGroundbait;
      if (g.fishedSpeciesMultiplier && g.fishedSpeciesMultiplier[speciesId]) {
        groundbaitMultiplier = g.fishedSpeciesMultiplier[speciesId];
      } else {
        groundbaitMultiplier = 1.0;
      }
    }

    const baseChance =
      baseAvailability *
      depthScore *
      timeScore *
      weatherScore *
      baitScore *
      groundbaitMultiplier;

    if (isSpinning) {
      if (params.isMoving && Math.random() < baseChance * dtSec * 20.0) {
        const isImmediateBite = Math.random() < 0.3;
        if (isImmediateBite) {
          return {
            biteSpeciesId: speciesId,
            newFollower: null,
            progress: 1,
            progressSpeciesId: speciesId,
          };
        }
        activeFollower = new LureFollower(speciesId, 0.1 + Math.random() * 0.2);
        break;
      }
    } else {
      const nibbleChancePerSec = baseChance * 5.0;
      if (Math.random() < nibbleChancePerSec * dtSec) {
        const p = 0.3 + Math.random() * 0.5;
        if (p > maxProgress) {
          maxProgress = p;
          progressSpeciesId = speciesId;
        }
      }

      let biteChancePerSec = baseChance;

      if (params.potentialBiterSpeciesId === speciesId) {
        biteChancePerSec *= 10.0;
      } else if (params.hasPotentialBiter) {
        biteChancePerSec *= 0.1;
      }

      const depthRange = params.getPreferredDepthRange(speciesId);
      if (params.isOnBottom && depthRange.min < params.hookDepthM - 1) {
        biteChancePerSec *= 0.1;
      }

      if (Math.random() < biteChancePerSec * dtSec) {
        return {
          biteSpeciesId: speciesId,
          newFollower: null,
          progress: 1,
          progressSpeciesId: speciesId,
        };
      }
    }
  }

  return {
    biteSpeciesId: null,
    newFollower: activeFollower,
    progress: maxProgress,
    progressSpeciesId,
  };
}
