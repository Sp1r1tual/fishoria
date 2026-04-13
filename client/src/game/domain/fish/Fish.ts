import type {
  IFishSpeciesConfig,
  IUpdateContext,
  IFishBehavior,
  FishStateType,
} from '@/common/types';

import { SteeringBehavior } from './SteeringBehavior';

import { FISH_STATES } from './constants/FishState';
import { MigrationRegistry } from './registers/MigrationRegistry';

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
  depth: number = 0;
  weight: number = 0;
  stateTimer: number = 0;
  nearbyFishCount: number = 0;
  separationForce: { x: number; y: number } = { x: 0, y: 0 };
  hasAttemptedAttack: boolean = false;

  lastSplashSeenTime: number = -1;
  isSplashCurious: boolean = false;

  biteStrategy: 'direct' | 'playful' =
    Math.random() < FISH_AI.directBiteChance ? 'direct' : 'playful';
  biteTimeout: number =
    FISH_AI.biteTimeoutBase + Math.random() * FISH_AI.biteTimeoutRange;
  hasLostInterest: boolean = false;

  migrationTarget: { x: number; y: number } | null = null;
  migrationTimer: number =
    FISH_AI.migrationTimerBase + Math.random() * FISH_AI.migrationTimerRange;
  restTimer: number =
    FISH_AI.restTimerBase + Math.random() * FISH_AI.restTimerRange;
  isResting: boolean = false;
  restDuration: number = 0;
  preferredDepthRange: { min: number; max: number };
  originalDepthRange: { min: number; max: number };
  weightRange: { min: number; max: number };

  cachedDepthBias: [number, number] = [0, 0];
  depthProbeCounter: number = 0;
  depthProbeInterval: number = 6;

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
    this.state = FISH_STATES.Idle;
    this.behavior = behavior ?? new SteeringBehavior();
    this.preferredDepthRange = { ...preferredDepthRange };
    this.originalDepthRange = { ...preferredDepthRange };
    this.weightRange = weightRange ?? config.weightRange;

    this.depthProbeCounter = Math.floor(
      Math.random() * this.depthProbeInterval,
    );
  }

  generateWeight(): void {
    const wMin = this.weightRange.min;
    const wMax = this.weightRange.max;
    const range = wMax - wMin;

    const r = Math.pow(Math.random(), CATCH_RESULT.weightDistributionPower);
    const jitter = (Math.random() - 0.5) * (range * 0.04);

    this.weight = Math.max(wMin, Math.min(wMax, wMin + r * range + jitter));
  }

  setState(state: FishStateType): void {
    this.state = state;
    this.stateTimer = 0;

    if (state === FISH_STATES.Idle) {
      this.hasAttemptedAttack = false;
    }
  }

  update(context: IUpdateContext): void {
    const dt = context.deltaTime / 60;
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
    this.state = FISH_STATES.Idle;
    this.stateTimer = 0;
    this.interestLevel = 0;
    this.hasLostInterest = false;
    this.weight = 0;
    this.depth = 0;
    this.separationForce.x = 0;
    this.separationForce.y = 0;
    this.nearbyFishCount = 0;
    this.preferredDepthRange = { ...preferredDepthRange };
    this.originalDepthRange = { ...preferredDepthRange };
    this.weightRange = weightRange ?? config.weightRange;
    if (this.migrationTarget) {
      MigrationRegistry.activeMigrations = Math.max(
        0,
        MigrationRegistry.activeMigrations - 1,
      );
    }
    this.migrationTarget = null;
    this.migrationTimer = 5 + Math.random() * 25;
    this.isResting = false;
    this.restTimer =
      FISH_AI.restTimerBase + Math.random() * FISH_AI.restTimerRange;
    this.restDuration = 0;
    this.depthProbeCounter = Math.floor(
      Math.random() * this.depthProbeInterval,
    );
    this.hasAttemptedAttack = false;
    this.biteStrategy =
      Math.random() < FISH_AI.directBiteChance ? 'direct' : 'playful';
    this.biteTimeout =
      FISH_AI.biteTimeoutBase + Math.random() * FISH_AI.biteTimeoutRange;
    this.lastSplashSeenTime = -1;
    this.isSplashCurious = false;
  }
}
