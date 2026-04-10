import type { IFishSpeciesConfig, BaitTypeType, TimeOfDayType } from './index';

export interface ITensionState {
  value: number;
  isBroken: boolean;
  brokenGearType?: 'rod' | 'reel' | 'line' | 'hook';
  isEscaped?: boolean;
  isOverloaded?: boolean;
  escapeProgress: number;
  timeSinceLastReel?: number;
}

export interface ITensionUpdateParams {
  current: ITensionState;
  fishAggression: number;
  fishWeight: number;
  rodMaxWeight: number;
  reelMaxWeight: number;
  lineMaxWeight: number;
  hookMaxWeight: number;
  hookQuality: number;
  timeHooked: number;
  playerReeling: boolean;
  playerRelaxing: boolean;
  deltaTime: number;
}

export interface ICastTarget {
  pixelX: number;
  pixelY: number;
  normalizedX: number;
  normalizedY: number;
}

export interface IFishCatch {
  type: 'fish';
  species: IFishSpeciesConfig;
  weight: number;
  length: number;
  baitUsed: string;
  method: string;
  lakeId: string;
  lakeName: string;
  rodDamage?: number;
  reelDamage?: number;
}

export interface ITrashCatch {
  type: 'trash';
  name: string;
  description: string;
  rodDamage?: number;
  reelDamage?: number;
}

export type CatchResultType = IFishCatch | ITrashCatch;

export interface IBiteDetectionParams {
  fish: import('../../game/domain/fish/Fish').Fish[];
  baitType: BaitTypeType;
  hookPixelX: number;
  hookPixelY: number;
  canvasHeight: number;
  timeOfDay: TimeOfDayType;
  visibility: number;
  deltaTime: number;
  hookDepthM: number;
  isAnyFishHooked?: boolean;
  timeSinceCast: number;
  weather: 'clear' | 'cloudy' | 'rain';
  rigType?: string;
  isMoving?: boolean;
  isOnBottom?: boolean;
  pullCount?: number;
  retrieveType?: string;
  retrieveSpeed?: 'slow' | 'normal' | 'fast';
}

export interface IBiteResult {
  biter: import('../../game/domain/fish/Fish').Fish | null;
  progress: number;
}

export interface IReelingResult {
  tension: ITensionState;
  accumRodWear: number;
  accumReelWear: number;
  hookX: number;
  hookY: number;
  newPhase: import('./engine.types').GamePhaseType | null;
  catchResult: CatchResultType | null;
}

export interface ISpinningLureState {
  hookX: number;
  hookY: number;
  castX: number;
  castY: number;
  currentLureDepthM: number;
  groundDepthM: number;
  reachedShore: boolean;
}
