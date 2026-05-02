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
}

export class WaterRippleEffect {
  private ripples: IRipple[] = [];
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

    const perspectiveY = 0.15 + normalizedDepth * 0.3;

    const screenScale = Math.max(
      0.35,
      Math.min(1.0, canvasH / SCREEN_THRESHOLDS.TABLET),
    );
    const ringCount = 1;

    for (let i = 0; i < ringCount; i++) {
      const delay = i * 0.12;
      this.ripples.push({
        x,
        y,
        radius: -delay * 80 * intensity * screenScale,
        speed: (35 + intensity * 20) * screenScale,
        maxRadius: (10 + intensity * 20) * screenScale,
        alpha: 0.6,
        perspectiveY,
        lineWidth: 1.5 * screenScale,
      });
    }
  }

  public update(dt: number): void {
    if (this.ripples.length === 0) {
      return;
    }

    this.gfx.clear();

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];

      r.radius += r.speed * dt;

      if (r.radius < 0) continue;

      const progress = r.radius / r.maxRadius;
      const currentAlpha = r.alpha * Math.max(0, 1 - progress * progress);

      if (r.radius >= r.maxRadius || currentAlpha <= 0.01) {
        this.ripples.splice(i, 1);
        continue;
      }

      const rx = r.radius;
      const ry = r.radius * r.perspectiveY;

      this.gfx.ellipse(r.x, r.y, rx, ry);
      this.gfx.stroke({
        color: 0xffffff,
        alpha: currentAlpha,
        width: r.lineWidth * (1 - progress * 0.5),
      });
    }
  }

  public destroy(): void {
    this.gfx.destroy({ children: true });
    this.ripples = [];
  }
}
