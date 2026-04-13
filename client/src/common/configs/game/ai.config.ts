/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FISH AI & MOVEMENT CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════
 */

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
  directBiteChance: 0.2,

  /** Bite timeout: base + random * range (seconds) — fish gives up if not hooked */
  biteTimeoutBase: 3.0,
  biteTimeoutRange: 4.5,

  /** Migration timer: base + random * range (seconds between long-distance swims) */
  migrationTimerBase: 5,
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
  depthBiasComfortTolerance: 0.2,

  /** Depth bias steering force strength */
  depthBiasForceStrength: 0.25,

  /** Depth probe step (normalized percent of map) */
  depthProbeStep: 0.05,

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
  idleDepthBiasForce: 1.0,

  /** Fish struggle aggression multipliers for tension: aggression * Weight + Base */
  struggleAggressionWeight: 0.8,
  struggleAggressionBase: 0.2,

  /** Separation (repulsion) between fish to prevent clustering */
  separation: {
    /** Radius (pixels) for separation force to kick in */
    radius: 45,
    /** Force strength of separation */
    forceMultiplier: 0.35,
  },

  /** Frequency of surface indicators (ripples/bubbles) for fish groups */
  surfaceRippleChance: 0.00018,
} as const;

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

export const CAST_SPLASH = {
  /** Duration (seconds) of splash influence on fish */
  duration: 2.5,

  /** Radius (pixels, pre-scale) for splash influence */
  radius: 120,

  /** Fear threshold — fish with fear <= this are "predatory" */
  predatorFearThreshold: 0.4,

  /** Predator attraction force multiplier */
  predatorAttractionForce: 0.7,
  /** Predator speed boost during splash */
  predatorSpeedBoost: 1.1,

  /** Prey repulsion force multiplier */
  preyRepulsionForce: 1.0,
  /** Prey speed boost during splash */
  preySpeedBoost: 1.2,

  /** Predator interest (curiosity) chance on splash */
  predatorInterestChance: 0.5,

  /** Avoidance force weight */
  avoidanceWeight: 1.5,
} as const;
