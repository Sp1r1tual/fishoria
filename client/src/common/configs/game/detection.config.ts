/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BITE DETECTION & INTEREST CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const BITE_DETECTION = {
  /** Vertical gap penalty factor */
  verticalGapPenaltyFactor: 2.5,

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
  feederBiteMultiplier: 1.05,

  /**
   * Active bite probability multiplier for spinning rig.
   */
  spinningBiteMultiplier: 1.1,

  /** Base progress added for a nibble */
  nibbleProgressBase: 0.3,
  /** Random extra progress added for a nibble */
  nibbleProgressRange: 0.5,

  /** Multiplier for bite chance if this fish was already the potential biter */
  potentialBiterMatchMultiplier: 4.0,
  /** Penalty multiplier for bite chance if another fish was the potential biter */
  potentialBiterMismatchMultiplier: 0.15,
  /** Penalty multiplier if fishing on the bottom but it's deeper than preferred */
  outOfRangeBottomPenalty: 0.1,

  /** Base progress added for an alternative bite phase */
  altProgressBase: 0.4,
  /** Random extra progress added for an alternative bite phase */
  altProgressRange: 0.4,
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

    follower: {
      /** Thresholds for continuous reeling (seconds) */
      shortMoveThreshold: 0.25,
      longMoveThreshold: 1.4,

      /** Interest adjustments for continuous reeling (per second) */
      shortMovePenalty: 0.15,
      longMovePenalty: 0.85,
      goodMoveBonus: 0.32,

      /** Thresholds for stop-and-go pauses (seconds) */
      shortPauseThreshold: 0.8,
      longPauseThreshold: 1.6,

      /** Interest adjustments for stop-and-go pauses (per second) */
      goodPauseBonus: 0.05,
      longPausePenalty: 1.2,

      /** Decay multiplier for continuous movement time when stopped */
      stopDecayMultiplier: 4.0,

      /** Initial random interest bounds when follower is spawned */
      initialInterestMin: 0.1,
      initialInterestRange: 0.2,
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

export const POPULATION = {
  /** Penalty factor for points shallower than preferred depth */
  lowDepthPenalty: 3.0,
  /** Penalty factor for points deeper than preferred depth */
  highDepthPenalty: 0.8,
} as const;
