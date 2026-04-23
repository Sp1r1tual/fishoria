import type {
  IFishSpawnsConfig,
  IVec2,
  IAllowedCastArea,
} from '@/common/types';
import { pointInPolygon } from '@/game/utils/MathUtils';

interface ISector {
  nx: number;
  ny: number;
  depthM: number;
  availability: Record<string, number>;
}

export class SectorSystem {
  private grid: (ISector | null)[][] = [];
  private cols: number;
  private rows: number;
  private config: IFishSpawnsConfig;
  private allowedArea: IAllowedCastArea;
  private getDepthAt: (nx: number, ny: number) => number;

  private bounds = { minX: 0, maxX: 1, minY: 0, maxY: 1 };

  constructor(
    config: IFishSpawnsConfig,
    allowedArea: IAllowedCastArea,
    getDepthAt: (nx: number, ny: number) => number,
    canvasWidth: number,
    canvasHeight: number,
    gridResolution: number = 50,
  ) {
    this.config = config;
    this.allowedArea = allowedArea;
    this.getDepthAt = getDepthAt;

    this.calculateBounds();

    this.cols = gridResolution;

    const dx = this.bounds.maxX - this.bounds.minX;
    const dy = this.bounds.maxY - this.bounds.minY;

    const worldAspectRatio = (dx * canvasWidth) / (dy * canvasHeight);
    this.rows = Math.max(
      1,
      Math.floor(gridResolution / (worldAspectRatio || 1)),
    );

    this.buildGrid();
  }

  private calculateBounds() {
    if (this.allowedArea.type === 'polygon' && this.allowedArea.points) {
      const xs = this.allowedArea.points.map((p) => p.x);
      const ys = this.allowedArea.points.map((p) => p.y);
      this.bounds = {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      };
    } else if (
      this.allowedArea.type === 'circle' &&
      this.allowedArea.center &&
      this.allowedArea.radius
    ) {
      this.bounds = {
        minX: this.allowedArea.center.x - this.allowedArea.radius,
        maxX: this.allowedArea.center.x + this.allowedArea.radius,
        minY: this.allowedArea.center.y - this.allowedArea.radius,
        maxY: this.allowedArea.center.y + this.allowedArea.radius,
      };
    }
  }

  private buildGrid() {
    this.grid = [];
    const { minX, maxX, minY, maxY } = this.bounds;
    const dx = maxX - minX;
    const dy = maxY - minY;

    const cellW = dx / this.cols;
    const cellH = dy / this.rows;

    for (let c = 0; c < this.cols; c++) {
      this.grid[c] = [];
      for (let r = 0; r < this.rows; r++) {
        const x1 = minX + c * cellW;
        const y1 = minY + r * cellH;
        const x2 = x1 + cellW;
        const y2 = y1 + cellH;
        const cx = x1 + cellW * 0.5;
        const cy = y1 + cellH * 0.5;

        let isAllowed =
          this.isPointInAllowedArea({ x: x1, y: y1 }) ||
          this.isPointInAllowedArea({ x: x2, y: y1 }) ||
          this.isPointInAllowedArea({ x: x1, y: y2 }) ||
          this.isPointInAllowedArea({ x: x2, y: y2 }) ||
          this.isPointInAllowedArea({ x: cx, y: cy });

        if (
          !isAllowed &&
          this.allowedArea.type === 'polygon' &&
          this.allowedArea.points
        ) {
          for (const p of this.allowedArea.points) {
            if (p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2) {
              isAllowed = true;
              break;
            }
          }
        }

        if (!isAllowed) {
          this.grid[c][r] = null;
          continue;
        }

        const nx = cx;
        const ny = cy;

        const depthM = this.getDepthAt(nx, ny);
        const availability = this.calculateAvailabilityAt(depthM);

        this.grid[c][r] = {
          nx,
          ny,
          depthM,
          availability,
        };
      }
    }
  }

  private isPointInAllowedArea(pt: IVec2): boolean {
    if (this.allowedArea.type === 'polygon' && this.allowedArea.points) {
      return pointInPolygon(pt, this.allowedArea.points);
    }
    if (
      this.allowedArea.type === 'circle' &&
      this.allowedArea.center &&
      this.allowedArea.radius
    ) {
      const dx = pt.x - this.allowedArea.center.x;
      const dy = pt.y - this.allowedArea.center.y;
      return (
        dx * dx + dy * dy <= this.allowedArea.radius * this.allowedArea.radius
      );
    }
    return true;
  }

  private calculateAvailabilityAt(depthM: number): Record<string, number> {
    const results: Record<string, number> = {};

    const getDepthFactor = (range: { min: number; max: number }) => {
      if (depthM < range.min) {
        const gap = range.min - depthM;
        return Math.max(0, 1 - gap * 3.0);
      }

      if (depthM > range.max) {
        const gap = depthM - range.max;
        return Math.max(0, 1 - gap * 0.8);
      }

      return 1.0;
    };

    if (this.config.species) {
      for (const sp of this.config.species) {
        const df = getDepthFactor(sp.preferredDepthRange);
        if (df > 0) {
          results[sp.speciesId] =
            (results[sp.speciesId] || 0) + (sp.baseCatchChance || 0.1) * df;
        }
      }
    }

    for (const key in results) {
      results[key] = Math.min(1.0, results[key]);
    }

    return results;
  }

  public getSectorAt(nx: number, ny: number): ISector | null {
    const { minX, maxX, minY, maxY } = this.bounds;
    if (nx < minX || nx > maxX || ny < minY || ny > maxY) return null;

    const c = Math.floor(((nx - minX) / (maxX - minX)) * this.cols);
    const r = Math.floor(((ny - minY) / (maxY - minY)) * this.rows);

    if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
      const sector = this.grid[c][r];
      if (sector && this.isPointInAllowedArea({ x: nx, y: ny })) {
        return sector;
      }
    }
    return null;
  }

  public getBounds() {
    return this.bounds;
  }

  public getGrid(): (ISector | null)[][] {
    return this.grid;
  }

  public getConfigForSpecies(speciesId: string) {
    return this.config.species?.find((s) => s.speciesId === speciesId);
  }
}
