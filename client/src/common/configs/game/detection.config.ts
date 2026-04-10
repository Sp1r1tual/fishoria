/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BITE DETECTION & INTEREST CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const BITE_DETECTION = {
  /** The effect of time on fish */
  minTimeScoreForInterest: 0.25,

  /** Chance of a bite at a dead hour */
  chanceOfBiteAtDeadHour: 0.3,

  /** Radius (pixels, pre-scale) for fish to notice the bait/lure */
  attractRadiusPx: 75,

  /** Radius (pixels, pre-scale) for a bite to occur */
  biteRadiusPx: 10,

  /** Spinning predator vision radius (overrides attractRadiusPx for predators) */
  spinningPredatorVisionPx: 110,

  /** Depth penalty multiplier (how harshly out-of-range depth is penalized) */
  depthPenaltyFactor: 2.0,

  /** Vertical gap penalty factor */
  verticalGapPenaltyFactor: 2.09,

  /** Minimum depth score to trigger interest */
  minDepthScoreForInterest: 0.2,

  /** Minimum verticalGap score */
  minVerticalGapScore: 0.1,

  /** Chance per tick for fish to become interested (normalized to 60fps) */
  attractChanceFloat: 0.15,
  /** Chance per tick for predators (normalized to 60fps) */
  attractChanceSpinningPredator: 0.35,
  /** Chance per tick for non-predators (normalized to 60fps) */
  attractChanceSpinningNonPredator: 0.25,

  /** Instant-strike chance (bypasses interest fill) */
  instantStrikeChance: 0.1,
  /** For spinning, min pull count before instant strike */
  spinningMinPullsForInstantStrike: 3,

  /** Splash zone: time window for instant-interest near the cast splash */
  splashZoneTime: 2.0,
  /** Splash zone: radius (pixels, pre-scale) */
  splashZoneRadius: 20,

  /** Grace period before interest starts for float/feeder (seconds since cast) */
  floatGracePeriod: 3.0,
  /** Grace period for spinning casts */
  spinningGracePeriod: 0.2,

  /** Initial interest level when a fish becomes interested */
  initialInterestFloat: 0.15,
  /** Initial interest level for spinning */
  initialInterestSpinning: 0.05,
  /** Extra interest boost from splash zone */
  splashInterestBoost: 0.2,

  /** Penalty for stationary spinning lure */
  stationarySpinningLurePenalty: 0.1,
  /** Chance per tick for a predator to check out stationary lure (normalized) */
  predatorCuriosityChance: 0.1,

  /** Default scores */
  baitScoreDefault: 1.0,
  noBaitScore: 0.0,
  activityScoreDefault: 0.5,
} as const;

export const INTEREST_RATES = {
  /** Base interest fill rate multiplier */
  baseFillRate: 0.12,

  /** Weather bonuses */
  weather: {
    rain: 1.3,
    cloudy: 1.15,
    clear: 1.0,
  },

  /** "Magnet" effect threshold: if interest > this, slowly pull to 100% */
  magnetThreshold: 0.8,
  /** Magnet bonus fill rate */
  magnetRate: 0.012,

  /** Max interest timer: if fish is interested for longer than this (seconds), give up */
  maxInterestDuration: 18,

  /** Max distance to remain interested (float/feeder, pre-scale) */
  maxInterestDistFloat: 140,
  /** Max distance for spinning predators (pre-scale) */
  maxInterestDistSpinningPredator: 180,

  /** Spinning-specific multipliers */
  spinning: {
    /** Passive focus: fish on bottom = decay */
    passiveFocusOnBottom: -0.4,
    /** Passive focus: fish in water = 1.0 * depthScore * verticalGapScore */
    passiveFocusInWater: 1.0,
    /** Active attraction when moving */
    activeAttractMoving: 12.0,
    /** Active decay when NOT moving (sinking) */
    activeAttractIdle: -0.4,
    /** Retrieval technique bonuses by time/weather */
    techniques: {
      steady: {
        time: { morning: 1.1, day: 1.0, evening: 1.1, night: 0.9 },
        weather: { clear: 1.0, cloudy: 1.05, rain: 1.15 },
      },
      'stop-and-go': {
        time: { morning: 1.0, day: 1.1, evening: 1.0, night: 1.2 },
        weather: { clear: 1.1, cloudy: 1.1, rain: 1.0 },
      },
      jigging: {
        time: { morning: 1.15, day: 0.9, evening: 1.2, night: 1.1 },
        weather: { clear: 1.0, cloudy: 1.15, rain: 1.3 },
      },
    },
    /** Speed levels: 1=slow, 2=normal, 3=fast */
    speedMultipliers: {
      slow: 0.6,
      normal: 1.0,
      fast: 1.6,
    },
    /** Retrieval speed bonuses by time/weather */
    speedBonuses: {
      slow: {
        time: { morning: 1.2, day: 0.8, evening: 1.1, night: 1.3 },
        weather: { clear: 0.9, cloudy: 1.1, rain: 1.4 },
      },
      normal: {
        time: { morning: 1.0, day: 1.0, evening: 1.0, night: 1.0 },
        weather: { clear: 1.0, cloudy: 1.0, rain: 1.0 },
      },
      fast: {
        time: { morning: 0.8, day: 1.2, evening: 0.9, night: 0.6 },
        weather: { clear: 1.3, cloudy: 1.1, rain: 0.7 },
      },
    },
  },

  /** Float rig on bottom penalty (multiplier for interest fill rate) */
  floatOnBottomPenalty: 0.35,
  /** Additional predator penalty on float at bottom */
  floatOnBottomPredatorPenalty: 0.6,

  /** Minimum stationary fill rate */
  minStationaryRateNormal: 0.005,
  /** Minimum stationary fill rate for float on bottom */
  minStationaryRateFloatBottom: 0.0005,
} as const;

export const STRIKE_CHANCES = {
  /** Base strike chance (per tick, normalized to 60fps) */
  baseStrikeChance: 0.035,
  /** Base flee chance (per tick, normalized to 60fps) */
  baseFleeChance: 0.001,

  /** Direct bite strategy */
  direct: {
    strikeChance: 0.1,
    fleeChance: 0.005,
    lossChance: 0.005,
  },

  /** Playful bite strategy */
  playful: {
    strikeChance: 0.015,
    fleeChance: 0.0015,
    lossChance: 0.01,
  },

  /** Spinning aggression boost to strike chance */
  spinningAggressionBoost: 3.5,

  /** Float on bottom loss-of-interest chance (per tick, normalized) */
  floatOnBottomLossChance: 0.008,
} as const;

export const EARLY_HOOK = {
  /** Minimum interest for an early strike to be possible */
  minInterest: 0.35,
  /** Multiplier: earlyStrikeChance = (interest - minInterest) * multiplier */
  chanceMultiplier: 1.5,
} as const;
