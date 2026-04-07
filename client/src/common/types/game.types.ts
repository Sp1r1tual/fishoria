import type { GamePhaseType, CatchResultType } from './index';

export interface ILossEvent {
  reason: 'tension' | 'bite' | 'escape' | 'snag';
  itemNames: string[];
  lostMeters?: number;
}

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
  weather: 'clear' | 'cloudy' | 'rain';
  weatherForecast: ('clear' | 'cloudy' | 'rain')[];
  lastWeatherUpdateHour: number | null;
  baseDepth: number;
}
