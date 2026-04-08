/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GAMEPLAY BALANCE CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Central place for ALL gameplay balance multipliers and tuning variables.
 * Tweak these values to adjust difficulty, fish AI, reeling, tension, etc.
 * without hunting through individual game classes.
 */

// ─── FISH AI & MOVEMENT ─────────────────────────────────────────────────────

export const FISH_AI = {
  /** Base speed multiplier applied to fish.config.behavior.mobility */
  baseSpeedMultiplier: 0.4,

  /** Maximum steering force (scaled by deltaTime) */
  maxSteeringForce: 0.18,

  /** Velocity damping (applied per tick, normalized to 60fps) */
  velocityDamping: 0.9,

  /** Max velocity multiplier relative to current speed */
  maxVelocityMultiplier: 2.0,

  /** Wander noise influence on angle change */
  wanderAngleNoise: 0.05,

  /** Initial velocity random spread on spawn */
  spawnVelocitySpread: 0.4,

  /** Initial energy on spawn: energyBase + random * energyRandom */
  energyBase: 0.7,
  energyRandom: 0.3,

  /** Bite strategy: probability of "direct" strategy (rest = "playful") */
  directBiteChance: 0.45,

  /** Bite timeout: base + random * range (seconds) — fish gives up if not hooked */
  biteTimeoutBase: 3.0,
  biteTimeoutRange: 4.5,

  /** Migration timer: base + random * range (seconds between long-distance swims) */
  migrationTimerBase: 10,
  migrationTimerRange: 25,

  /** Migration retry interval when destination has bad depth */
  migrationRetryInterval: 5.0,

  /** Distance threshold (in scaled pixels) to consider migration target reached */
  migrationArrivalDist: 35,

  /** Migration speed multiplier on top of idle speed */
  migrationSpeedMultiplier: 1.8,

  /** Migration depth tolerance (meters) for accepting a destination */
  migrationDepthTolerance: 0.15,

  /** Rest timer: base + random * range (seconds) */
  restTimerBase: 15,
  restTimerRange: 25,

  /** Rest duration: base + random * range (seconds) */
  restDurationBase: 3,
  restDurationRange: 7,

  /** Interest level threshold to interrupt rest */
  restInterruptInterest: 15,

  /** Depth bias comfort tolerance (meters) before seeking new depth */
  depthBiasComfortTolerance: 0.1,

  /** Depth bias steering force strength */
  depthBiasForceStrength: 0.25,

  /** Speed boost when very uncomfortable (far from preferred depth) */
  depthDiscomfortSpeedBoost: 1.15,

  /** Discomfort threshold (meters) to trigger speed boost */
  depthDiscomfortThreshold: 0.25,

  /** Boundary repulsion margin (pixels) */
  boundaryRepulsionMargin: 60,

  /** Wander noise speed multiplier */
  noiseSpeed: 0.4,
  /** Velocity damping during rest (0–1, lower = more reduction) */
  restDamping: 0.5,
  /** Migration steering force power */
  migrationForce: 2.0,
  /** Global depth bias force multiplier (idle only) */
  idleDepthBiasForce: 3.0,

  /** Fish struggle aggression multipliers for tension: aggression * Weight + Base */
  struggleAggressionWeight: 0.8,
  struggleAggressionBase: 0.2,

  /** Separation (repulsion) between fish to prevent clustering */
  separation: {
    /** Radius (pixels) for separation force to kick in */
    radius: 45,
    /** Force strength of separation */
    forceMultiplier: 0.2,
  },

  /** Frequency of surface indicators (ripples/bubbles) for fish groups */
  surfaceRippleChance: 0.00018,
} as const;

// ─── FISH STATE-SPECIFIC SPEEDS ──────────────────────────────────────────────

export const FISH_STATE_SPEEDS = {
  /** Idle state speed = mobility * idleMultiplier * idleScale */
  idle: {
    multiplier: 0.7,
    scale: 0.33,
  },

  /** Interested state speed factors */
  interested: {
    baseSpeed: 1.5,
    interestSpeedBonus: 1.0,
    scale: 0.3,
    /** Interest bonus to acceleration = 1.0 + interestLevel * interestBonus */
    interestBonus: 3.5,
    /** Force weight of attraction component */
    attractionForce: 3.5,
    depthBiasWeight: 0.5,
    closeDist: 30,
    wanderCloseMultiplier: 0.02,
    wanderFarMultiplier: 0.15,
  },

  /** Biting state speed factors */
  biting: {
    multiplier: 0.4,
    wanderForceX: 3.5,
    wanderForceY: 2.0,
  },

  /** Hooked state speed factors */
  hooked: {
    /** Flee direction force */
    fleeForce: 0.35,
    wanderForce: 1.0,
    verticalWanderForce: 0.25,
    verticalBias: -0.05,
    /** Speed when player is reeling */
    reelingSpeedMultiplier: 0.05,
    /** Speed when player is NOT reeling (fish tries to escape) */
    freeSpeedMultiplier: 0.7,
  },

  /** Escaping state speed factors */
  escaping: {
    fleeForce: 5.0,
    verticalFleeForce: 3.5,
    wanderForce: 1.0,
    speedMultiplier: 1.6,
    /** After this many seconds of escape, return to idle */
    returnToIdleAfter: 5.0,
  },
} as const;

