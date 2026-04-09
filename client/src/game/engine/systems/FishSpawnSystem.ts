import { Container } from 'pixi.js';

import type {
  ISpawnZone,
  IFishSpawnsConfig,
  ISpawnedFish,
} from '@/common/types';

import { Fish } from '@/game/domain/fish/Fish';
import { FishState } from '@/game/domain/fish/FishState';
import { FishEntity } from '../entities/FishEntity';
import { pointInPolygon } from '@/game/utils/MathUtils';
import type { IAllowedCastArea, IVec2 } from '@/common/types';

import { FISH_SPECIES, FISH_SPAWN } from '@/common/configs/game';

/** Pre-computed pixel bounds for a spawn zone */
interface IZoneBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class FishSpawnSystem {
  private spawned: ISpawnedFish[] = [];
  private pool: ISpawnedFish[] = [];
  private fishCache: Fish[] = []; // Cached array — invalidated on add/remove
  private spawnAccum = 0;

  private config: IFishSpawnsConfig;
  private parent: Container;
  private canvasWidth: number;
  private canvasHeight: number;
  private waterBoundaryY: number;
  private allowedCastArea: IAllowedCastArea;
  private getDepthAt: (nx: number, ny: number) => number;

  /** Cached pixel bounds per zone id — avoids recomputing min/max on every spawn attempt */
  private zoneBoundsCache = new Map<string, IZoneBounds>();

  constructor(
    config: IFishSpawnsConfig,
    parent: Container,
    canvasWidth: number,
    canvasHeight: number,
    waterBoundaryY: number,
    getDepthAt: (nx: number, ny: number) => number,
    allowedCastArea: IAllowedCastArea,
  ) {
    this.config = config;
    this.parent = parent;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.waterBoundaryY = waterBoundaryY;
    this.getDepthAt = getDepthAt;
    this.allowedCastArea = allowedCastArea;

    this.prebuildZoneBounds();
    this.initialSpawn();
  }

