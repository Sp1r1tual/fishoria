import type { GamePhaseType, CatchResultType } from './index';

export interface ILossEvent {
  reason: 'tension' | 'bite' | 'escape' | 'snag';
  itemNames: string[];
  lostMeters?: number;
}

export type WeatherType = 'clear' | 'cloudy' | 'rain';

export type RetrieveSpeedType = 'slow' | 'normal' | 'fast';

export interface IGameState {
  currentLakeId: string | null;
  phase: GamePhaseType;
  tension: number;
  isBroken: boolean;
  depthMeters: number;
  xpGain?: number;
  rodDamage?: number;
  reelDamage?: number;
  maxWeight?: number;
  groundbaitExpiresAt: number | null;
  lastCatch: CatchResultType | null;
  lossEvent: ILossEvent | null;
  weather: WeatherType;
  weatherForecast: WeatherType[];
  lastWeatherUpdateHour: number | null;
  baseDepth: number;
}

export interface ICatchFishPayload {
  speciesId: string;
  speciesName: string;
  weight: number;
  length: number;
  lakeId: string;
  lakeName: string;
  baitUsed: string;
  method: string;
  xpGain?: number;
  rodDamage?: number;
  reelDamage?: number;
  maxWeight?: number;
  sizeRank?: 'small' | 'good' | 'trophy';
  isReleased?: boolean;
}

export interface IBreakGearPayload {
  type: 'rod' | 'reel' | 'line' | 'hook' | 'bait';
  baitId?: string;
  lostMeters?: number;
  rodDamage?: number;
  reelDamage?: number;
}
