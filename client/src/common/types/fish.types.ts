import type { BaitTypeType, GroundbaitTypeType, WeatherType } from './index';

export interface IFishBehaviorTraits {
  aggression: number;
  curiosity: number;
  fear: number;
  mobility: number;
}

export interface IActivityByTimeOfDay {
  morning: number;
  day: number;
  evening: number;
  night: number;
}

export interface IFishSpeciesConfig {
  id: string;
  name: string;
  description: string;
  weightRange: { min: number; max: number };
  activityByTimeOfDay: IActivityByTimeOfDay;
  activityByWeather: Record<WeatherType, number>;
  preferredBaits: BaitTypeType[];
  preferredGroundbait: GroundbaitTypeType;
  baseCatchChance: number;
  behavior: IFishBehaviorTraits;
  color: number;
  imageUrl: string;
  isPredator?: boolean;
  priceMultiplier: number;
  lureMultipliers?: Partial<
    Record<import('./gear.types').LureTypeType, number>
  >;
}

export interface IUpdateContext {
  deltaTime: number;
  canvasWidth: number;
  canvasHeight: number;
  waterBoundaryY: number;
  baitPosition: { x: number; y: number } | null;
  baitDepth: number;
  timeOfDay: string;
  weather: WeatherType;
  obstacles: Array<{ x: number; y: number; radius: number }>;
  playerReeling?: boolean;
  isAnyFishHooked?: boolean;
  lakeMaxDepth: number;
  getDepthAt: (nx: number, ny: number) => number;
  timeSinceCast: number;
  baitType?: string;
  rigType?: string;
  activeGroundbait?: {
    id: string;
    intensityMultiplier?: number;
    fishedSpeciesMultiplier?: Record<string, number>;
  };
  allowedCastArea?: import('./lake.types').IAllowedCastArea;
}

export interface IFishBehavior {
  update(
    fish: import('../../game/domain/fish/Fish').Fish,
    context: IUpdateContext,
  ): void;
}

export type FishStateType =
  | 'Idle'
  | 'Interested'
  | 'Biting'
  | 'Hooked'
  | 'Escaping';

export interface IFishVisualState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  t: number;
  opacity: number;
}
