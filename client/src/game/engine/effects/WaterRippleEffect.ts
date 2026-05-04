import { Container, Graphics } from 'pixi.js';

import { SCREEN_THRESHOLDS } from '@/game/utils/ScreenUtils';

interface IRipple {
  x: number;
  y: number;
  radius: number;
  speed: number;
  maxRadius: number;
  alpha: number;
  perspectiveY: number;
  lineWidth: number;
  active: boolean;
}

export class WaterRippleEffect {
  private static readonly POOL_SIZE = 32;
  private pool: IRipple[] = Array.from(
    { length: WaterRippleEffect.POOL_SIZE },
    () => ({
      x: 0,
      y: 0,
      radius: 0,
      speed: 0,
      maxRadius: 0,
      alpha: 0,
      perspectiveY: 1,
      lineWidth: 1.5,
      active: false,
    }),
  );
  private gfx: Graphics;

  constructor(parent: Container) {
    this.gfx = new Graphics();
    parent.addChild(this.gfx);
  }

  public spawn(
    x: number,
    y: number,
    intensity: number = 1.0,
    canvasH: number = 1,
    waterY: number = 0,
  ): void {
    const waterHeight = Math.max(1, canvasH - waterY);
    const normalizedDepth = Math.max(
      0,
      Math.min(1, (y - waterY) / waterHeight),
    );

    const perspectiveY = 0.3 + normalizedDepth * 0.15;
    const distanceScale = 0.65 + normalizedDepth * 0.35;

    const screenScale = Math.max(
      0.35,
      Math.min(1.0, canvasH / SCREEN_THRESHOLDS.TABLET),
    );
    const finalScale = screenScale * distanceScale;

    // Find an inactive ripple from the pool
    const r = this.pool.find((rp) => !rp.active);
    if (r) {
      r.x = x;
      r.y = y;
      r.radius = 0;
      r.speed = (35 + intensity * 20) * finalScale;
      r.maxRadius = (10 + intensity * 20) * finalScale;
      r.alpha = 0.6;
      r.perspectiveY = perspectiveY;
      r.lineWidth = 1.5 * finalScale;
      r.active = true;
    }
  }

  public update(dt: number): void {
    let hasActive = false;
    for (const r of this.pool) {
      if (r.active) {
        hasActive = true;
        break;
      }
    }

    if (!hasActive) {
      this.gfx.clear();
      return;
    }

    this.gfx.clear();

    for (const r of this.pool) {
      if (!r.active) continue;

      r.radius += r.speed * dt;

      if (r.radius < 0) continue;

      const progress = r.radius / r.maxRadius;
      const currentAlpha = r.alpha * Math.max(0, 1 - progress * progress);

      if (r.radius >= r.maxRadius || currentAlpha <= 0.01) {
        r.active = false;
        continue;
      }

      const rx = r.radius;
      const ry = r.radius * r.perspectiveY;

      this.gfx.ellipse(r.x, r.y, rx, ry);
    }

    this.gfx.stroke({
      color: 0xffffff,
      alpha: 0.4,
      width: 1.2,
    });
  }

  public destroy(): void {
    this.gfx.destroy({ children: true });
  }
}
