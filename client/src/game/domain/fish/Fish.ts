import type {
  IFishSpeciesConfig,
  IUpdateContext,
  IFishBehavior,
  FishStateType,
} from '../../../common/types';

import { SteeringBehavior } from './SteeringBehavior';
import { FishState } from './FishState';

import { FISH_AI, CATCH_RESULT } from '@/common/configs/game';

let _counter = 0;

export class Fish {
  id: string;
  config: IFishSpeciesConfig;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  state: FishStateType;
  behavior: IFishBehavior;
  interestLevel: number = 0;
  depth: number = 0; // meters from surface
  energy: number;
  weight: number = 0; // actual weight in kg, generated at bite time
  stateTimer: number = 0;
  nearbyFishCount: number = 0;
  separationForce: { x: number; y: number } = { x: 0, y: 0 };
  hasAttemptedAttack: boolean = false;

  // Splash interaction tracking
  lastSplashSeenTime: number = -1;
  isSplashCurious: boolean = false;

  // Bite mechanics
  biteStrategy: 'direct' | 'playful' =
    Math.random() < FISH_AI.directBiteChance ? 'direct' : 'playful';
  biteTimeout: number =
    FISH_AI.biteTimeoutBase + Math.random() * FISH_AI.biteTimeoutRange;
  hasLostInterest: boolean = false; // Persistent loss of interest until resetCast

  // Movement & Exploration
  migrationTarget: { x: number; y: number } | null = null;
  migrationTimer: number =
    FISH_AI.migrationTimerBase + Math.random() * FISH_AI.migrationTimerRange;
  restTimer: number =
    FISH_AI.restTimerBase + Math.random() * FISH_AI.restTimerRange;
  isResting: boolean = false;
  restDuration: number = 0;
  preferredDepthRange: { min: number; max: number };
  weightRange: { min: number; max: number };

  // Performance: cached depth bias (recalculated every N frames)
  cachedDepthBias: [number, number] = [0, 0];
  depthProbeCounter: number = 0;
  depthProbeInterval: number = 6; // Recalculate every 6 frames

  constructor(
    config: IFishSpeciesConfig,
    x: number,
    y: number,
    preferredDepthRange: { min: number; max: number },
    weightRange?: { min: number; max: number },
    behavior?: IFishBehavior,
  ) {
    this.id = `fish_${++_counter}_${config.id}`;
    this.config = config;
    this.position = { x, y };
    this.velocity = {
      x: (Math.random() - 0.5) * FISH_AI.spawnVelocitySpread,
      y: (Math.random() - 0.5) * FISH_AI.spawnVelocitySpread,
    };
    this.state = FishState.Idle;
    this.behavior = behavior ?? new SteeringBehavior();
    this.energy = FISH_AI.energyBase + Math.random() * FISH_AI.energyRandom;
    this.preferredDepthRange = preferredDepthRange;
    this.weightRange = weightRange ?? config.weightRange;
    // Stagger probes across fish so they don't all probe on the same frame
    this.depthProbeCounter = Math.floor(
      Math.random() * this.depthProbeInterval,
    );
  }

  /**
   * Generates the actual weight for this fish using the same distribution
   * that makes trophy fish rare. Called at bite time for optimization.
   */
  generateWeight(): void {
    const wMin = this.weightRange.min;
    const wMax = this.weightRange.max;
    const r = Math.pow(Math.random(), CATCH_RESULT.weightDistributionPower);
    this.weight = wMin + r * (wMax - wMin);
  }

  setState(state: FishStateType): void {
    this.state = state;
    this.stateTimer = 0;

    if (state === FishState.Idle) {
      this.hasAttemptedAttack = false;
    }
  }

  update(context: IUpdateContext): void {
    const dt = context.deltaTime / 60; // Convert typical Pixi deltaTime (1.0 @ 60fps) to approximate seconds
    this.stateTimer += dt;
    this.behavior.update(this, context);
  }

  reset(
    config: IFishSpeciesConfig,
    x: number,
    y: number,
    preferredDepthRange: { min: number; max: number },
    weightRange?: { min: number; max: number },
  ): void {
    this.config = config;
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = (Math.random() - 0.5) * FISH_AI.spawnVelocitySpread;
    this.velocity.y = (Math.random() - 0.5) * FISH_AI.spawnVelocitySpread;
    this.state = FishState.Idle;
    this.stateTimer = 0;
    this.interestLevel = 0;
    this.hasLostInterest = false;
    this.energy = FISH_AI.energyBase + Math.random() * FISH_AI.energyRandom;
    this.weight = 0; // Reset weight; will be regenerated on next bite
    this.separationForce.x = 0;
    this.separationForce.y = 0;
    this.preferredDepthRange = preferredDepthRange;
    this.weightRange = weightRange ?? config.weightRange;
    this.migrationTarget = null;
    this.isResting = false;
    this.depthProbeCounter = Math.floor(
      Math.random() * this.depthProbeInterval,
    );
    this.hasAttemptedAttack = false;
  }
}
