import type { IFishSpeciesConfig, FishStateType } from '@/common/types';

import { FISH_STATES } from './FishState';

import { FISH_AI, CATCH_RESULT } from '@/common/configs/game';

let _counter = 0;

export class Fish {
  id: string;
  config: IFishSpeciesConfig;
  position: { x: number; y: number };
  state: FishStateType;
  interestLevel: number = 0;
  depth: number = 0;
  weight: number = 0;
  stateTimer: number = 0;
  isTrash: boolean = false;

  biteTimeout: number =
    FISH_AI.biteTimeoutBase + Math.random() * FISH_AI.biteTimeoutRange;
  hasLostInterest: boolean = false;

  combatAngle: number = Math.random() * Math.PI * 2;
  combatSpeed: number = 0;
  combatTimer: number = 0;

  biteDriftX: number = 0;
  biteDriftY: number = 0;
  biteDriftTimer: number = 0;

  nibblesDone: number = 0;
  targetNibbles: number = 1;

  weightRange: { min: number; max: number };

  constructor(
    config: IFishSpeciesConfig,
    x: number,
    y: number,
    weightRange?: { min: number; max: number },
  ) {
    this.id = `fish_${++_counter}_${config.id}`;
    this.config = config;
    this.position = { x, y };
    this.state = FISH_STATES.Idle;
    this.weightRange = weightRange ?? config.weightRange;

    this.targetNibbles = Math.max(
      1,
      Math.floor(1.5 - config.behavior.aggression * 1.5 + Math.random() * 2.0),
    );
  }

  generateWeight(): void {
    const wMin = this.weightRange.min;
    const wMax = this.weightRange.max;
    const range = wMax - wMin;

    let r = Math.pow(Math.random(), CATCH_RESULT.weightDistributionPower);

    const jitter = (Math.random() - 0.5) * 0.02;
    r = Math.max(0, Math.min(1, r + jitter));

    this.weight = wMin + r * range;

    this.weight += (Math.random() - 0.5) * 0.001;
    this.weight = Math.max(wMin, Math.min(wMax, this.weight));
  }

  setState(state: FishStateType): void {
    this.state = state;
    this.stateTimer = 0;
  }
}
