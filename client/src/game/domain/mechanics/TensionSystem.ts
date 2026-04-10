import type { ITensionState, ITensionUpdateParams } from '@/common/types';

import { TENSION, FISH_AI } from '@/common/configs/game';

export class TensionSystem {
  static update(params: ITensionUpdateParams): ITensionState {
    const dtSec = params.deltaTime / 60; // Convert Pixi scalar (~1.0 @ 60fps) to seconds
    let tension = params.current.value;

    const gears = [
      { type: 'line' as const, maxWeight: params.lineMaxWeight },
      { type: 'hook' as const, maxWeight: params.hookMaxWeight },
      { type: 'reel' as const, maxWeight: params.reelMaxWeight },
      { type: 'rod' as const, maxWeight: params.rodMaxWeight },
    ];
    // Sort gears ascending by their maxWeight capacity
    gears.sort((a, b) => a.maxWeight - b.maxWeight);

    const tensionCap = 1.0;
    let gearToBreak: 'rod' | 'reel' | 'line' | 'hook' | null = null;

    // Check if any gear would break if fully stressed (1.0 tension)
    for (const gear of gears) {
      // if fish is more than 15% heavier than the gear's max capacity
      if (params.fishWeight > gear.maxWeight * 1.15) {
        gearToBreak = gear.type;
        break; // The weakest gear that can break is the one that goes first
      }
    }

    // If no gear is "oversized" by the fish, the weakest gear (usually line)
    // will still break if the player reaches 1.0 tension.
    if (!gearToBreak) {
      gearToBreak = gears[0].type;
    }

    const tackleMaxWeight = gears[0].maxWeight; // weakest gear
    const tackleStrength = Math.max(0.01, tackleMaxWeight / 60); // mapping back to old 0.1-1.0 scale roughly

    // Struggle force of the fish: aggressive fish exert more force, heavier fish exert more absolute force
    const baseForce =
      params.fishWeight *
      (params.fishAggression * FISH_AI.struggleAggressionWeight +
        FISH_AI.struggleAggressionBase);

    // Normalized force depends on how weak the tackle is.
    const normalizedForce =
      baseForce / TENSION.forceNormalizer / tackleStrength;

    if (params.playerReeling) {
      // Single unified tension formula — no fighting/tired distinction
      tension +=
        (normalizedForce + TENSION.reelingBase) * dtSec * TENSION.reelingRate;
    } else if (params.playerRelaxing) {
      // Quickly drop tension, giving fish a chance to run
      tension -= dtSec * TENSION.relaxRate;
    } else {
      // Idle rod - tension drops naturally as line is NOT being reeled in.
      // This allows the player to "wait out" a fighting fish safely by just letting go of the button.
      tension -= dtSec * TENSION.idleTiredDropRate;
    }

    tension = Math.max(0, tension);

    if (tension >= tensionCap) {
      if (gearToBreak) {
        // Gear actually snaps
        return {
          ...params.current,
          value: 1.0,
          isBroken: true,
          brokenGearType: gearToBreak,
          isOverloaded: gearToBreak === 'rod' || gearToBreak === 'reel',
        };
      } else {
        // Just cap tension
        tension = tensionCap;
      }
    }

    // Escape Logic
    let escapeProgress = params.current.escapeProgress || 0;

    // Inactivity penalty: Fish shakes off the hook if the player doesn't interact (reel/relax)
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
      escapeProgress,
    };
  }
}
