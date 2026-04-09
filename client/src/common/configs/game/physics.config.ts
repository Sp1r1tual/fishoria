/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REELING, TENSION & LURE PHYSICS CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const ATTRACTION = {
  /** Groundbait attraction range base (pixels, pre-scale, divided by distance) */
  baseAttractionRange: 100,

  /** Jitter threshold: interestLevel above which tugging jitter kicks in */
  jitterInterestThreshold: 0.7,
  /** Max distance for jitter to apply */
  jitterMaxDist: 40,
  /** Jitter amplitude multiplier */
  jitterAmplitude: 15.0,

  /** Obstacle avoidance extra margin (pixels) */
  obstacleAvoidanceExtraMargin: 36,
} as const;

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

export const ENERGY_DRAIN = {
  /** Base energy drain per second (fish tires out over time) */
  baseDrainPerSecond: 1.5,

  /** Reeling multiplier — how much faster fish tires when being reeled */
  reelingDrainMultiplier: 2.2,
} as const;

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
