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
  /** Bite timeout: base + random * range (seconds) — fish gives up if not hooked */
  biteTimeoutBase: 3.0,
  biteTimeoutRange: 7.0,

  /** Fish struggle aggression multipliers for tension: aggression * Weight + Base */
  struggleAggressionWeight: 0.8,
  struggleAggressionBase: 0.2,
} as const;
