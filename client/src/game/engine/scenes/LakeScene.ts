import { Application, Container, Assets, Graphics, BlurFilter } from 'pixi.js';

import type {
  IScene,
  TimeOfDayType,
  ILakeConfig,
  BaitTypeType,
  IRodConfig,
  IHookConfig,
  ILineConfig,
  IReelConfig,
  GroundbaitTypeType,
  ITensionState,
  GamePhaseType,
  ILakeSceneCallbacks,
  IUpdateContext,
  WeatherType,
  RetrieveSpeedType,
} from '@/common/types';

import { SectorSystem } from '../systems/SectorSystem';
import { DepthSystem } from '../systems/DepthSystem';
import { RodEntity } from '../entities/RodEntity';
import { HookEntity } from '../entities/HookEntity';
import { DebugLayer } from '../debug/DebugLayer';
import { BackgroundRenderer } from '../rendering/BackgroundRenderer';
import { GroundbaitEffect } from '../effects/GroundbaitEffect';
import { BubbleEffect } from '../effects/BubbleEffect';
import { WaterRippleEffect } from '../effects/WaterRippleEffect';
import { DragonflyEffect } from '../effects/DragonflyEffect';
import { InputHandler } from '../input/InputHandler';
import { validateCast } from '@/game/domain/mechanics/CastingSystem';
import { detectSectorBite } from '@/game/domain/mechanics/SectorBiteDetection';
import { LureFollower } from '@/game/domain/mechanics/LureFollower';
import { updateSpinningLure } from '@/game/domain/mechanics/SpinningLureSystem';
import { updateReelingPhase } from '@/game/domain/mechanics/ReelingSession';
import { computeRodVisuals } from '../rendering/RodVisualState';
import { Fish } from '@/game/domain/fish/Fish';
import { FISH_STATES } from '@/game/domain/fish/FishState';
import { TimeManager } from '@/game/managers/TimeManager';
import { WeatherLayer } from '../effects/WeatherLayer';
import { GameEvents } from '../GameEvents';
import { SnagMechanic } from '@/game/domain/mechanics/SnagMechanic';
import {
  getRenderScale,
  getBubbleScale,
  isTablet,
} from '@/game/utils/ScreenUtils';

import {
  FISH_SPECIES,
  GROUNDBAITS,
  TIME_SYSTEM,
  EARLY_HOOK,
  SCENE_TIMING,
  INTEREST_RATES,
} from '@/common/configs/game';

interface ISyncStateData {
  lakeId?: string | null;
  rodConfig?: IRodConfig | null;
  reelConfig?: IReelConfig | null;
  lineConfig?: ILineConfig | null;
  hookConfig?: IHookConfig | null;
  activeBait?: BaitTypeType;
  baitName?: string;
  hasBait?: boolean;
  activeGroundbait?: GroundbaitTypeType;
  groundbaitExpiresAt?: number | null;
  baseDepth?: number;
  equippedRodUid?: string | null;
  equippedReelUid?: string | null;
  equippedLineUid?: string | null;
  equippedHookUid?: string | null;
}

export class LakeScene implements IScene {
  private stage!: Container;
  private app!: Application;
  private fishLayer!: Container;
  private uiLayer!: Container;

  private bgRenderer!: BackgroundRenderer;
  private sectorSystem!: SectorSystem;
  private depthSystem!: DepthSystem;
  private rod!: RodEntity;
  private hook!: HookEntity;
  private debugLayer!: DebugLayer;
  private inputHandler!: InputHandler;

  private phase: GamePhaseType = 'idle';
  private hookedFish: Fish | null = null;
  private potentialBiter: Fish | null = null;
  private tension: ITensionState = {
    value: 0,
    isBroken: false,
    isEscaped: false,
    escapeProgress: 0,
    timeSinceLastReel: 0,
  };
  private playerReeling = false;
  private playerRelaxing = false;

  private hookX = 0;
  private hookY = 0;
  private hookDepthM = 1.0;
  private timeSinceCast = 0;
  private timeOfDay: TimeOfDayType = 'day';
  private activeBait: BaitTypeType = 'worm';
  private activeBaitName = 'Worm';
  private totalTime = 0;
  private castX = 0;
  private castY = 0;
  private groundDepthM = 1.0;
  private currentLureDepthM = 0.0;
  private baitAvailable = true;
  private smoothedTension = 0;
  private smoothedSlack = 0.8;
  private smoothedInterest = 0;
  private snagMechanic = new SnagMechanic();
  private lastW = 0;
  private lastH = 0;
  private weatherLayer!: WeatherLayer;
  private weather: WeatherType = 'clear';
  private groundbaitEffect!: GroundbaitEffect;
  private bubbleEffect!: BubbleEffect;
  private waterRippleEffect!: WaterRippleEffect;
  private dragonflyEffect!: DragonflyEffect;
  private strikeHintGfx!: Graphics;

  private config: ILakeConfig;
  private callbacks: ILakeSceneCallbacks;
  private timeMode: 'real' | 'game';

  private rodConfig: IRodConfig | null = null;
  private reelConfig: IReelConfig | null = null;
  private lineConfig: ILineConfig | null = null;
  private hookConfig: IHookConfig | null = null;

  private activeGroundbaitType: GroundbaitTypeType = 'none';
  private groundbaitExpiresAt: number | null = null;

  private accumRodWear = 0;
  private accumReelWear = 0;
  private debugActive = false;
  private echoSounderActive = false;
  private isGearReady = false;

  private retrieveReelTime = 0;
  private retrievePauseTime = 0;
  private currentRetrieveType = 'steady';
  private currentRetrieveSpeed: RetrieveSpeedType = 'normal';
  private activeFollower: LureFollower | null = null;
  private targetInterest = 0;

  private castDistanceM = 0;
  private availableLineM = 100;

  private resetDelayTimer: ReturnType<typeof setTimeout> | null = null;
  private biteUpdateTimer = 0;

  private updateCtx: Partial<IUpdateContext> = {};

