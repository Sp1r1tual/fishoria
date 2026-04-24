/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REELING, TENSION & LURE PHYSICS CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const REELING_PHYSICS = {
  /** Weight penalty: Math.pow(maxWeight, 0.6) * weightPenaltyFactor */
  weightPenaltyFactor: 0.85,

  /** Pixels-per-second base scale */
  pullSpeedScale: 110.0,
  /** Absolute minimum pixels-per-second pull guarantee even with terrible gear */
  minPullSpeed: 30.0,
  shoreBoundaryPx: 4,

  /** Side movement speed multiplier during fight */
  sideMovementSpeedMult: 0.7,
  /** Overall autonomous movement speed scale during fight */
  autonomousSpeedScale: 0.8,
} as const;

export const TENSION = {
  /** Fish base force normalizer (divides weight to normalize force) */
  forceNormalizer: 16,

  /** Tension build rate while reeling */
  reelingRate: 0.55,
  /** Base tension added while reeling (minimal mechanical friction) */
  reelingBase: 0.05,

  /** Tension drop rate when player is relaxing */
  relaxRate: 2.2,

  /** Idle rod: tension drop rate from tired fish */
  idleTiredDropRate: 0.5,

  /** Escape progress: accumulation rate per second (inactive) – target ~8s to escape */
  escapeAccumulationRate: 15.0,
  /** Escape progress: reset rate per second (active interaction) */
  escapeResetRate: 350.0,
  /** Escape progress: minimum inactive time before accumulation starts (seconds) */
  escapeGracePeriod: 0.8,
  /** Escape threshold */
  escapeThreshold: 100,
} as const;

export const SNAG = {
  /** Spinning snag: accumulation speed when dragging on the bottom */
  spinningAccumulationRate: 2.5,
  /** Spinning snag: seconds of dragging before snag rolls start */
  spinningSnagGracePeriod: 1.5,
  /** Spinning snag: probability multiplier (per tick, normalized) */
  spinningSnagProbMultiplier: 0.015,
  /** Spinning snag: decay rate when not dragging */
  spinningDecayRate: 0.5,

  /** Static snag chance for float rig on bottom */
  floatOnBottomSnagChance: 0.2,
  /** Static snag chance for feeder rig on bottom */
  feederOnBottomSnagChance: 0.5,
} as const;

export const SPINNING_LURE = {
  /** Shore boundary: fraction of canvas height (lure stops here) */
  shoreBoundaryFraction: 0.99,

  /** Wobbler dive speed when reeling (depth per second multiplier) */
  wobblerDiveSpeed: 0.15,
  /** Wobbler float speed when idle (depth per second) */
  wobblerFloatSpeed: 0.075,

  /** Vibrotail sink speed when idle (depth per second) */
  vibrotailSinkSpeed: 0.25,

  /** Spoon sink speed when idle (depth per second) */
  spoonSinkSpeed: 0.3,

  /** General rise speed when reeling (non-wobbler, depth per second multiplier) */
  generalRiseSpeed: 0.2,

  /** Minimum depth (meters) */
  minDepth: 0.1,

  /** Reeling pull speed multiplier (visual movement) */
  reelingPullSpeedBase: 10,
} as const;