  /**
   * Pre-compute pixel bounding boxes for all polygon zones.
   * Called once on construction and after resize.
   */
  private prebuildZoneBounds(): void {
    this.zoneBoundsCache.clear();
    const W = this.canvasWidth;
    const H = this.canvasHeight;

    for (const zone of this.config.zones || []) {
      if (
        zone.type === 'polygon' &&
        zone.points != null &&
        zone.points.length >= 2
      ) {
        const xs = zone.points.map((p) => p.x * W);
        const ys = zone.points.map((p) => p.y * H);
        this.zoneBoundsCache.set(zone.id, {
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...ys),
          maxY: Math.max(...ys),
        });
      }
    }
  }

  /**
   * Spawn initial fish in small async batches so we don't block the main thread.
   * Uses requestIdleCallback when available, falls back to setTimeout.
   */
  private initialSpawn(): void {
    const initialCount = Math.floor(
      this.config.maxFishCount * FISH_SPAWN.initialSpawnFraction,
    );

    let spawned = 0;
    const BATCH_SIZE = 10;

    const runBatch = () => {
      const end = Math.min(spawned + BATCH_SIZE, initialCount);
      while (spawned < end) {
        this.spawnOne();
        spawned++;
      }
      if (spawned < initialCount) {
        this.scheduleBatch(runBatch);
      }
    };

    this.scheduleBatch(runBatch);
  }

  private scheduleBatch(fn: () => void): void {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(fn, { timeout: 500 });
    } else {
      setTimeout(fn, 0);
    }
  }

  private pickZone(): ISpawnZone | undefined {
    if (!this.config.zones || this.config.zones.length === 0) return undefined;
    const total = this.config.zones.reduce((s, z) => s + z.spawnWeight, 0);
    let r = Math.random() * total;
    for (const zone of this.config.zones) {
      r -= zone.spawnWeight;
      if (r <= 0) return zone;
    }
    return this.config.zones[0];
  }

  private spawnOne(): void {
    if (this.spawned.length >= this.config.maxFishCount) {
      // Pause rotation if ANY fish is currently interacting with the player
      const isAnyFishEngaged = this.spawned.some(
        ({ fish }) =>
          fish.state === FishState.Interested ||
          fish.state === FishState.Biting ||
          fish.state === FishState.Hooked,
      );

      if (isAnyFishEngaged) {
        return; // Pause auto-deletion to not disrupt gameplay
      }

      // Rotation logic: remove the oldest fish to make room for a new one
      const oldest = this.spawned[0];
      if (oldest) {
        this.removeFish(oldest.fish);
      } else {
        return; // Should not happen
      }
    }

    const zone = this.pickZone();
    const speciesList = zone ? zone.species : this.config.species;

    if (!speciesList || speciesList.length === 0) return;

    // Weighted species selection
    const totalWeight = speciesList.reduce((s, spec) => s + spec.weight, 0);
    let r = Math.random() * totalWeight;
    let selected = speciesList[0];
    for (const spec of speciesList) {
      r -= spec.weight;
      if (r <= 0) {
        selected = spec;
        break;
      }
    }

    const config = FISH_SPECIES[selected.speciesId];
    if (!config) return;

    const prefDepth = selected.preferredDepthRange;
    const targetDepth =
      prefDepth.min + Math.random() * (prefDepth.max - prefDepth.min);

    let bestX = 0,
      bestY = 0;
    let minDifference = Infinity;

    for (let attempts = 0; attempts < FISH_SPAWN.maxSpawnAttempts; attempts++) {
      const pos = this.randomPosInZone(zone);
      const testNx = pos.x / this.canvasWidth;
      const testNy = Math.max(
        0,
        Math.min(
          1,
          (pos.y - this.canvasHeight * this.waterBoundaryY) /
            (this.canvasHeight * (1 - this.waterBoundaryY)),
        ),
      );

      const floorDepth = this.getDepthAt(testNx, testNy);

      // Check if inside allowedCastArea (using screen-normalized coordinates)
      const pt: IVec2 = { x: testNx, y: pos.y / this.canvasHeight };
      let isInside = false;
      if (
        this.allowedCastArea.type === 'polygon' &&
        this.allowedCastArea.points
      ) {
        isInside = pointInPolygon(pt, this.allowedCastArea.points);
      } else if (
        this.allowedCastArea.type === 'circle' &&
        this.allowedCastArea.center &&
        this.allowedCastArea.radius != null
      ) {
        const dx = pt.x - this.allowedCastArea.center.x;
        const dy = pt.y - this.allowedCastArea.center.y;
        isInside = dx * dx + dy * dy <= this.allowedCastArea.radius ** 2;
      } else {
        isInside = true; // Fallback if no specific area defined
      }

      if (
        isInside &&
        ((floorDepth >= prefDepth.min - FISH_SPAWN.spawnDepthTolerance &&
          floorDepth <= prefDepth.max + FISH_SPAWN.spawnDepthTolerance) ||
          attempts > FISH_SPAWN.maxSpawnAttempts * 0.8) // Become more lenient in very late attempts
      ) {
        bestX = pos.x;
        bestY = pos.y;
        break;
      }

      // If we haven't found a perfect spot, keep track of the one with best depth,
      // BUT ONLY if it is inside the allowed area.
      const diff = Math.abs(floorDepth - targetDepth);
      if (isInside && diff < minDifference) {
        minDifference = diff;
        bestX = pos.x;
        bestY = pos.y;
      }
    }

    if (bestX === 0 && bestY === 0) {
      // Last resort: find ANY position inside the zone that is also inside allowedCastArea
      for (let i = 0; i < 20; i++) {
        const fallback = this.randomPosInZone(zone);
        const pt = {
          x: fallback.x / this.canvasWidth,
          y: fallback.y / this.canvasHeight,
        };
        if (pointInPolygon(pt, this.allowedCastArea.points || [])) {
          bestX = fallback.x;
          bestY = fallback.y;
          break;
        }
      }

      // If still nothing, use pure fallback (should be rare)
      if (bestX === 0) {
        const fallback = this.randomPosInZone(zone);
        bestX = fallback.x;
        bestY = fallback.y;
      }
    }

    let fish: Fish;
    let entity: FishEntity;
    const pooled = this.pool.pop();

    if (pooled) {
      fish = pooled.fish;
      entity = pooled.entity;
      fish.reset(config, bestX, bestY, prefDepth, selected.weightRange);
      entity.reset(fish);
    } else {
      fish = new Fish(config, bestX, bestY, prefDepth, selected.weightRange);
      entity = new FishEntity(fish, this.parent);
    }

    this.spawned.push({ fish, entity });
    this.fishCache.push(fish); // Keep cache in sync
  }

  /** Biased random that pushes values towards 0 and 1 (S-curve) */
  private biasedRandom(power = 1.2): number {
    const r = Math.random();
    return r < 0.5
      ? Math.pow(r * 2, power) / 2
      : 1 - Math.pow((1 - r) * 2, power) / 2;
  }

  /**
   * Returns a random position inside the zone.
   * Uses pre-cached bounding boxes for polygon zones instead of recomputing min/max each call.
   */
  private randomPosInZone(zone: ISpawnZone | undefined): {
    x: number;
    y: number;
  } {
    const W = this.canvasWidth;
    const H = this.canvasHeight;

    if (zone && zone.type === 'circle' && zone.center && zone.radius != null) {
      const angle = Math.random() * Math.PI * 2;
      // Pushing radius towards edges as well for circles
      const r = Math.pow(Math.random(), 0.7) * zone.radius;
      return {
        x: (zone.center.x + Math.cos(angle) * r) * W,
        y: (zone.center.y + Math.sin(angle) * r) * H,
      };
    }

    if (
      zone &&
      zone.type === 'polygon' &&
      zone.points != null &&
      zone.points.length >= 2
    ) {
      // Use pre-built bounds cache
      const bounds = this.zoneBoundsCache.get(zone.id);
      if (bounds) {
        return {
          x: bounds.minX + this.biasedRandom() * (bounds.maxX - bounds.minX),
          y: bounds.minY + this.biasedRandom() * (bounds.maxY - bounds.minY),
        };
      }

      // Fallback: compute on the fly (should not happen after prebuildZoneBounds)
      const xs = zone.points.map((p) => p.x * W);
      const ys = zone.points.map((p) => p.y * H);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      return {
        x: minX + this.biasedRandom() * (maxX - minX),
        y: minY + this.biasedRandom() * (maxY - minY),
      };
    }

    // Default: random anywhere in the lake (below waterBoundaryY)
    return {
      x: this.biasedRandom() * W,
      y:
        (this.waterBoundaryY +
          this.biasedRandom() * (1 - this.waterBoundaryY)) *
        H,
    };
  }

  /**
   * deltaTime here is Pixi's normalized ticker delta (1.0 = one frame at 60 fps).
   * To convert to seconds: deltaTime / 60.
   * spawnRatePerSecond is fish per second, so:
   *   accumulator += spawnRatePerSecond * (deltaTime / 60)
   *
   * Previously the code multiplied by an extra 0.016 which was incorrect
   * (0.016 ≈ 1/60, so it was effectively dividing by 60 twice).
   */
  update(deltaTime: number): void {
    this.spawnAccum += this.config.spawnRatePerSecond * (deltaTime / 60);
    while (this.spawnAccum >= 1) {
      this.spawnOne();
      this.spawnAccum -= 1;
    }
  }

  get fish(): Fish[] {
    return this.fishCache;
  }

  get entities(): ISpawnedFish[] {
    return this.spawned;
  }

  removeFish(fish: Fish): void {
    const idx = this.spawned.findIndex((s) => s.fish === fish);
    if (idx !== -1) {
      const removed = this.spawned.splice(idx, 1)[0];
      this.fishCache.splice(idx, 1); // Keep cache in sync
      if (removed) {
        this.pool.push(removed);
      }
    }
  }

  resize(newWidth: number, newHeight: number): void {
    const scaleX = newWidth / this.canvasWidth;
    const scaleY = newHeight / this.canvasHeight;

    for (const { fish } of this.spawned) {
      fish.position.x *= scaleX;
      fish.position.y *= scaleY;
      if (fish.migrationTarget) {
        fish.migrationTarget.x *= scaleX;
        fish.migrationTarget.y *= scaleY;
      }
    }

    this.canvasWidth = newWidth;
    this.canvasHeight = newHeight;

    // Rebuild zone bounds for new canvas dimensions
    this.prebuildZoneBounds();
  }

  destroy(): void {
    this.spawned.forEach((s) => s.entity.destroy());
    this.spawned = [];
  }
}