  constructor(
    config: ILakeConfig,
    callbacks: ILakeSceneCallbacks,
    timeMode: 'real' | 'game',
  ) {
    this.config = config;
    this.callbacks = callbacks;
    this.timeMode = timeMode;
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  async init(stage: Container, app: Application): Promise<void> {
    this.stage = stage;
    this.app = app;

    this.updateTimeOfDay();

    const urlsToLoad = new Set<string>();
    Object.values(this.config.timeOfDayConfig).forEach((t) =>
      urlsToLoad.add(t.bgImageUrl),
    );
    const allSpeciesConfigs = this.config.fishSpawns.species || [];

    for (const spConfig of allSpeciesConfigs) {
      const imageUrl = FISH_SPECIES[spConfig.speciesId]?.imageUrl;
      if (imageUrl) urlsToLoad.add(imageUrl);
    }

    const bgUrl = this.config.timeOfDayConfig[this.timeOfDay].bgImageUrl;
    const otherUrls = Array.from(urlsToLoad).filter((u) => u !== bgUrl);

    await Assets.load(bgUrl);

    if (otherUrls.length > 0) {
      Assets.load(otherUrls);
    }

    const bgLayer = new Container();
    this.fishLayer = new Container();
    this.uiLayer = new Container();
    this.strikeHintGfx = new Graphics();
    this.uiLayer.addChild(this.strikeHintGfx);

    stage.addChild(bgLayer);
    stage.addChild(this.fishLayer);
    stage.addChild(this.uiLayer);

    this.bgRenderer = new BackgroundRenderer(bgLayer, this.config);
    this.bgRenderer.setBackgroundTexture(bgUrl);

    this.waterRippleEffect = new WaterRippleEffect(this.fishLayer);

    const W = app.screen.width;
    const H = app.screen.height;

    this.drawStrikeHint(W, H);

    this.depthSystem = new DepthSystem(this.config.depthMap);
    this.rod = new RodEntity(this.uiLayer);
    this.sectorSystem = new SectorSystem(
      this.config.fishSpawns,
      this.config.allowedCastArea,
      (nx, ny) => {
        let minY = this.config.environment.waterBoundaryY;
        let maxY = 1.0;
        if (
          this.config.allowedCastArea.type === 'polygon' &&
          this.config.allowedCastArea.points
        ) {
          const ys = this.config.allowedCastArea.points.map((p) => p.y);
          minY = Math.min(...ys);
          maxY = Math.max(...ys);
        }
        const localNy = (ny - minY) / (maxY - minY);
        return this.depthSystem.getDepthAt(
          nx,
          Math.max(0, Math.min(1, localNy)),
        );
      },
      W,
      H,
      50,
    );

    this.debugLayer = new DebugLayer(
      this.fishLayer,
      this.app,
      this.depthSystem,
      this.sectorSystem,
      this.config,
    );

    this.bubbleEffect = new BubbleEffect(this.fishLayer);
    this.hook = new HookEntity(this.fishLayer);

    this.weatherLayer = new WeatherLayer(this.stage, app);
    this.groundbaitEffect = new GroundbaitEffect(this.stage);
    this.dragonflyEffect = new DragonflyEffect(this.uiLayer);

    this.hookX = W / 2;
    this.hookY = H / 2;
    this.lastW = W;
    this.lastH = H;

    this.bgRenderer.drawBackground(W, H, this.timeOfDay, this.weather);
    this.bgRenderer.drawObstacles(W, H);

    this.inputHandler = new InputHandler(
      app.canvas as HTMLCanvasElement,
      app,
      (pixel) => this.cast(pixel),
      () => this.hookFishExternal(),
      () => this.setPlayerReeling(true),
      () => this.setPlayerReeling(false),
      () => {
        this.playerRelaxing = true;
      },
      () => {
        this.playerRelaxing = false;
      },
      () => this.resetCast(),
      () => this.toggleDebug(),
      (speedIdx) => {
        const levels: RetrieveSpeedType[] = ['slow', 'normal', 'fast'];
        this.currentRetrieveSpeed = levels[speedIdx - 1];
        GameEvents.emit('retrieveSpeed', this.currentRetrieveSpeed);
        if (this.debugActive) {
          console.log(
            `[DEBUG] RETRIEVE SPEED: ${this.currentRetrieveSpeed.toUpperCase()}`,
          );
        }
      },
      () => this.phase,
      () => this.hookConfig?.rigType === 'spinning',
    );

    this.callbacks.onTimeOfDayChange?.(this.timeOfDay);
  }

  // ─── Gear ──────────────────────────────────────────────────────────────────
  setGear(
    rod: IRodConfig | null,
    reel: IReelConfig | null,
    line: ILineConfig | null,
    hook: IHookConfig | null,
  ): void {
    this.rodConfig = rod;
    this.reelConfig = reel;
    this.lineConfig = line;
    this.hookConfig = hook;

    let isVisible = !!(
      rod &&
      reel &&
      line &&
      hook &&
      !rod.isBroken &&
      !reel.isBroken
    );

    if (rod && hook) {
      if (rod.rodCategory === 'spinning' && hook.rigType !== 'spinning')
        isVisible = false;
      if (rod.rodCategory !== 'spinning' && hook.rigType === 'spinning')
        isVisible = false;
    }

    this.isGearReady = isVisible;
    if (this.rod) this.rod.setVisible(isVisible);

    if (this.hookConfig?.rigType === 'float') {
      this.callbacks.onDepthChange(this.hookDepthM);
    }
  }

  // ─── Time of Day ───────────────────────────────────────────────────────────
  private updateTimeOfDay(): boolean {
    const time = TimeManager.getTime(this.timeMode);
    const h = time.getHours();
    let newTimeOfDay: TimeOfDayType;

    if (h >= TIME_SYSTEM.morningStart && h < TIME_SYSTEM.dayStart)
      newTimeOfDay = 'morning';
    else if (h >= TIME_SYSTEM.dayStart && h < TIME_SYSTEM.eveningStart)
      newTimeOfDay = 'day';
    else if (h >= TIME_SYSTEM.eveningStart && h < TIME_SYSTEM.nightStart)
      newTimeOfDay = 'evening';
    else newTimeOfDay = 'night';

    if (this.timeOfDay !== newTimeOfDay) {
      this.timeOfDay = newTimeOfDay;
      this.callbacks.onTimeOfDayChange?.(this.timeOfDay);
      return true;
    }
    return false;
  }

  // ─── Debug ─────────────────────────────────────────────────────────────────
  toggleDebug(): void {
    this.debugActive = !this.debugActive;
    this.updateLayerVisibility();
    this.callbacks.onDebugToggle?.(this.debugActive);
    GameEvents.emit('debug', this.debugActive);
  }

  isDebugVisible(): boolean {
    return this.debugActive;
  }

  getPhase(): GamePhaseType {
    return this.phase;
  }

  // ─── Echo Sounder ─────────────────────────────────────────────────────────
  toggleEchoSounder(): void {
    this.echoSounderActive = !this.echoSounderActive;
    this.updateLayerVisibility();
    this.callbacks.onEchoSounderToggle?.(this.echoSounderActive);
    GameEvents.emit('echoSounder', this.echoSounderActive);
  }

  isEchoSounderVisible(): boolean {
    return this.echoSounderActive;
  }

  private updateLayerVisibility(): void {
    const isVisible = this.debugActive || this.echoSounderActive;
    this.debugLayer.setVisible(isVisible, this.debugActive);
    this.debugLayer.setLabelsVisible(this.debugActive);
    this.bgRenderer.setDebugVisible(this.debugActive);
  }

  // ─── Actions ───────────────────────────────────────────────────────────────
  setAvailableLineLength(meters: number): void {
    this.availableLineM = meters;
  }

  private cast(pixel: { x: number; y: number }): void {
    const isSpinning = this.hookConfig?.rigType === 'spinning';

    if (!this.isGearReady) {
      this.callbacks.onCastError?.('error.gear_incomplete');
      return;
    }

    if (!isSpinning && !this.baitAvailable) {
      this.callbacks.onCastError?.('error.no_bait');
      return;
    }

    if (this.availableLineM < 100) {
      this.callbacks.onCastError?.('error.low_line');
    }

    if (this.phase !== 'idle') {
      const shouldAbort = this.callbacks.onResetCast?.(this.phase);
      const isSnagged = this.resetCast(true);
      if (shouldAbort || isSnagged) return;
    } else {
      this.resetCast(true);
    }

    const W = this.app.screen.width;
    const H = this.app.screen.height;

    const target = validateCast(
      pixel,
      W,
      H,
      this.config.allowedCastArea,
      this.config.environment.waterBoundaryY,
    );
    if (!target) {
      this.callbacks.onPhaseChange('idle');
      return;
    }

    const waterY = H * this.config.environment.waterBoundaryY;
    const waterHeight = Math.max(1, H - waterY);

    const shoreY = H;
    const rawDistanceFraction = Math.max(
      0,
      Math.min(1, (shoreY - target.pixelY) / waterHeight),
    );
    let castDistanceM = rawDistanceFraction * 100;

    if (castDistanceM > this.availableLineM) {
      castDistanceM = this.availableLineM;
      const clampedFraction = castDistanceM / 100;
      target.pixelY = shoreY - clampedFraction * waterHeight;
    }
    this.castDistanceM = castDistanceM;

    this.castX = target.pixelX;
    this.castY = target.pixelY;
    this.hookX = this.castX;
    this.hookY = this.castY;

    const normX = this.hookX / W;
    let minY = this.config.environment.waterBoundaryY;
    let maxY = 1.0;
    if (
      this.config.allowedCastArea.type === 'polygon' &&
      this.config.allowedCastArea.points
    ) {
      const ys = this.config.allowedCastArea.points.map((p) => p.y);
      minY = Math.min(...ys);
      maxY = Math.max(...ys);
    }
    const normY = Math.max(
      0,
      Math.min(1, (this.hookY / H - minY) / (maxY - minY)),
    );

    this.groundDepthM = this.depthSystem.getDepthAt(normX, normY);

    if (this.hookConfig?.rigType === 'feeder') {
      this.hookDepthM = this.groundDepthM;
      this.callbacks.onDepthChange(this.hookDepthM);
    }

    this.phase = 'waiting';
    this.timeSinceCast = 0;
    this.biteUpdateTimer = 0;
    this.targetInterest = 0;
    this.currentLureDepthM = 0.0;

    this.waterRippleEffect.spawn(
      this.hookX,
      this.hookY,
      1.5,
      H,
      H * this.config.environment.waterBoundaryY,
    );

    this.callbacks.onCast?.();
    this.callbacks.onPhaseChange(this.phase);
  }

  private hookFish(): void {
    if (!this.hookedFish) return;

    const hookChance = this.hookConfig?.quality ?? 0.5;

    if (Math.random() > hookChance) {
      this.phase = 'escaped';
      this.callbacks.onPhaseChange(this.phase, false);
      this.scheduleReset(SCENE_TIMING.escapedResetDelay);
      return;
    }

    this.hookedFish.setState(FISH_STATES.Hooked);
    this.phase = 'reeling';

    const gearMaxWeight = Math.min(
      this.rodConfig?.maxWeight ?? Infinity,
      this.reelConfig?.maxWeight ?? Infinity,
      this.lineConfig?.maxWeight ?? Infinity,
      this.hookConfig?.maxWeight ?? Infinity,
    );

    if (this.hookedFish.weight > gearMaxWeight) {
      this.setPlayerReeling(false);
    }

    this.tension = {
      value: 0.0,
      isBroken: false,
      isEscaped: false,
      escapeProgress: 0,
      timeSinceLastReel: 0,
    };
    this.callbacks.onHookFish?.();
    this.callbacks.onPhaseChange(this.phase);
  }

  setActiveBait(
    bait: BaitTypeType,
    baitName: string,
    isAvailable: boolean,
  ): void {
    if (this.phase !== 'idle' && this.activeBait !== bait) this.resetCast();
    this.activeBait = bait;
    this.activeBaitName = baitName;
    this.baitAvailable = isAvailable;

    this.setGear(
      this.rodConfig,
      this.reelConfig,
      this.lineConfig,
      this.hookConfig,
    );
  }

  setActiveGroundbait(gb: GroundbaitTypeType, expiresAt?: number | null): void {
    this.activeGroundbaitType = gb;
    this.groundbaitExpiresAt = expiresAt ?? null;
  }

  public throwGroundbait(): void {
    const W = this.app.screen.width;
    const H = this.app.screen.height;
    this.groundbaitEffect.spawn(W, H);
  }

  setBaseDepth(depth: number): void {
    this.hookDepthM = depth / 100;
    if (this.hookConfig?.rigType === 'float') {
      this.callbacks.onDepthChange(this.hookDepthM);
    }
  }

  syncWithState(data: ISyncStateData): void {
    if (data.rodConfig !== undefined) this.rodConfig = data.rodConfig;
    if (data.reelConfig !== undefined) this.reelConfig = data.reelConfig;
    if (data.lineConfig !== undefined) this.lineConfig = data.lineConfig;
    if (data.hookConfig !== undefined) this.hookConfig = data.hookConfig;

    if (data.activeBait) {
      if (this.phase !== 'idle' && this.activeBait !== data.activeBait) {
        console.warn(
          `Bait changed mid-phase from ${this.activeBait} to ${data.activeBait}. Resetting cast.`,
        );
        this.resetCast();
      }
      this.activeBait = data.activeBait;
      this.activeBaitName = data.baitName || data.activeBait;
      this.baitAvailable = data.hasBait ?? true;
    }

    if (data.activeGroundbait) {
      this.activeGroundbaitType = data.activeGroundbait;
      this.groundbaitExpiresAt = data.groundbaitExpiresAt ?? null;
    }

    if (data.baseDepth !== undefined) {
      this.hookDepthM = data.baseDepth / 100;
    }

    this.setGear(
      this.rodConfig,
      this.reelConfig,
      this.lineConfig,
      this.hookConfig,
    );
  }

  setWeather(type: WeatherType): void {
    console.log(
      `[LakeScene] Setting weather to: ${type} (TimeOfDay: ${this.timeOfDay})`,
    );
    this.weather = type;
    if (this.weatherLayer) {
      this.weatherLayer.setWeather(type);
    }
    if (this.bgRenderer && this.app) {
      const W = this.app.screen.width;
      const H = this.app.screen.height;
      this.bgRenderer.drawBackground(W, H, this.timeOfDay, type);
    }
  }

  setPlayerReeling(v: boolean): void {
    this.playerReeling = v;
    this.callbacks.onPlayerReeling?.(v);
  }

  setRetrieveSpeed(speed: RetrieveSpeedType): void {
    this.currentRetrieveSpeed = speed;
  }

  hookFishExternal(): void {
    if (this.phase === 'bite') {
      this.hookFish();
    } else if (this.phase === 'waiting') {
      this.tryEarlyHook();
    }
  }

  private tryEarlyHook(): void {
    let bestFish: Fish | null = null;
    let maxInterest = 0;

    if (
      this.activeFollower &&
      this.activeFollower.interest > EARLY_HOOK.minInterest
    ) {
      maxInterest = this.activeFollower.interest;

      const config = FISH_SPECIES[this.activeFollower.speciesId];
      if (config) {
        bestFish = new Fish(config, this.hookX, this.hookY, { min: 1, max: 2 });
        bestFish.interestLevel = maxInterest;
        bestFish.setState(FISH_STATES.Interested);
      }
    }

    if (bestFish) {
      const earlyStrikeChance = Math.max(
        0,
        (maxInterest - EARLY_HOOK.minInterest) * EARLY_HOOK.chanceMultiplier,
      );

      if (Math.random() < earlyStrikeChance) {
        bestFish.generateWeight();
        this.hookedFish = bestFish;
        this.hookFish();
      } else {
        bestFish.setState(FISH_STATES.Escaping);
        bestFish.interestLevel = 0;
        bestFish.hasLostInterest = true;

        this.phase = 'escaped';
        this.callbacks.onPhaseChange(this.phase, false, true);
        this.scheduleReset(SCENE_TIMING.escapedResetDelay);
      }
    } else {
      this.resetCast();
    }
  }

  resetCast(suppressPhaseEvent = false): boolean {
    if (!suppressPhaseEvent) {
      this.callbacks.onResetCast?.(this.phase);
    }
    this.clearResetTimer();

    if (
      (this.phase === 'waiting' || this.phase === 'bite') &&
      this.isBaitOnBottom()
    ) {
      if (this.snagMechanic.checkStaticSnag(this.hookConfig?.rigType, true)) {
        this.phase = 'snagged';
        this.callbacks.onPhaseChange(this.phase);
        this.callbacks.onSnagStart?.();
        return true;
      }
    }

    this.phase = 'idle';

    const W = this.app.renderer.width;
    const H = this.app.renderer.height;
    this.hookX = W / 2;
    this.hookY = H / 2;
    this.castX = this.hookX;
    this.castY = this.hookY;
    this.currentLureDepthM = 0;

    this.activeFollower = null;
    this.hookedFish = null;
    this.potentialBiter = null;
    this.playerRelaxing = false;
    this.tension = {
      value: 0,
      isBroken: false,
      isEscaped: false,
      escapeProgress: 0,
      timeSinceLastReel: 0,
    };
    this.callbacks.onTensionChange(0, false, false);
    if (!suppressPhaseEvent) {
      this.callbacks.onPhaseChange(this.phase);
    }
    this.smoothedInterest = 0;
    this.targetInterest = 0;
    this.callbacks.onBiteProgress(0);
    this.callbacks.onLureDepthChange?.(0, 0);
    GameEvents.emit('lureDepth', {
      depth: 0,
      groundDepth: 0,
      x: W / 2,
      canvasWidth: W,
    });
    this.biteUpdateTimer = 0;
    this.snagMechanic.reset();
    this.retrieveReelTime = 0;
    this.retrievePauseTime = 0;
    this.currentRetrieveType = 'steady';

    if (this.accumRodWear > 0 || this.accumReelWear > 0) {
      this.callbacks.onGearDamaged?.(this.accumRodWear, this.accumReelWear);
      this.accumRodWear = 0;
      this.accumReelWear = 0;
    }
    return false;
  }

  isBaitOnBottom(): boolean {
    const depth =
      this.hookConfig?.rigType === 'spinning'
        ? this.currentLureDepthM
        : this.hookDepthM;
    return depth >= this.groundDepthM - SCENE_TIMING.bottomDetectionTolerance;
  }

  completeSnag(success: boolean): void {
    if (success) {
      this.resetCast();
    } else {
      this.phase = 'broken';
      this.callbacks.onPhaseChange(this.phase);
      this.callbacks.onLineBroke(Math.round(this.castDistanceM));
      this.scheduleReset(SCENE_TIMING.brokenResetDelay);
    }
    this.callbacks.onSnagEnd?.(success);
  }

  private clearResetTimer(): void {
    if (this.resetDelayTimer !== null) {
      clearTimeout(this.resetDelayTimer);
      this.resetDelayTimer = null;
    }
  }

  private scheduleReset(delayMs: number): void {
    this.clearResetTimer();
    this.resetDelayTimer = setTimeout(() => {
      this.resetDelayTimer = null;
      this.resetCast();
    }, delayMs);
  }

  // ─── Update ────────────────────────────────────────────────────────────────
  update(deltaTime: number): void {
    const isCast = this.phase !== 'idle';
    const W = this.app.screen.width;
    const H = this.app.screen.height;

    if (
      this.activeGroundbaitType !== 'none' &&
      this.groundbaitExpiresAt !== null
    ) {
      if (TimeManager.getGameTimeHours() >= this.groundbaitExpiresAt) {
        this.activeGroundbaitType = 'none';
        this.groundbaitExpiresAt = null;
        this.callbacks.onGroundbaitExpired?.();
      }
    }

    this.updateCtx.deltaTime = deltaTime;

    this.timeSinceCast += deltaTime;

    if (this.updateTimeOfDay()) {
      const bgUrl = this.config.timeOfDayConfig[this.timeOfDay].bgImageUrl;
      this.bgRenderer.setBackgroundTexture(bgUrl);
      this.bgRenderer.drawBackground(W, H, this.timeOfDay, this.weather);
    }

    if (this.phase === 'waiting' && this.hookConfig?.rigType === 'spinning') {
      const dtSec = deltaTime;
      if (this.playerReeling) {
        this.retrieveReelTime += dtSec;
        this.retrievePauseTime = 0;
      } else {
        this.retrievePauseTime += dtSec;
        if (
          this.retrievePauseTime > SCENE_TIMING.retrieve.pauseResetThreshold
        ) {
          this.retrieveReelTime = 0;
        }
      }
      if (this.retrieveReelTime > SCENE_TIMING.retrieve.steadyMinTime) {
        this.currentRetrieveType = 'steady';
      } else if (
        this.retrieveReelTime > SCENE_TIMING.retrieve.stopAndGo.minReel &&
        this.retrieveReelTime < SCENE_TIMING.retrieve.stopAndGo.maxReel &&
        this.retrievePauseTime > SCENE_TIMING.retrieve.stopAndGo.minPause &&
        this.retrievePauseTime < SCENE_TIMING.retrieve.stopAndGo.maxPause
      ) {
        this.currentRetrieveType = 'stop-and-go';
      } else if (
        this.retrieveReelTime > SCENE_TIMING.retrieve.jigging.minReel &&
        this.retrieveReelTime < SCENE_TIMING.retrieve.jigging.maxReel &&
        this.retrievePauseTime > SCENE_TIMING.retrieve.jigging.minPause &&
        this.retrievePauseTime < SCENE_TIMING.retrieve.jigging.maxPause
      ) {
        this.currentRetrieveType = 'jigging';
      }
    } else {
      this.currentRetrieveType = 'steady';
      this.retrieveReelTime = 0;
      this.retrievePauseTime = 0;
    }

    const isFishHookedOrBiting =
      this.phase === 'bite' || this.phase === 'reeling';

    if (this.debugLayer.isVisible()) {
      this.debugLayer.setEnv(
        this.timeOfDay,
        this.weather,
        GROUNDBAITS[this.activeGroundbaitType],
        this.hookConfig?.rigType,
        this.activeBait,
      );
      this.debugLayer.update(deltaTime);
    }
    this.debugLayer.updateSnag(
      isFishHookedOrBiting ? 0 : this.snagMechanic.getSnagProgress(),
      this.hookX,
      this.hookY,
      isCast,
    );

    this.updateStrikeHint();
    this.weatherLayer.update(deltaTime, this.timeOfDay);
    this.bgRenderer.update(deltaTime);
    this.waterRippleEffect.update(deltaTime);

    let maxInterest = 0;

    if (isCast && this.phase === 'waiting') {
      maxInterest = this.updateWaitingPhase(W, H, deltaTime);
    } else if (this.phase === 'bite' && this.hookedFish) {
      this.updateBitePhase();
    } else if (this.phase === 'reeling' && this.hookedFish) {
      this.updateReelingPhaseVisuals(W, H, deltaTime);
    }

    this.totalTime += deltaTime;

    this.groundbaitEffect.update(deltaTime);
    const bubbleScale = getBubbleScale(W);
    this.bubbleEffect.update(deltaTime, bubbleScale);
    this.dragonflyEffect.update(
      deltaTime,
      W,
      H,
      this.weather,
      this.timeOfDay,
      this.phase,
      this.rod.tipX || this.hookX + 20,
      this.rod.tipY || this.hookY - 100,
      maxInterest,
      this.playerReeling,
      isCast,
      this.hookConfig?.rigType,
    );

    const waterY = H * this.config.environment.waterBoundaryY;
    const waterHeight = Math.max(1, H - waterY);

    if (isCast) {
      let bubbleChance = 0;

      const bottomFeeders = [
        'carp',
        'crucian',
        'bream',
        'tench',
        'catfish',
        'american_catfish',
        'weatherfish',
        'crayfish',
        'gudgeon',
        'silver_carp',
      ];
      if (
        this.potentialBiter &&
        bottomFeeders.includes(this.potentialBiter.config.id)
      ) {
        bubbleChance += deltaTime * 1.5;
      }

      if (bubbleChance > 0 && Math.random() < bubbleChance) {
        const perspectiveScale =
          0.55 +
          0.3 * Math.max(0, Math.min(1, (this.hookY - waterY) / waterHeight));
        this.bubbleEffect.spawn(this.hookX, this.hookY, 1, perspectiveScale);
      }
    }

    const isRaining = this.weather === 'rain';
    const ambientRate = isRaining ? 50.0 : 1.0;

    if (Math.random() < deltaTime * ambientRate) {
      const pos = this.sectorSystem.getRandomAllowedPosition();
      if (pos) {
        const spawnX = pos.x * W;
        const spawnY = pos.y * H;

        const perspectiveScale =
          0.55 +
          0.3 * Math.max(0, Math.min(1, (spawnY - waterY) / waterHeight));

        this.bubbleEffect.spawn(
          spawnX,
          spawnY,
          isRaining ? 1 : 1 + Math.floor(Math.random() * 3),
          perspectiveScale,
        );
      }
    }

    const renderScale = getRenderScale(W);
    const perspectiveScale =
      0.55 +
      0.3 * Math.max(0, Math.min(1, (this.hookY - waterY) / waterHeight));

    this.hook.update({
      x: this.hookX,
      y: this.hookY,
      baitName: this.activeBaitName,
      isCast,
      phase: this.phase,
      time: this.totalTime,
      castX: this.hookX,
      castY: this.hookY,
      maxInterest,
      hookDepthM: this.hookDepthM,
      groundDepthM: this.groundDepthM,
      scale: perspectiveScale * renderScale,
      rigType: this.hookConfig?.rigType,
      currentDepthM:
        this.hookConfig?.rigType === 'spinning'
          ? this.currentLureDepthM
          : Math.min(this.hookDepthM, this.groundDepthM),
      debugActive: this.debugActive,
      escapeProgress: this.tension.escapeProgress,
      timeSinceCast: this.timeSinceCast,
      isSmall: isTablet(W),
    });

    const fishMovingTowardsPlayer = !!(
      this.hookedFish &&
      !this.playerReeling &&
      Math.sin(this.hookedFish.combatAngle) > 0.2
    );

    const rodVisuals = computeRodVisuals({
      phase: this.phase,
      isCast,
      hookX: this.hookX,
      hookY: this.hookY,
      castX: this.castX,
      castY: this.castY,
      bobberX: this.hookX,
      bobberY: this.hookY,
      canvasWidth: W,
      canvasHeight: H,
      renderScale,
      tension: this.tension,
      isSpinning: this.hookConfig?.rigType === 'spinning',
      playerReeling: this.playerReeling,
      hookDepthM: this.hookDepthM,
      groundDepthM: this.groundDepthM,
      currentLureDepthM: this.currentLureDepthM,
      rigType: this.hookConfig?.rigType,
      maxInterest,
      time: this.totalTime,
      timeSinceCast: this.timeSinceCast,
      fishMovingTowardsPlayer,
    });

    const lerpT = 1 - Math.pow(0.001, deltaTime);
    this.smoothedTension +=
      (rodVisuals.rodTension - this.smoothedTension) * Math.min(1, lerpT * 4.0);
    this.smoothedSlack +=
      (rodVisuals.lineSlack - this.smoothedSlack) * Math.min(1, lerpT * 2.0);

    this.rod.update(
      rodVisuals.baseX,
      rodVisuals.baseY,
      rodVisuals.aimX,
      rodVisuals.aimY,
      rodVisuals.lineTargetX,
      rodVisuals.lineTargetY,
      this.smoothedTension,
      this.smoothedSlack,
      isCast,
      renderScale,
      this.hookConfig?.rigType === 'spinning',
    );
  }

  // ─── Resize ────────────────────────────────────────────────────────────────
  resize(newW: number, newH: number): void {
    const oldW = this.lastW || newW;
    const oldH = this.lastH || newH;
    if (oldW === newW && oldH === newH) return;

    const oldWaterY = oldH * this.config.environment.waterBoundaryY;
    const oldWaterHeight = Math.max(1, oldH - oldWaterY);
    const newWaterY = newH * this.config.environment.waterBoundaryY;
    const newWaterHeight = Math.max(1, newH - newWaterY);

    const normX = this.hookX / oldW;
    const normY = (this.hookY - oldWaterY) / oldWaterHeight;
    this.hookX = normX * newW;
    this.hookY = newWaterY + normY * newWaterHeight;

    const castNormX = this.castX / oldW;
    const castNormY = (this.castY - oldWaterY) / oldWaterHeight;
    this.castX = castNormX * newW;
    this.castY = newWaterY + castNormY * newWaterHeight;

    if (this.hookedFish) {
      const fishNormX = this.hookedFish.position.x / oldW;
      const fishNormY =
        (this.hookedFish.position.y - oldWaterY) / oldWaterHeight;
      this.hookedFish.position.x = fishNormX * newW;
      this.hookedFish.position.y = newWaterY + fishNormY * newWaterHeight;
    }

    this.depthSystem = new DepthSystem(this.config.depthMap);
    this.sectorSystem = new SectorSystem(
      this.config.fishSpawns,
      this.config.allowedCastArea,
      (nx, ny) => {
        let minY = this.config.environment.waterBoundaryY;
        let maxY = 1.0;
        if (
          this.config.allowedCastArea.type === 'polygon' &&
          this.config.allowedCastArea.points
        ) {
          const ys = this.config.allowedCastArea.points.map((p) => p.y);
          minY = Math.min(...ys);
          maxY = Math.max(...ys);
        }
        const localNy = (ny - minY) / (maxY - minY);
        return this.depthSystem.getDepthAt(
          nx,
          Math.max(0, Math.min(1, localNy)),
        );
      },
      newW,
      newH,
      50,
    );
    this.debugLayer.setSystems(this.depthSystem, this.sectorSystem);
    this.debugLayer.resize();
    this.weatherLayer.resize();

    this.bgRenderer.drawBackground(newW, newH, this.timeOfDay, this.weather);
    this.bgRenderer.drawObstacles(newW, newH);

    this.lastW = newW;
    this.lastH = newH;
  }

  // ─── Destroy ───────────────────────────────────────────────────────────────
  destroy(): void {
    this.clearResetTimer();
    this.inputHandler.destroy();
    this.rod.destroy();
    this.hook.destroy();
    this.debugLayer.destroy();
    this.weatherLayer.destroy();
    this.groundbaitEffect.destroy();
    this.bubbleEffect.destroy();
    this.waterRippleEffect.destroy();
    this.dragonflyEffect.destroy();
    this.strikeHintGfx.destroy({ children: true });
  }

  setDebugVisible(visible: boolean): void {
    this.debugActive = visible;
    this.updateLayerVisibility();
    GameEvents.emit('debug', visible);
  }
  private updateWaitingPhase(W: number, H: number, deltaTime: number): number {
    if (this.hookConfig?.rigType === 'spinning') {
      const lureState = updateSpinningLure({
        hookX: this.hookX,
        hookY: this.hookY,
        castX: this.castX,
        castY: this.castY,
        currentLureDepthM: this.currentLureDepthM,
        canvasWidth: W,
        canvasHeight: H,
        waterBoundaryY: this.config.environment.waterBoundaryY,
        hookDepthM: this.hookDepthM,
        playerReeling: this.playerReeling,
        deltaTime,
        hookConfig: this.hookConfig,
        retrieveSpeedMult:
          INTEREST_RATES.spinning.speedMultipliers[this.currentRetrieveSpeed],
        depthSystem: this.depthSystem,
      });

      this.hookY = lureState.hookY;
      this.castX = lureState.castX;
      this.castY = lureState.castY;
      this.currentLureDepthM = lureState.currentLureDepthM;
      this.groundDepthM = lureState.groundDepthM;

      this.callbacks.onLureDepthChange?.(
        this.currentLureDepthM,
        this.groundDepthM,
      );
      GameEvents.emit('lureDepth', {
        depth: this.currentLureDepthM,
        groundDepth: this.groundDepthM,
        x: this.hookX,
        canvasWidth: W,
      });

      if (lureState.reachedShore) {
        this.resetCast();
      }
    }

    this.biteUpdateTimer += deltaTime;
    const isSpinning = this.hookConfig?.rigType === 'spinning';
    const updateInterval = isSpinning ? 0 : this.potentialBiter ? 1.2 : 1.0;

    let biter: Fish | null = null;

    if (this.biteUpdateTimer >= updateInterval) {
      const elapsedSec = this.biteUpdateTimer;
      this.biteUpdateTimer = 0;
      const biteResult = detectSectorBite({
        sectorSystem: this.sectorSystem,
        follower: this.activeFollower,
        baitType: this.activeBait,
        hookPixelX: this.hookX,
        hookPixelY: this.hookY,
        canvasWidth: W,
        canvasHeight: H,
        waterBoundaryY: this.config.environment.waterBoundaryY,
        timeOfDay: this.timeOfDay,
        weather: this.weather,
        deltaTime: elapsedSec,
        hookDepthM: isSpinning
          ? this.currentLureDepthM
          : Math.min(this.hookDepthM, this.groundDepthM),
        rigType: this.hookConfig?.rigType,
        isMoving: this.playerReeling && isSpinning,
        isOnBottom: this.isBaitOnBottom(),
        retrieveType: this.currentRetrieveType,
        activeGroundbait: GROUNDBAITS[this.activeGroundbaitType],
        getPreferredDepthRange: (speciesId: string) =>
          this.getPreferredDepthRange(speciesId),
        hasPotentialBiter: !!this.potentialBiter,
        potentialBiterSpeciesId: this.potentialBiter?.config.id,
      });
      if (
        biteResult.newFollower &&
        !this.activeFollower &&
        !biteResult.biteSpeciesId
      ) {
        this.callbacks.onInterest?.(isSpinning);
      }
      this.activeFollower = biteResult.newFollower;

      if (biteResult.biteSpeciesId) {
        const config = FISH_SPECIES[biteResult.biteSpeciesId];
        biter = new Fish(config, this.hookX, this.hookY);
        if (Math.random() < this.config.trashChance) {
          biter.isTrash = true;
        }
        this.potentialBiter = null;
      } else if (biteResult.progressSpeciesId && !isSpinning) {
        const activeSpeciesId = biteResult.progressSpeciesId;
        const config = FISH_SPECIES[activeSpeciesId];

        if (
          !this.potentialBiter ||
          this.potentialBiter.config.id !== activeSpeciesId
        ) {
          this.potentialBiter = new Fish(config, this.hookX, this.hookY);
          if (Math.random() < this.config.trashChance) {
            this.potentialBiter.isTrash = true;
          }
        }

        this.potentialBiter.nibblesDone++;

        if (this.isBaitOnBottom() && Math.random() < 0.4) {
          this.bubbleEffect.spawn(
            this.hookX,
            this.hookY,
            1 + Math.floor(Math.random() * 2),
          );
          if (this.hookConfig?.rigType !== 'feeder') {
            this.waterRippleEffect.spawn(
              this.hookX,
              this.hookY,
              0.4,
              H,
              H * this.config.environment.waterBoundaryY,
            );
          }
        }

        if (Math.random() < 0.1) {
          this.potentialBiter = null;
        } else {
          const forceBite =
            this.potentialBiter.nibblesDone > 3 && Math.random() < 0.5;

          if (
            forceBite ||
            this.potentialBiter.nibblesDone >= this.potentialBiter.targetNibbles
          ) {
            biter = this.potentialBiter;
            this.potentialBiter = null;
          } else {
            this.targetInterest = 0.5;
          }
        }
      }

      if (biteResult.progress > 0 && !biteResult.biteSpeciesId) {
        this.targetInterest = Math.max(
          this.targetInterest,
          biteResult.progress,
        );
      }
    }

    if (this.activeFollower && isSpinning) {
      this.targetInterest = this.activeFollower.interest;
    } else if (isSpinning) {
      this.targetInterest = 0;
    }

    const lerpT = 1 - Math.pow(0.0001, deltaTime);
    this.smoothedInterest +=
      (this.targetInterest - this.smoothedInterest) * Math.min(1, lerpT * 1.0);

    if (this.targetInterest > 0 && !isSpinning) {
      const decayRate = this.potentialBiter ? 0.08 : 0.5;
      this.targetInterest = Math.max(
        0,
        this.targetInterest - decayRate * deltaTime,
      );
    }

    if (this.targetInterest === 0 && this.smoothedInterest < 0.01) {
      this.smoothedInterest = 0;
    }

    this.callbacks.onBiteProgress(this.smoothedInterest);

    if (
      this.playerReeling &&
      this.currentLureDepthM >=
        this.groundDepthM - SCENE_TIMING.bottomDetectionTolerance
    ) {
      if (
        this.snagMechanic.updateSpinningSnag({
          rigType: this.hookConfig?.rigType,
          isOnBottom: true,
          isMoving: true,
          deltaTime,
        })
      ) {
        this.phase = 'snagged';
        this.callbacks.onPhaseChange(this.phase);
        this.callbacks.onSnagStart?.();
        return this.smoothedInterest;
      }
    }

    if (biter) {
      biter.generateWeight();
      this.hookedFish = biter;

      const isSpinningBite =
        this.playerReeling && this.hookConfig?.rigType === 'spinning';

      if (isSpinningBite) {
        this.callbacks.onBite();
        this.waterRippleEffect.spawn(
          this.hookX,
          this.hookY,
          2.5,
          H,
          H * this.config.environment.waterBoundaryY,
        );
        this.hookFish();
      } else {
        this.phase = 'bite';
        this.callbacks.onBite();
        if (this.hookConfig?.rigType !== 'feeder') {
          this.waterRippleEffect.spawn(
            this.hookX,
            this.hookY,
            2.5,
            H,
            H * this.config.environment.waterBoundaryY,
          );
        }
        this.callbacks.onPhaseChange(this.phase);
      }
    }

    return this.smoothedInterest;
  }

  private syncEnvironmentDepth(): void {
    const W = this.app.screen.width;
    const H = this.app.screen.height;
    const waterY = H * this.config.environment.waterBoundaryY;
    const waterHeight = Math.max(1, H - waterY);

    const normX = Math.max(0, Math.min(1, this.hookX / W));
    const normY = Math.max(0, Math.min(1, (this.hookY - waterY) / waterHeight));

    this.groundDepthM = this.depthSystem.getDepthAt(normX, normY);

    if (this.hookedFish) {
      this.currentLureDepthM = this.hookedFish.depth;
    }

    this.callbacks.onLureDepthChange?.(
      this.currentLureDepthM,
      this.groundDepthM,
    );
    GameEvents.emit('lureDepth', {
      depth: this.currentLureDepthM,
      groundDepth: this.groundDepthM,
      x: this.hookX,
      canvasWidth: W,
    });
  }

  private updateBitePhase(): void {
    if (!this.hookedFish) return;

    const dtSec = this.updateCtx.deltaTime ?? 0.016;
    const fish = this.hookedFish;
    fish.stateTimer += dtSec;

    fish.biteDriftTimer -= dtSec;

    if (fish.biteDriftTimer <= 0) {
      const isPulling = Math.random() < 0.75;
      if (isPulling) {
        const speed = 15 + Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        fish.biteDriftX = Math.cos(angle) * speed;
        fish.biteDriftY = Math.sin(angle) * (speed * 0.3);
      } else {
        fish.biteDriftX = 0;
        fish.biteDriftY = 0;
      }
      fish.biteDriftTimer = 0.8 + Math.random() * 1.2;
    }

    fish.position.x += fish.biteDriftX * dtSec;
    fish.position.y += fish.biteDriftY * dtSec;

    this.hookX = fish.position.x;
    this.hookY = fish.position.y;

    this.syncEnvironmentDepth();

    if (this.hookedFish.stateTimer > this.hookedFish.biteTimeout) {
      this.hookedFish.setState(FISH_STATES.Idle);
      this.hookedFish.interestLevel = 0;
      this.hookedFish.hasLostInterest = true;
      this.hookedFish = null;
      this.phase = 'escaped';
      this.callbacks.onPhaseChange(this.phase, false);
      this.scheduleReset(SCENE_TIMING.escapedResetDelay);
    }
  }

  private updateReelingPhaseVisuals(
    W: number,
    H: number,
    deltaTime: number,
  ): void {
    if (!this.hookedFish) return;

    this.hookedFish.stateTimer += deltaTime;

    const reelingResult = updateReelingPhase(
      {
        hookedFish: this.hookedFish,
        tension: this.tension,
        playerReeling: this.playerReeling,
        playerRelaxing: this.playerRelaxing,
        deltaTime,
        canvasWidth: W,
        canvasHeight: H,
        rodConfig: this.rodConfig,
        reelConfig: this.reelConfig,
        lineConfig: this.lineConfig,
        hookConfig: this.hookConfig,
        accumRodWear: this.accumRodWear,
        accumReelWear: this.accumReelWear,
        castDistanceM: this.castDistanceM,
        activeBaitId: this.activeBait,
        lakeId: this.config.id,
        lakeName: this.config.name,
        trashChance: this.config.trashChance,
        waterBoundaryY: this.config.environment.waterBoundaryY,
        getDepthAt: (nx, ny) => this.depthSystem.getDepthAt(nx, ny),
        isPositionAllowed: (x, y) =>
          !!this.sectorSystem.getSectorAt(x / W, y / H),
      },
      this.callbacks,
    );

    this.tension = reelingResult.tension;
    this.accumRodWear = reelingResult.accumRodWear;
    this.accumReelWear = reelingResult.accumReelWear;
    this.hookX = reelingResult.hookX;
    this.hookY = reelingResult.hookY;

    this.syncEnvironmentDepth();

    if (reelingResult.newPhase) {
      this.phase = reelingResult.newPhase;

      if (this.accumRodWear > 0 || this.accumReelWear > 0) {
        this.callbacks.onGearDamaged?.(this.accumRodWear, this.accumReelWear);
        this.accumRodWear = 0;
        this.accumReelWear = 0;
      }

      this.callbacks.onPhaseChange(this.phase, this.phase === 'escaped');

      if (reelingResult.catchResult) {
        this.callbacks.onCatch(reelingResult.catchResult);
      }
      if (reelingResult.newPhase === 'broken') {
        this.scheduleReset(SCENE_TIMING.brokenResetDelay);
      } else if (reelingResult.newPhase === 'escaped') {
        this.scheduleReset(SCENE_TIMING.escapedResetDelay);
      }
    }
  }

  private getPreferredDepthRange(speciesId: string): {
    min: number;
    max: number;
  } {
    for (const s of this.config.fishSpawns.species || []) {
      if (s.speciesId === speciesId) return s.preferredDepthRange;
    }

    return { min: 0, max: 100 };
  }

  private drawStrikeHint(W: number, H: number): void {
    this.strikeHintGfx.clear();
    // Yellow overlay + glow around the edges
    this.strikeHintGfx.rect(0, 0, W, H);
    this.strikeHintGfx.fill({ color: 0xffcc00, alpha: 0.1 });
    this.strikeHintGfx.stroke({
      color: 0xffcc00,
      width: 24,
      alignment: 1,
    });
    this.strikeHintGfx.filters = [new BlurFilter({ strength: 30 })];
    this.strikeHintGfx.visible = false;
    this.strikeHintGfx.alpha = 0;
  }

  private updateStrikeHint(): void {
    const isBite = this.phase === 'bite';
    const targetAlpha = isBite
      ? 0.5 + Math.sin(Date.now() * 0.012) * 0.2 // slightly softer pulsing
      : 0;

    if (!isBite && this.strikeHintGfx.alpha < 0.01) {
      this.strikeHintGfx.visible = false;
      return;
    }

    this.strikeHintGfx.visible = true;
    this.strikeHintGfx.alpha += (targetAlpha - this.strikeHintGfx.alpha) * 0.1;
  }
}