// ─── CAST SPLASH RESPONSE ────────────────────────────────────────────────────

export const CAST_SPLASH = {
  /** Duration (seconds) of splash influence on fish */
  duration: 2.5,

  /** Radius (pixels, pre-scale) for splash influence */
  radius: 50,

  /** Fear threshold — fish with fear <= this are "predatory" */
  predatorFearThreshold: 0.4,

  /** Predator attraction force multiplier */
  predatorAttractionForce: 0.4,
  /** Predator speed boost during splash */
  predatorSpeedBoost: 1.1,

  /** Prey repulsion force multiplier */
  preyRepulsionForce: 1.0,
  /** Prey speed boost during splash */
  preySpeedBoost: 1.2,

  /** Predator interest (curiosity) chance on splash */
  predatorInterestChance: 0.3,

  /** Avoidance force weight */
  avoidanceWeight: 1.5,
} as const;

// ─── BITE DETECTION ──────────────────────────────────────────────────────────

export const BITE_DETECTION = {
  /**he effect of time on fish*/
  minTimeScoreForInterest: 0.25,

  /** Chance of a bite at a dead hour */
  chanceOfBiteAtDeadHour: 0.3,

  /** Radius (pixels, pre-scale) for fish to notice the bait/lure */
  attractRadiusPx: 40,

  /** Radius (pixels, pre-scale) for a bite to occur */
  biteRadiusPx: 10,

  /** Spinning predator vision radius (overrides attractRadiusPx for predators) */
  spinningPredatorVisionPx: 40,

  /** Depth penalty multiplier (how harshly out-of-range depth is penalized) */
  depthPenaltyFactor: 1.8,

  /** Vertical gap penalty factor */
  verticalGapPenaltyFactor: 1.67,

  /** Minimum depth score to trigger interest */
  minDepthScoreForInterest: 0.2,

  /** Minimum verticalGap score */
  minVerticalGapScore: 0.1,

  /** Chance per tick for fish to become interested (normalized to 60fps) */
  attractChanceFloat: 0.15,
  /** Chance per tick for predators (normalized to 60fps) */
  attractChanceSpinningPredator: 0.2,
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

// ─── INTEREST FILL RATE ──────────────────────────────────────────────────────

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
  magnetThreshold: 0.75,
  /** Magnet bonus fill rate */
  magnetRate: 0.012,

  /** Max interest timer: if fish is interested for longer than this (seconds), give up */
  maxInterestDuration: 18,

  /** Max distance to remain interested (float/feeder, pre-scale) */
  maxInterestDistFloat: 110,
  /** Max distance for spinning predators (pre-scale) */
  maxInterestDistSpinningPredator: 80,

  /** Spinning-specific multipliers */
  spinning: {
    /** Passive focus: fish on bottom = decay */
    passiveFocusOnBottom: -0.4,
    /** Passive focus: fish in water = 1.0 * depthScore * verticalGapScore */
    passiveFocusInWater: 1.0,
    /** Active attraction when moving */
    activeAttractMoving: 8.0,
    /** Active decay when NOT moving */
    activeAttractIdle: -2.0,
    /** Retrieval technique bonuses by time/weather */
    techniques: {
      steady: {
        time: { dawn: 1.1, day: 1.0, dusk: 1.1, night: 0.9 },
        weather: { clear: 1.0, cloudy: 1.05, rain: 1.15 },
      },
      'stop-and-go': {
        time: { dawn: 1.0, day: 1.1, dusk: 1.0, night: 1.2 },
        weather: { clear: 1.1, cloudy: 1.1, rain: 1.0 },
      },
      jigging: {
        time: { dawn: 1.15, day: 0.9, dusk: 1.2, night: 1.1 },
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
        time: { dawn: 1.2, day: 0.8, dusk: 1.1, night: 1.3 },
        weather: { clear: 0.9, cloudy: 1.1, rain: 1.4 },
      },
      normal: {
        time: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        weather: { clear: 1.0, cloudy: 1.0, rain: 1.0 },
      },
      fast: {
        time: { dawn: 0.8, day: 1.2, dusk: 0.9, night: 0.6 },
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

// ─── NIBBLE / STRIKE CHANCES ─────────────────────────────────────────────────

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

// ─── ATTRACTION FORCE (SteeringForces) ───────────────────────────────────────

export const ATTRACTION = {
  /** Groundbait attraction range base (pixels, pre-scale, divided by distance) */
  baseAttractionRange: 25,

  /** Jitter threshold: interestLevel above which tugging jitter kicks in */
  jitterInterestThreshold: 0.7,
  /** Max distance for jitter to apply */
  jitterMaxDist: 40,
  /** Jitter amplitude multiplier */
  jitterAmplitude: 15.0,

  /** Obstacle avoidance extra margin (pixels) */
  obstacleAvoidanceExtraMargin: 36,
} as const;

// ─── REELING PHYSICS ─────────────────────────────────────────────────────────

export const REELING_PHYSICS = {
  /** Base pull force when reeling a hooked fish */
  basePull: 3.8,

  /** Fish resistance multiplier: resistance = energy * stamina * maxWeight * resistanceFactor */
  resistanceFactor: 0.72,

  /** Maximum line slip (negative = line goes out) */
  maxSlipBase: -0.15,
  maxSlipReelBonus: 1.1,

  /** Weight penalty: sqrt(maxWeight) * weightPenaltyFactor */
  weightPenaltyFactor: 1.25,

  /** Pixels-per-second base scale */
  pullSpeedScale: 105.0,

  /** Shore detection: fish is "landed" when within this many pixels of bottom */
  shoreBoundaryPx: 4,
} as const;

// ─── TENSION SYSTEM ──────────────────────────────────────────────────────────

export const TENSION = {
  /** Fish base force normalizer (divides weight to normalize force) */
  forceNormalizer: 32,

  /** Fish's minimum force when exhausted */
  exhaustedForceFloor: 0.1,

  /** Tension build rate while reeling a fighting fish */
  reelingFightingRate: 0.75,
  /** Extra base tension added while reeling + fighting */
  reelingFightingBase: 0.7,

  /** Tension build rate while reeling a tired fish */
  reelingTiredRate: 0.65,
  /** Extra base tension for tired-but-still-moving fish */
  reelingTiredBase: 0.35,
  /** Tired fish force multiplier */
  reelingTiredForceMultiplier: 0.45,

  /** Tension drop rate when player is relaxing */
  relaxRate: 2.2,

  /** Idle rod: tension build rate from fighting fish */
  idleFightingRate: 0.3,
  /** Idle rod: tension drop rate from tired fish */
  idleTiredDropRate: 0.5,

  /** Gear overload probability (line stronger than rod → rod breaks) */
  gearOverloadChance: 0.15,
  /** Gear overload ratio threshold: lineStrength > gearLimit * this */
  gearOverloadRatio: 1.3,

  /** Escape progress: accumulation rate per second (inactive) — target ~8s to escape */
  escapeAccumulationRate: 15.0,
  /** Escape progress: reset rate per second (active interaction) */
  escapeResetRate: 350.0,
  /** Escape progress: minimum inactive time before accumulation starts (seconds) */
  escapeGracePeriod: 0.8,
  /** Escape threshold */
  escapeThreshold: 100,
} as const;

// ─── FISH ENERGY DRAIN ───────────────────────────────────────────────────────

export const ENERGY_DRAIN = {
  /** Base energy drain per second (fish tires out over time) */
  baseDrainPerSecond: 1.5,

  /** Reeling multiplier — how much faster fish tires when being reeled */
  reelingDrainMultiplier: 2.2,
} as const;

// ─── GEAR WEAR ───────────────────────────────────────────────────────────────

export const GEAR_WEAR = {
  /** Base rod wear per second */
  rodWearPerSecond: 0.012,

  /** Reel wear per second when reeling */
  reelWearReeling: 0.025,
  /** Reel wear per second when idle */
  reelWearIdle: 0.002,

  /** Tension multiplier for wear: 1.0 + tension * tensionWearMultiplier */
  tensionWearMultiplier: 4.5,

  /** Threshold to flush accumulated wear to UI */
  wearFlushThreshold: 0.3,
} as const;

// ─── HOOK QUALITY ────────────────────────────────────────────────────────────

export const HOOK_QUALITY = {
  /** Minimum hookChance at quality 0 */
  baseHookChance: 0.82,
  /** Additional hookChance scaled by quality (0 → 1.0) */
  qualityBonus: 0.18,
} as const;

// ─── EARLY HOOK (player tries to hook before fish bites) ─────────────────────

export const EARLY_HOOK = {
  /** Minimum interest for an early strike to be possible */
  minInterest: 0.35,
  /** Multiplier: earlyStrikeChance = (interest - minInterest) * multiplier */
  chanceMultiplier: 1.5,
} as const;

// ─── CATCH RESULT ────────────────────────────────────────────────────────────

export const CATCH_RESULT = {
  /** Weight distribution power: higher = more small fish, rarer trophies */
  weightDistributionPower: 4.5,

  /** Length calculation: length = max(minLength, weight * lengthPerKg + random * lengthJitter) */
  minLength: 5,
  lengthPerKg: 20,
  lengthJitter: 10,

  /** Trash item IDs */
  trashItems: ['old_boot', 'rusty_can', 'tangled_line', 'driftwood'],
} as const;

// ─── SNAG MECHANICS ──────────────────────────────────────────────────────────

export const SNAG = {
  /** Spinning snag: accumulation speed when dragging on the bottom */
  spinningAccumulationRate: 1.5,
  /** Spinning snag: seconds of dragging before snag rolls start */
  spinningSnagGracePeriod: 3.0,
  /** Spinning snag: probability multiplier (per tick, normalized) */
  spinningSnagProbMultiplier: 0.005,
  /** Spinning snag: decay rate when not dragging */
  spinningDecayRate: 0.5,

  /** Static snag chance for float rig on bottom */
  floatOnBottomSnagChance: 0.15,
  /** Static snag chance for feeder rig on bottom */
  feederOnBottomSnagChance: 0.03,
} as const;

// ─── SPINNING LURE PHYSICS ──────────────────────────────────────────────────

export const SPINNING_LURE = {
  /** Shore boundary: fraction of canvas height (lure stops here) */
  shoreBoundaryFraction: 0.96,

  /** Wobbler dive speed when reeling (depth per second multiplier) */
  wobblerDiveSpeed: 0.6,
  /** Wobbler float speed when idle (depth per second) */
  wobblerFloatSpeed: 0.075,

  /** Vibrotail sink speed when idle (depth per second) */
  vibrotailSinkSpeed: 0.25,

  /** Spoon sink speed when idle (depth per second) */
  spoonSinkSpeed: 0.3,

  /** General rise speed when reeling (non-wobbler, depth per second multiplier) */
  generalRiseSpeed: 1.3,

  /** Minimum depth (meters) */
  minDepth: 0.1,

  /** Reeling pull speed multiplier (visual movement) */
  reelingPullSpeedBase: 70,
} as const;

// ─── TIME SYSTEM ─────────────────────────────────────────────────────────────

export const TIME_SYSTEM = {
  /** Game time speed multiplier: 1 real second = this many game seconds */
  gameTimeSpeedMultiplier: 20,

  /** Starting hour for game time (24h format) */
  gameStartHour: 8,

  /** Time-of-day boundaries (24h format) */
  morningStart: 5,
  dayStart: 10,
  eveningStart: 18,
  nightStart: 21,
} as const;

// ─── FISH SPAWN ──────────────────────────────────────────────────────────────

export const FISH_SPAWN = {
  /** Fraction of maxFishCount spawned initially */
  initialSpawnFraction: 0.7,

  /** Spawn depth tolerance (additional meters beyond preferred range) */
  spawnDepthTolerance: 0.3,

  /** Max spawn placement attempts per fish */
  maxSpawnAttempts: 30,
} as const;

// ─── SCENE TIMING & DELAYS ──────────────────────────────────────────────────

export const SCENE_TIMING = {
  /** Auto-reset delay after escaped/broken phase (ms) */
  escapedResetDelay: 2000,
  brokenResetDelay: 2500,
  /** Auto-reset delay after caught fish */
  caughtResetDelay: 2000,

  /** Cast water-boundary margin (fraction) */
  castWaterMargin: 0.015,

  /** Bottom detection tolerance (meters) */
  bottomDetectionTolerance: 0.05,
} as const;

// ─── RESOLUTION & SCALING ──────────────────────────────────────────────────

export const GLOBAL_CONSTANTS = {
  /** Base height used for scaling calculations */
  baseHeight: 800,
  /** Base width used for scaling calculations */
  baseWidth: 1200,
} as const;
