import type { TimeOfDayType } from './index';

export type GamePhaseType =
  | 'idle'
  | 'casting'
  | 'waiting'
  | 'bite'
  | 'reeling'
  | 'caught'
  | 'broken'
  | 'escaped'
  | 'snagged';

export interface ILakeSceneCallbacks {
  onTensionChange: (tension: number, broken: boolean) => void;
  onDepthChange: (depthM: number) => void;
  onBite: () => void;
  onCatch: (result: import('./mechanics.types').CatchResultType) => void;
  onLineBroke: (lostMeters: number, type?: 'line' | 'hook') => void;
  onGearBroke: (type?: 'rod' | 'reel') => void;
  onPhaseChange: (
    phase: GamePhaseType,
    wasHooked?: boolean,
    isScaredAway?: boolean,
  ) => void;
  onBiteProgress: (progress: number) => void;
  onSnagStart?: () => void;
  onSnagEnd?: (success: boolean) => void;
  onCast?: () => void;
  onHookFish?: () => void;
  onPlayerReeling?: (isReeling: boolean) => void;
  onTimeOfDayChange?: (tod: TimeOfDayType) => void;
  onGroundbaitExpired?: () => void;
  onDebugToggle?: (visible: boolean) => void;
  onEchoSounderToggle?: (visible: boolean) => void;
  onGearDamaged?: (rodDamage: number, reelDamage: number) => void;
  onCastError?: (msgId: string) => void;
  onResetCast?: (phase: GamePhaseType) => void | boolean;
}

export interface IScene {
  init(
    stage: import('pixi.js').Container,
    app: import('pixi.js').Application,
  ): Promise<void>;
  update(deltaTime: number): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

export interface ISpawnedFish {
  fish: import('../../game/domain/fish/Fish').Fish; // keep reference to Fish class
  entity: import('../../game/engine/entities/FishEntity').FishEntity;
}

export interface IVec2 {
  x: number;
  y: number;
}

export type GameUiEventMap = {
  tension: number;
  bite: number;
  depth: number;
  debug: boolean;
  echoSounder: boolean;
  snagStart: null;
  snagEnd: boolean;
  retrieveSpeed: 'slow' | 'normal' | 'fast';
  phase: GamePhaseType;
  timeUpdate: { hour: number; mode: 'real' | 'game' };
};
