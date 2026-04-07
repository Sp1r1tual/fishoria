import { Application, Container, Assets } from 'pixi.js';

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
} from '@/common/types';

import { FishSpawnSystem } from '../systems/FishSpawnSystem';
import { DepthSystem } from '../systems/DepthSystem';
import { FishEntity } from '../entities/FishEntity';
import { RodEntity } from '../entities/RodEntity';
import { HookEntity } from '../entities/HookEntity';
import { DebugLayer } from '../systems/DebugLayer';
import { BackgroundRenderer } from '../rendering/BackgroundRenderer';
import { InputHandler } from '../input/InputHandler';
import { validateCast } from '@/game/domain/mechanics/CastingSystem';
import { detectBite } from '@/game/domain/mechanics/BiteDetection';
import { updateSpinningLure } from '@/game/domain/mechanics/SpinningLureSystem';
import { updateReelingPhase } from '@/game/domain/mechanics/ReelingSession';
import { computeRodVisuals } from '../rendering/RodVisualState';
import type { Fish } from '@/game/domain/fish/Fish';
import { FishState } from '@/game/domain/fish/FishState';
import { TimeManager } from '@/game/managers/TimeManager';
import { WeatherLayer } from '../systems/WeatherLayer';
import { GameEvents } from '../GameEvents';
import { SnagMechanic } from '@/game/domain/mechanics/SnagMechanic';

