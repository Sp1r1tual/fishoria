import type { ITensionState, ITensionUpdateParams } from '@/common/types';

import { TENSION, FISH_AI } from '@/common/configs/game';

export class TensionSystem {
  static update(params: ITensionUpdateParams): ITensionState {
    const dtSec = params.deltaTime;
    let tension = params.current.value;

    const gears = [
      { type: 'line' as const, maxWeight: params.lineMaxWeight },
      { type: 'hook' as const, maxWeight: params.hookMaxWeight },
      { type: 'reel' as const, maxWeight: params.reelMaxWeight },
      { type: 'rod' as const, maxWeight: params.rodMaxWeight },
    ];

    gears.sort((a, b) => a.maxWeight - b.maxWeight);

    const tensionCap = 1.0;
    let gearToBreak: 'rod' | 'reel' | 'line' | 'hook' | null = null;

    for (const gear of gears) {
      if (params.fishWeight > gear.maxWeight * TENSION.instantBreakMultiplier) {
        gearToBreak = gear.type;
        break;
      }
    }

    const tackleMaxWeight = gears[0].maxWeight;
    const tackleStrength = Math.max(
      0.01,
      tackleMaxWeight / TENSION.tackleStrengthDivisor,
    );

    const baseForce =
      params.fishWeight *
      (params.fishAggression * FISH_AI.struggleAggressionWeight +
        FISH_AI.struggleAggressionBase);

    const normalizedForce =
      baseForce / TENSION.forceNormalizer / tackleStrength;

    const isOverloaded = params.fishWeight > tackleMaxWeight;

    if (params.playerReeling) {
      let buildRate =
        (normalizedForce + TENSION.reelingBase) * TENSION.reelingRate;

      if (isOverloaded) {
        const overloadRatio = params.fishWeight / tackleMaxWeight;
        buildRate *=
          TENSION.overloadRatioBase +
          overloadRatio * TENSION.overloadRatioScale;
      }

      const maxBuildRate = isOverloaded
        ? TENSION.maxBuildRateOverloaded
        : TENSION.maxBuildRateNormal;
      buildRate = Math.min(buildRate, maxBuildRate);

      tension += buildRate * dtSec;
    } else if (params.playerRelaxing) {
      tension -= dtSec * TENSION.relaxRate;
    } else {
      tension -= dtSec * TENSION.idleTiredDropRate;
    }

    tension = Math.max(0, tension);

    if (tension >= tensionCap) {
      if (gearToBreak) {
        return {
          ...params.current,
          value: 1.0,
          isBroken: true,
          brokenGearType: gearToBreak,
          isOverloaded: true,
        };
      } else {
        tension = tensionCap;
      }
    }

    let escapeProgress = params.current.escapeProgress || 0;

    const isInactive = !params.playerReeling && !params.playerRelaxing;
    if (isInactive && params.timeHooked > TENSION.escapeGracePeriod) {
      escapeProgress += dtSec * TENSION.escapeAccumulationRate;
    } else {
      escapeProgress -= dtSec * TENSION.escapeResetRate;
    }

    escapeProgress = Math.max(
      0,
      Math.min(TENSION.escapeThreshold, escapeProgress),
    );

    if (escapeProgress >= TENSION.escapeThreshold) {
      return {
        ...params.current,
        value: 0,
        isBroken: false,
        isEscaped: true,
        escapeProgress: TENSION.escapeThreshold,
      };
    }

    return {
      ...params.current,
      value: tension,
      isBroken: false,
      isOverloaded,
      escapeProgress,
    };
  }
}
