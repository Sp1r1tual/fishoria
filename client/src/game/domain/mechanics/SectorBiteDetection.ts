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

  const dtSec = params.deltaTime;
  let activeFollower = params.follower;

  if (activeFollower) {
    activeFollower.update(params.deltaTime, params.isMoving);
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

  if (isSpinning) {
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

      const lureType = params.baitType.replace('lure_', '') as LureTypeType;
      const lureTypeMultiplier = config.lureMultipliers?.[lureType] ?? 1.0;
      const baitScore = config.isPredator ? 1.0 * lureTypeMultiplier : 0.0;
      if (baitScore <= 0) continue;

      const timeScore = config.activityByTimeOfDay[params.timeOfDay] ?? 0.5;
      const weatherScore = config.activityByWeather[params.weather] ?? 1.0;

      let groundbaitMultiplier = 1.0;
      if (params.activeGroundbait) {
        const g = params.activeGroundbait;
        if (g.fishedSpeciesMultiplier && g.fishedSpeciesMultiplier[speciesId]) {
          groundbaitMultiplier = g.fishedSpeciesMultiplier[speciesId];
        }
      }

      const baseChance =
        baseAvailability *
        depthScore *
        timeScore *
        weatherScore *
        baitScore *
        groundbaitMultiplier *
        BITE_DETECTION.spinningBiteMultiplier;

      if (baseChance < 0.001) continue;

      if (params.isMoving && Math.random() < baseChance * dtSec) {
        const isImmediateBite =
          Math.random() < BITE_DETECTION.spinningImmediateBiteChance;
        if (isImmediateBite) {
          return {
            biteSpeciesId: speciesId,
            newFollower: null,
            progress: 1,
            progressSpeciesId: speciesId,
          };
        }
        activeFollower = new LureFollower(speciesId);
        break;
      }
    }
  } else {
    interface ISpeciesChance {
      id: string;
      baseChance: number;
    }
    const candidates: ISpeciesChance[] = [];
    let totalBaseChance = 0;

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

      const baitScore = config.preferredBaits.includes(params.baitType)
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
        }
      }

      let rigMultiplier = 1.0;
      if (params.rigType === 'feeder') {
        rigMultiplier = BITE_DETECTION.feederBiteMultiplier;
      }

      const baseChance =
        baseAvailability *
        depthScore *
        timeScore *
        weatherScore *
        baitScore *
        groundbaitMultiplier *
        rigMultiplier;

      if (baseChance >= 0.001) {
        candidates.push({ id: speciesId, baseChance });
        totalBaseChance += baseChance;
      }
    }

    if (totalBaseChance > 0) {
      const nibbleMultiplier = BITE_DETECTION.nibbleMultiplier;

      const totalActionChance = totalBaseChance * dtSec;

      if (Math.random() < totalActionChance) {
        let r = Math.random() * totalBaseChance;
        let selected: ISpeciesChance | null = null;
        for (const c of candidates) {
          r -= c.baseChance;
          if (r <= 0) {
            selected = c;
            break;
          }
        }

        if (selected) {
          const actionRoll = Math.random();
          if (actionRoll < nibbleMultiplier / (nibbleMultiplier + 1.0)) {
            maxProgress =
              BITE_DETECTION.nibbleProgressBase +
              Math.random() * BITE_DETECTION.nibbleProgressRange;
            progressSpeciesId = selected.id;
          } else {
            let biteProb: number = BITE_DETECTION.directBiteChance;
            if (params.potentialBiterSpeciesId === selected.id) {
              biteProb = Math.min(
                1.0,
                biteProb * BITE_DETECTION.potentialBiterMatchMultiplier,
              );
            } else if (params.hasPotentialBiter) {
              biteProb *= BITE_DETECTION.potentialBiterMismatchMultiplier;
            }

            const depthRange = params.getPreferredDepthRange(selected.id);
            if (params.isOnBottom && depthRange.max < params.hookDepthM - 1) {
              biteProb *= BITE_DETECTION.outOfRangeBottomPenalty;
            }

            if (Math.random() < biteProb) {
              return {
                biteSpeciesId: selected.id,
                newFollower: null,
                progress: 1,
                progressSpeciesId: selected.id,
              };
            } else {
              maxProgress =
                BITE_DETECTION.altProgressBase +
                Math.random() * BITE_DETECTION.altProgressRange;
              progressSpeciesId = selected.id;
            }
          }
        }
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