import {
  FISH_SPECIES,
  GROUNDBAITS,
  TIME_SYSTEM,
  HOOK_QUALITY,
  EARLY_HOOK,
  SCENE_TIMING,
  INTEREST_RATES,
  FISH_AI,
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
  private spawnSystem!: FishSpawnSystem;
  private depthSystem!: DepthSystem;
  private rod!: RodEntity;
  private hook!: HookEntity;
  private debugLayer!: DebugLayer;
  private inputHandler!: InputHandler;

  private phase: GamePhaseType = 'idle';
  private hookedFish: Fish | null = null;
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
  private pullCount = 0;
  private lastPlayerReeling = false;
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
  private weather: 'clear' | 'cloudy' | 'rain' = 'clear';

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
  private currentRetrieveSpeed: 'slow' | 'normal' | 'fast' = 'normal';
  private lastRetrieveType = '';

  private castDistanceM = 0;
  private availableLineM = 100;

  private resetDelayTimer: ReturnType<typeof setTimeout> | null = null;
  private schoolUpdateTimer = 0;

  private cachedObstacles: { x: number; y: number; radius: number }[] = [];
  private updateCtx: Partial<IUpdateContext> = {}; // Reusable context object to avoid GC

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
    // Pre-load all TOD backgrounds to ensure smooth transitions
    Object.values(this.config.timeOfDayConfig).forEach((t) =>
      urlsToLoad.add(t.bgImageUrl),
    );

    // Pre-load fish species images
    const allSpeciesConfigs = [
      ...(this.config.fishSpawns.species || []),
      ...(this.config.fishSpawns.zones || []).flatMap((z) => z.species),
    ];

    for (const spConfig of allSpeciesConfigs) {
      const imageUrl = FISH_SPECIES[spConfig.speciesId]?.imageUrl;
      if (imageUrl) urlsToLoad.add(imageUrl);
    }

    const bgUrl = this.config.timeOfDayConfig[this.timeOfDay].bgImageUrl;
    const otherUrls = Array.from(urlsToLoad).filter((u) => u !== bgUrl);

    // Block only on the starting background for fast startup
    await Assets.load(bgUrl);

    // Non-blocking load for all other assets (other times of day and fish)
    if (otherUrls.length > 0) {
      Assets.load(otherUrls);
    }

    const bgLayer = new Container();
    this.fishLayer = new Container();
    this.uiLayer = new Container();
    stage.addChild(bgLayer);
    stage.addChild(this.fishLayer);
    stage.addChild(this.uiLayer);

    this.bgRenderer = new BackgroundRenderer(bgLayer, this.config);
    this.bgRenderer.setBackgroundTexture(bgUrl);

    const W = app.renderer.width;
    const H = app.renderer.height;

    // Single construction — was incorrectly duplicated before
    this.depthSystem = new DepthSystem(this.config.depthMap, H);
    this.rod = new RodEntity(this.uiLayer);
    this.debugLayer = new DebugLayer(
      this.uiLayer,
      app,
      this.depthSystem,
      this.config,
    );
    this.hook = new HookEntity(this.fishLayer);

    this.spawnSystem = new FishSpawnSystem(
      this.config.fishSpawns,
      this.fishLayer,
      W,
      H,
      this.config.environment.waterBoundaryY,
      (nx, ny) => this.depthSystem.getDepthAt(nx, ny),
      this.config.allowedCastArea,
    );

    this.weatherLayer = new WeatherLayer(this.stage, app);

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
        const levels: ('slow' | 'normal' | 'fast')[] = [
          'slow',
          'normal',
          'fast',
        ];
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

    // Validate gear compatibility
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

    // Initial depth sync for the UI
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
    this.debugLayer.setVisible(isVisible);
    this.debugLayer.setLabelsVisible(this.debugActive);
    this.bgRenderer.setDebugVisible(this.debugActive); // Show obstacle red boxes only in debug
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

    if (this.phase !== 'idle') {
      this.callbacks.onResetCast?.(this.phase);
    }
    this.resetCast(true); // Silent reset to avoid double phase transition (idle -> waiting) in UI
    const target = validateCast(
      pixel,
      this.app.renderer.width,
      this.app.renderer.height,
      this.config.allowedCastArea,
      this.config.environment.waterBoundaryY,
    );
    if (!target) {
      this.callbacks.onPhaseChange('idle');
      return;
    }

    const W = this.app.renderer.width;
    const H = this.app.renderer.height;
    const waterY = H * this.config.environment.waterBoundaryY;
    const waterHeight = Math.max(1, H - waterY);

    // Calculate cast distance in meters: shore (bottom) = 0m, water boundary (top of water) = 100m
    const shoreY = H;
    const rawDistanceFraction = Math.max(
      0,
      Math.min(1, (shoreY - target.pixelY) / waterHeight),
    );
    let castDistanceM = rawDistanceFraction * 100;

    // Clamp cast distance to available line length
    if (castDistanceM > this.availableLineM) {
      castDistanceM = this.availableLineM;
      // Recalculate the actual pixel position for the clamped distance
      const clampedFraction = castDistanceM / 100;
      target.pixelY = shoreY - clampedFraction * waterHeight;
    }
    this.castDistanceM = castDistanceM;

    this.castX = target.pixelX;
    this.castY = target.pixelY;
    this.hookX = this.castX;
    this.hookY = this.castY;

    const normX = this.hookX / W;
    const normY = Math.max(0, Math.min(1, (this.hookY - waterY) / waterHeight));

    this.groundDepthM = this.depthSystem.getDepthAt(normX, normY);

    if (this.hookConfig?.rigType === 'feeder') {
      this.hookDepthM = this.groundDepthM;
      this.callbacks.onDepthChange(this.hookDepthM);
    }

    this.phase = 'waiting';
    this.timeSinceCast = 0;
    this.pullCount = 0;
    this.lastPlayerReeling = false;
    this.currentLureDepthM = 0.0; // Starts at surface
    this.callbacks.onCast?.();
    this.callbacks.onPhaseChange(this.phase);
  }

  private hookFish(): void {
    if (!this.hookedFish) return;

    // Better hooks increase the chance of successfully setting the hook when the player reacts
    const hookQuality = this.hookConfig?.quality ?? 0.1;
    const hookChance =
      HOOK_QUALITY.baseHookChance + hookQuality * HOOK_QUALITY.qualityBonus;

    if (Math.random() > hookChance) {
      // Failed to set the hook due to dull hook or bad luck
      this.phase = 'escaped';
      this.callbacks.onPhaseChange(this.phase, false);
      this.scheduleReset(SCENE_TIMING.escapedResetDelay);
      return;
    }

    this.hookedFish.setState(FishState.Hooked);
    this.phase = 'reeling';
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

    // Refresh rod visibility
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

    // Refresh gear readiness
    this.setGear(
      this.rodConfig,
      this.reelConfig,
      this.lineConfig,
      this.hookConfig,
    );
  }

  setWeather(type: 'clear' | 'cloudy' | 'rain'): void {
    this.weather = type;
    this.weatherLayer.setWeather(type);
    const W = this.app.renderer.width;
    const H = this.app.renderer.height;
    this.bgRenderer.drawBackground(W, H, this.timeOfDay, type);
  }

  setPlayerReeling(v: boolean): void {
    this.playerReeling = v;
    this.callbacks.onPlayerReeling?.(v);
  }

  setPlayerRelaxing(v: boolean): void {
    this.playerRelaxing = v;
  }

  setRetrieveSpeed(speed: 'slow' | 'normal' | 'fast'): void {
    this.currentRetrieveSpeed = speed;
  }

  setDepthExternal(depthM: number): void {
    const isSpinning = this.hookConfig?.rigType === 'spinning';
    const canChangeMidCast =
      isSpinning && (this.phase === 'waiting' || this.phase === 'reeling');

    if (
      (this.phase === 'idle' || canChangeMidCast) &&
      this.hookConfig?.rigType !== 'feeder'
    ) {
      this.hookDepthM = Math.max(0.1, depthM);
      this.callbacks.onDepthChange(this.hookDepthM);
    }
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

    for (const fish of this.spawnSystem.fish) {
      if (
        fish.interestLevel > maxInterest &&
        fish.state === FishState.Interested
      ) {
        maxInterest = fish.interestLevel;
        bestFish = fish;
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
        // Scared the fish away
        bestFish.setState(FishState.Escaping);
        bestFish.interestLevel = 0;
        bestFish.hasLostInterest = true;

        this.phase = 'escaped';
        this.callbacks.onPhaseChange(this.phase, false, true);
        this.scheduleReset(SCENE_TIMING.escapedResetDelay);
      }
    } else {
      // Nothing interested, just pull it out
      this.resetCast();
    }
  }

  resetCast(suppressPhaseEvent = false): void {
    if (!suppressPhaseEvent) {
      this.callbacks.onResetCast?.(this.phase);
    }
    this.clearResetTimer();

    // Check for snag if manually extracting from bottom
    if (
      !suppressPhaseEvent &&
      (this.phase === 'waiting' || this.phase === 'bite') &&
      this.isBaitOnBottom()
    ) {
      if (this.snagMechanic.checkStaticSnag(this.hookConfig?.rigType, true)) {
        this.phase = 'snagged';
        this.callbacks.onPhaseChange(this.phase);
        this.callbacks.onSnagStart?.();
        return;
      }
    }

    this.phase = 'idle';
    for (const fish of this.spawnSystem.fish) {
      fish.setState(FishState.Idle);
      fish.interestLevel = 0;
      fish.hasLostInterest = false;
    }
    this.hookedFish = null;
    this.playerRelaxing = false;
    this.callbacks.onTensionChange(0, false);
    if (!suppressPhaseEvent) {
      this.callbacks.onPhaseChange(this.phase);
    }
    this.pullCount = 0;
    this.lastPlayerReeling = false;
    this.smoothedInterest = 0;
    this.snagMechanic.reset();
    this.retrieveReelTime = 0;
    this.retrievePauseTime = 0;
    this.currentRetrieveType = 'steady';
    this.lastRetrieveType = '';

    if (this.accumRodWear > 0 || this.accumReelWear > 0) {
      this.callbacks.onGearDamaged?.(this.accumRodWear, this.accumReelWear);
      this.accumRodWear = 0;
      this.accumReelWear = 0;
    }
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
      this.callbacks.onLineBroke(this.castDistanceM);
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
    // 1. Throttled school density update
    this.schoolUpdateTimer += deltaTime;
    if (this.schoolUpdateTimer >= 20) {
      // Approx once per 0.3s
      this.schoolUpdateTimer = 0;
      this.updateSchoolDensity();
    }

    const isCast = this.phase !== 'idle';
    const W = this.app.renderer.width;
    const H = this.app.renderer.height;

    // Groundbait expiration
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

    // Update context object properties instead of re-allocating
    this.updateCtx.deltaTime = deltaTime;
    this.updateCtx.canvasWidth = W;
    this.updateCtx.canvasHeight = H;
    this.updateCtx.waterBoundaryY = this.config.environment.waterBoundaryY;
    this.updateCtx.baitPosition = isCast
      ? { x: this.hookX, y: this.hookY }
      : null;
    this.updateCtx.baitDepth = this.hookDepthM;
    this.updateCtx.timeOfDay = this.timeOfDay;
    this.updateCtx.weather = this.weather;
    this.updateCtx.obstacles = this.cachedObstacles;
    this.updateCtx.playerReeling = this.playerReeling;
    this.updateCtx.lakeMaxDepth = this.config.depthMap.maxDepth;
    this.updateCtx.getDepthAt = (nx: number, ny: number) =>
      this.depthSystem.getDepthAt(nx, ny);
    this.updateCtx.timeSinceCast = this.timeSinceCast;
    this.updateCtx.activeGroundbait = GROUNDBAITS[this.activeGroundbaitType];
    this.updateCtx.allowedCastArea = this.config.allowedCastArea;

    this.timeSinceCast += deltaTime / 60;

    // Day/Night cycle update
    if (this.updateTimeOfDay()) {
      const bgUrl = this.config.timeOfDayConfig[this.timeOfDay].bgImageUrl;
      this.bgRenderer.setBackgroundTexture(bgUrl);
      this.bgRenderer.drawBackground(W, H, this.timeOfDay, this.weather);
    }

    this.spawnSystem.update(deltaTime);

    // Retrieval technique detection
    if (this.phase === 'waiting' && this.hookConfig?.rigType === 'spinning') {
      const dtSec = deltaTime / 60;
      if (this.playerReeling) {
        this.retrieveReelTime += dtSec;
        this.retrievePauseTime = 0;
      } else {
        this.retrievePauseTime += dtSec;
        if (this.retrievePauseTime > 0.05) {
          // Small buffer
          this.retrieveReelTime = 0;
        }
      }

      // Detection logic
      if (this.retrieveReelTime > 1.5) {
        this.currentRetrieveType = 'steady';
      } else if (
        this.retrieveReelTime > 0.3 &&
        this.retrieveReelTime < 1.2 &&
        this.retrievePauseTime > 0.2 &&
        this.retrievePauseTime < 1.0
      ) {
        this.currentRetrieveType = 'stop-and-go';
      } else if (
        this.retrieveReelTime > 0.05 &&
        this.retrieveReelTime < 0.25 &&
        this.retrievePauseTime > 0.05 &&
        this.retrievePauseTime < 0.3
      ) {
        this.currentRetrieveType = 'jigging';
      }

      if (this.currentRetrieveType !== this.lastRetrieveType) {
        this.lastRetrieveType = this.currentRetrieveType;
      }
    } else {
      this.currentRetrieveType = 'steady';
      this.retrieveReelTime = 0;
      this.retrievePauseTime = 0;
    }

    // Hide debug/snag info if fish is biting or hooked
    const isFishHookedOrBiting =
      this.phase === 'bite' || this.phase === 'reeling';

    this.debugLayer.update();
    this.debugLayer.updateSnag(
      isFishHookedOrBiting ? 0 : this.snagMechanic.getSnagProgress(),
      this.hookX,
      this.hookY,
      isCast,
    );

    // Update Groundbait Debug Visualization
    if (this.activeGroundbaitType !== 'none') {
      const gbCfg = GROUNDBAITS[this.activeGroundbaitType];
      if (gbCfg) {
        const baseRadius = 25; // Matching ATTRACTION.baseAttractionRange
        const radiusM = baseRadius * (gbCfg.attractionRadiusScale || 1.0);
        this.debugLayer.updateGroundbait(
          this.hookX,
          this.hookY,
          radiusM,
          isCast,
        );
      }
    }
    this.weatherLayer.update(deltaTime, this.timeOfDay);

    for (const { fish, entity } of this.spawnSystem.entities) {
      fish.update(this.updateCtx as IUpdateContext);

      let intensity = 0;
      if (this.echoSounderActive && !isFishHookedOrBiting) {
        const isSpinning = this.hookConfig?.rigType === 'spinning';
        if (isCast) {
          const dx = fish.position.x - this.hookX;
          const dy = fish.position.y - this.hookY;
          const distSq = dx * dx + dy * dy;
          const radius = (isSpinning ? 200 : 350) * (W / 800);

          intensity = Math.max(0, 1 - Math.sqrt(distSq) / radius);

          // Interested fish "glow" brighter on the sonar
          if (
            fish.state === FishState.Interested ||
            fish.state === FishState.Biting
          ) {
            intensity = Math.max(intensity, 0.6 + fish.interestLevel * 0.4);
          }
        } else {
          // Passive scanning when not casting
          intensity = 0.25;
        }
      }

      const isThisHookedFish = this.hookedFish === fish;

      (entity as FishEntity).update(deltaTime, {
        debug: isFishHookedOrBiting
          ? isThisHookedFish && this.debugActive
          : this.debugActive,
        echo: isFishHookedOrBiting ? false : this.echoSounderActive,
        isCast,
        intensity,
      });
    }

    let maxInterest = 0;

    if (isCast && this.phase === 'waiting') {
      maxInterest = this.updateWaitingPhase(W, H, deltaTime);
    } else if (this.phase === 'bite' && this.hookedFish) {
      this.updateBitePhase();
    } else if (this.phase === 'reeling' && this.hookedFish) {
      this.updateReelingPhaseVisuals(W, H, deltaTime);
    }

    this.totalTime += deltaTime;

    // ── Visual updates ──
    const renderScale = W < 768 ? 0.5 : W < 1045 ? 0.7 : 1.0;

    this.hook.update({
      x: this.hookX,
      y: this.hookY,
      baitName: this.activeBaitName,
      isCast,
      phase: this.phase,
      time: this.totalTime,
      castX: this.castX,
      castY: this.castY,
      maxInterest,
      hookDepthM: this.hookDepthM,
      groundDepthM: this.groundDepthM,
      scale: renderScale,
      rigType: this.hookConfig?.rigType,
      currentDepthM:
        this.hookConfig?.rigType === 'spinning'
          ? this.currentLureDepthM
          : Math.min(this.hookDepthM, this.groundDepthM),
      debugActive: this.debugActive,
      escapeProgress: this.tension.escapeProgress,
    });

    const rodVisuals = computeRodVisuals({
      phase: this.phase,
      isCast,
      hookX: this.hookX,
      hookY: this.hookY,
      castX: this.castX,
      castY: this.castY,
      canvasHeight: H,
      renderScale,
      tension: this.tension,
      hookedFish: this.hookedFish,
      isSpinning: this.hookConfig?.rigType === 'spinning',
      playerReeling: this.playerReeling,
      hookDepthM: this.hookDepthM,
      groundDepthM: this.groundDepthM,
      currentLureDepthM: this.currentLureDepthM,
      rigType: this.hookConfig?.rigType,
      maxInterest,
      time: this.totalTime,
      timeSinceCast: this.timeSinceCast,
    });

    const lerpT = 1 - Math.pow(0.001, deltaTime / 60);
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

    const scaleX = newW / oldW;
    const scaleY = newH / oldH;

    this.hookX *= scaleX;
    this.hookY *= scaleY;
    this.castX *= scaleX;
    this.castY *= scaleY;

    this.spawnSystem.resize(newW, newH);
    this.depthSystem = new DepthSystem(this.config.depthMap, newH);
    this.debugLayer.resize();
    this.weatherLayer.resize();

    this.bgRenderer.drawBackground(newW, newH, this.timeOfDay);
    this.bgRenderer.drawObstacles(newW, newH);
    this.updateCachedObstacles(newW, newH);

    this.lastW = newW;
    this.lastH = newH;
  }

  private updateCachedObstacles(W: number, H: number): void {
    this.cachedObstacles = this.config.obstacles
      .filter((o) => o.type === 'circle' && o.radius != null)
      .map((o) => ({
        x: o.position.x * W,
        y: o.position.y * H,
        radius: (o.radius ?? 0.03) * W,
      }));
  }

  // ─── Destroy ───────────────────────────────────────────────────────────────
  destroy(): void {
    this.clearResetTimer();
    this.inputHandler.destroy();
    this.spawnSystem.destroy();
    this.rod.destroy();
    this.hook.destroy();
    this.debugLayer.destroy();
    this.weatherLayer.destroy();
  }

  setDebugVisible(visible: boolean): void {
    this.debugActive = visible;
    this.updateLayerVisibility();
    GameEvents.emit('debug', visible);
  }
  private updateWaitingPhase(W: number, H: number, deltaTime: number): number {
    if (
      this.playerReeling &&
      !this.lastPlayerReeling &&
      this.hookConfig?.rigType === 'spinning'
    ) {
      this.pullCount++;
    }
    this.lastPlayerReeling = this.playerReeling;

    if (this.hookConfig?.rigType === 'spinning') {
      const speedMult =
        INTEREST_RATES.spinning.speedMultipliers[this.currentRetrieveSpeed] ??
        1.0;

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
        reelSpeed: (this.reelConfig?.speed ?? 0.5) * speedMult,
        depthSystem: this.depthSystem,
      });

      this.hookY = lureState.hookY;
      this.castX = lureState.castX;
      this.castY = lureState.castY;
      this.currentLureDepthM = lureState.currentLureDepthM;
      this.groundDepthM = lureState.groundDepthM;

      if (lureState.reachedShore) {
        this.resetCast();
      }

      // Lure depth info is no longer shown on the tension bar.
    }

    const { biter, progress } = detectBite({
      fish: this.spawnSystem.fish,
      baitType: this.activeBait,
      hookPixelX: this.hookX,
      hookPixelY: this.hookY,
      canvasHeight: H,
      timeOfDay: this.timeOfDay,
      visibility: this.config.environment.visibility,
      deltaTime,
      hookDepthM:
        this.hookConfig?.rigType === 'spinning'
          ? this.currentLureDepthM
          : Math.min(this.hookDepthM, this.groundDepthM),
      isAnyFishHooked: false,
      timeSinceCast: this.timeSinceCast,
      weather: this.weather,
      rigType: this.hookConfig?.rigType,
      isMoving: this.playerReeling && this.hookConfig?.rigType === 'spinning',
      isOnBottom: this.isBaitOnBottom(),
      pullCount: this.pullCount,
      retrieveType: this.currentRetrieveType,
      retrieveSpeed: this.currentRetrieveSpeed,
    });
    const maxInterest = 1 - progress;
    const lerpT = 1 - Math.pow(0.001, deltaTime / 60);
    this.smoothedInterest +=
      (maxInterest - this.smoothedInterest) * Math.min(1, lerpT * 10.0);

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
      this.phase = 'bite';
      this.callbacks.onBite();
      this.callbacks.onPhaseChange(this.phase);

      if (this.playerReeling && this.hookConfig?.rigType === 'spinning') {
        this.hookFish();
      }
    }

    return this.smoothedInterest;
  }

  private updateBitePhase(): void {
    if (!this.hookedFish) return;
    this.hookX = this.hookedFish.position.x;
    this.hookY = this.hookedFish.position.y;
    this.castX = this.hookX;
    this.castY = this.hookY;

    if (this.hookedFish.stateTimer > this.hookedFish.biteTimeout) {
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
        spawnSystem: this.spawnSystem,
        waterBoundaryY: this.config.environment.waterBoundaryY,
        getDepthAt: (nx, ny) => this.depthSystem.getDepthAt(nx, ny),
      },
      this.callbacks,
    );

    this.tension = reelingResult.tension;
    this.accumRodWear = reelingResult.accumRodWear;
    this.accumReelWear = reelingResult.accumReelWear;
    this.hookX = reelingResult.hookX;
    this.hookY = reelingResult.hookY;

    if (reelingResult.newPhase) {
      this.phase = reelingResult.newPhase;

      // Flush remaining wear before triggering any events so refs are fully updated
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

  private updateSchoolDensity(): void {
    const fish = this.spawnSystem.fish;
    if (fish.length < 2) return;

    // School radius for visual counting
    const radiusSq = 120 * 120;
    const sepRadiusSq = FISH_AI.separation.radius ** 2;

    for (let i = 0; i < fish.length; i++) {
      const f1 = fish[i];
      let neighbors = 0;
      let sx = 0;
      let sy = 0;

      for (let j = 0; j < fish.length; j++) {
        if (i === j) continue;
        const f2 = fish[j];
        const dx = f1.position.x - f2.position.x;
        const dy = f1.position.y - f2.position.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < radiusSq) {
          neighbors++;
          // If it's very close, apply separation repulsion
          if (dSq < sepRadiusSq && dSq > 0) {
            const d = Math.sqrt(dSq);
            // Force is inverse to distance
            const push =
              (FISH_AI.separation.radius - d) / FISH_AI.separation.radius;
            sx += (dx / d) * push;
            sy += (dy / d) * push;
          }
        }
      }
      f1.nearbyFishCount = neighbors;
      f1.separationForce.x = sx;
      f1.separationForce.y = sy;
    }
  }
}
