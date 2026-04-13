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

export const CATCH_RESULT = {
  /** Weight distribution power: lower = more varied weights, higher = more small fish */
  weightDistributionPower: 2.2,

  /** Quality thresholds based on percentage of max weight */
  qualityThresholds: {
    good: 0.4,
    trophy: 0.75,
  },

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
  spawnDepthTolerance: 0.5,

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

export const EXPERIENCE = {
  /** Base XP gained per kilogram of fish caught */
  baseXpPerKg: 25,
} as const;

export const ECONOMY = {
  /** Base price per kilogram of fish sold */
  baseFishPricePerKg: 3,
} as const;

export const GLOBAL_CONSTANTS = {
  /** Base height used for scaling calculations */
  baseHeight: 800,
  /** Base width used for scaling calculations */
  baseWidth: 1200,
} as const;

export const GAME_CHANCES = {
  /** Chance for bait to fall off when manually extracting float/feeder rigs */
  baitFallOffOnReset: 0.05,

  /** Chance for bait to be lost on escape if NOT hooked */
  baitLossOnEscapeNotHooked: 0.5,

  /** Chance for hook to be lost on escape if WAS hooked */
  hookLossOnEscapeHooked: 0.1,
} as const;
