/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BITE DETECTION & INTEREST CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const BITE_DETECTION = {
  /** Vertical gap penalty factor */
  verticalGapPenaltyFactor: 1.0,

  /** Chance for a predator to strike a spinning lure instantly vs starting a follow phase */
  spinningImmediateBiteChance: 0.15,

  /**
   * Probability of an actual hook-up when the "direct bite" action branch fires
   * and there is NO established potentialBiter yet.
   * Keeps early bites rare because the action itself already has a low probability.
   */
  directBiteChance: 0.25,

  /**
   * Ratio of nibble-to-bite when a "something happens" roll succeeds.
   * actionRoll < nibbleMultiplier / (nibbleMultiplier + 1) → nibble.
   * At 2.5: ~71% nibble, ~29% bite branch.
   */
  nibbleMultiplier: 2.5,

  /**
   * Passive bite probability multiplier for feeder rig.
   * Encourages using feeder over float for stationary fishing.
   */
  feederBiteMultiplier: 1.15,
} as const;

export const INTEREST_RATES = {
  /** Spinning-specific multipliers */
  spinning: {
    /** Speed levels: 1=slow, 2=normal, 3=fast */
    speedMultipliers: {
      slow: 0.6,
      normal: 1.0,
      fast: 1.6,
    },
  },
} as const;

export const EARLY_HOOK = {
  /** Minimum interest for an early strike to be possible */
  minInterest: 0.35,
  /** Multiplier: earlyStrikeChance = (interest - minInterest) * multiplier */
  chanceMultiplier: 1.5,
} as const;

export const FISH_AI = {
  /** Bite timeout: base + random * range (seconds) – fish gives up if not hooked */
  biteTimeoutBase: 3.0,
  biteTimeoutRange: 7.0,

  /** Fish struggle aggression multipliers for tension: aggression * Weight + Base */
  struggleAggressionWeight: 0.8,
  struggleAggressionBase: 0.2,
} as const;
