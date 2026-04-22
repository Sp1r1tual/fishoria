import type { IVec2 } from './engine.types';

export type TimeOfDayType = 'morning' | 'day' | 'evening' | 'night';

export interface IDepthMapConfig {
  type: 'grid' | 'function';
  data?: number[][];
  fn?: (xNorm: number, yNorm: number) => number;
  minDepth: number;
  maxDepth: number;
}

export interface ISpeciesSpawnRate {
  speciesId: string;
  preferredDepthRange: { min: number; max: number };
  baseCatchChance?: number;
}

export interface IFishSpawnsConfig {
  species?: ISpeciesSpawnRate[];
}

export interface IAllowedCastArea {
  type: 'polygon' | 'circle';
  points?: IVec2[];
  center?: IVec2;
  radius?: number;
}

export interface IObstacle {
  id: string;
  type: 'circle' | 'polygon';
  position: IVec2;
  radius?: number;
  points?: IVec2[];
}

export interface ITimeOfDayLakeConfig {
  waterColor: number;
  bgImageUrl: string;
}

export interface IEnvironmentConfig {
  waterBoundaryY: number;
}

export interface ILakeConfig {
  id: string;
  name: string;
  description: string;
  backgroundColor: number;
  depthMap: IDepthMapConfig;
  fishSpawns: IFishSpawnsConfig;
  allowedCastArea: IAllowedCastArea;
  obstacles: IObstacle[];
  timeOfDayConfig: Record<TimeOfDayType, ITimeOfDayLakeConfig>;
  environment: IEnvironmentConfig;
  trashChance: number;
  unlockLevel: number;
}
