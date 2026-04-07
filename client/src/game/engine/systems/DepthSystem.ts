import type { IDepthMapConfig } from '@/common/types';

export class DepthSystem {
  private config: IDepthMapConfig;
  private canvasHeight: number;

  // Cache for grid-based depth lookups (quantized to 1/100 precision)
  private depthCache = new Map<string, number>();

  constructor(config: IDepthMapConfig, canvasHeight: number) {
    this.config = config;
    this.canvasHeight = canvasHeight;
  }

  /** Convert canvas pixel Y → real depth in meters */
  pixelYToDepth(pixelY: number): number {
    const normY = Math.max(0, Math.min(1, pixelY / this.canvasHeight));
    return (
      this.config.minDepth +
      normY * (this.config.maxDepth - this.config.minDepth)
    );
  }

  /** Get depth at a normalized position from the depth map (cached for grid type) */
  getDepthAt(normX: number, normY: number): number {
    if (this.config.type === 'function' && this.config.fn) {
      // Function-based maps are not cached (may be dynamic)
      const t = Math.max(0, Math.min(1, this.config.fn(normX, normY)));
      return (
        this.config.minDepth + t * (this.config.maxDepth - this.config.minDepth)
      );
    }

    if (this.config.type === 'grid' && this.config.data) {
      // Quantize to 1/100 grid to avoid float key collisions while keeping good precision
      const key = `${(normX * 100) | 0},${(normY * 100) | 0}`;
      const cached = this.depthCache.get(key);
      if (cached !== undefined) return cached;

      const result = this.computeGridDepth(normX, normY);
      this.depthCache.set(key, result);
      return result;
    }

    return this.config.minDepth;
  }

  /** Bilinear interpolation on the depth grid */
  private computeGridDepth(normX: number, normY: number): number {
    const data = this.config.data;

    if (!data) throw new Error();

    const rows = data.length;
    const cols = data[0].length;

    const x = normX * (cols - 1);
    const y = normY * (rows - 1);

    const x1 = Math.floor(x);
    const x2 = Math.min(x1 + 1, cols - 1);
    const y1 = Math.floor(y);
    const y2 = Math.min(y1 + 1, rows - 1);

    const fx = x - x1;
    const fy = y - y1;

    const v11 = data[y1][x1];
    const v21 = data[y1][x2];
    const v12 = data[y2][x1];
    const v22 = data[y2][x2];

    const t =
      v11 * (1 - fx) * (1 - fy) +
      v21 * fx * (1 - fy) +
      v12 * (1 - fx) * fy +
      v22 * fx * fy;

    return (
      this.config.minDepth + t * (this.config.maxDepth - this.config.minDepth)
    );
  }

  /** Convert depth in meters → canvas pixel Y */
  depthToPixelY(depthM: number): number {
    const t =
      (depthM - this.config.minDepth) /
      Math.max(1, this.config.maxDepth - this.config.minDepth);
    return Math.max(0, Math.min(1, t)) * this.canvasHeight;
  }
}
