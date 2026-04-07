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
  weight: number; // relative probability of this species spawning
  preferredDepthRange: { min: number; max: number }; // preferred depth range in meters
  weightRange?: { min: number; max: number }; // override default species weight range
}

export interface ISpawnZone {
  id: string;
  type: 'circle' | 'polygon';
  center?: IVec2;
  radius?: number;
  points?: IVec2[];
  species: ISpeciesSpawnRate[];
  spawnWeight: number;
}

export interface IFishSpawnsConfig {
  zones?: ISpawnZone[];
  species?: ISpeciesSpawnRate[];
  spawnRatePerSecond: number;
  maxFishCount: number;
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
  ambientLight: number;
  fishActivityMultiplier: number;
  waterColor: number;
  skyColor: number;
  bgImageUrl: string;
}

export interface IEnvironmentConfig {
  visibility: number;
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
