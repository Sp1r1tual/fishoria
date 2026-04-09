/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WORLD & SYSTEM CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════
 */

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

export const HOOK_QUALITY = {
  /** Minimum hookChance at quality 0 */
  baseHookChance: 0.82,
  /** Additional hookChance scaled by quality (0 → 1.0) */
  qualityBonus: 0.18,
} as const;

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

export const FISH_SPAWN = {
  /** Fraction of maxFishCount spawned initially */
  initialSpawnFraction: 0.7,

  /** Spawn depth tolerance (additional meters beyond preferred range) */
  spawnDepthTolerance: 0.3,

  /** Max spawn placement attempts per fish */
  maxSpawnAttempts: 30,
} as const;

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

export const GLOBAL_CONSTANTS = {
  /** Base height used for scaling calculations */
  baseHeight: 800,
  /** Base width used for scaling calculations */
  baseWidth: 1200,
} as const;
