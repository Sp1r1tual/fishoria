import { Container, Graphics } from 'pixi.js';

interface IBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
  delay: number;
  perspectiveScale: number;
  active: boolean;
}

export class BubbleEffect {
  private static readonly POOL_SIZE = 64;
  private pool: IBubble[] = Array.from(
    { length: BubbleEffect.POOL_SIZE },
    () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      size: 0,
      alpha: 0,
      delay: 0,
      perspectiveScale: 1,
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
    amount: number = 3,
    perspectiveScale: number = 1.0,
  ): void {
    let spawned = 0;
    for (const b of this.pool) {
      if (spawned >= amount) break;
      if (b.active) continue;

      const size = 1.5;
      const life = 0.8 + Math.random() * 1.0;
      const delay = spawned * (0.3 + Math.random() * 0.4);

      b.x = x + (Math.random() - 0.5) * 35 * perspectiveScale;
      b.y = y + (Math.random() - 0.5) * 20 * perspectiveScale;
      b.vx = 0;
      b.vy = 0;
      b.life = life;
      b.maxLife = life;
      b.size = size;
      b.alpha = 0;
      b.delay = delay;
      b.perspectiveScale = perspectiveScale;
      b.active = true;
      spawned++;
    }
  }

  public update(dt: number, scale: number = 1.0): void {
    let hasActive = false;
    for (const b of this.pool) {
      if (b.active) {
        hasActive = true;
        break;
      }
    }

    if (!hasActive) {
      if (this.gfx.alpha > 0) this.gfx.clear();
      return;
    }

    this.gfx.clear();

    for (const b of this.pool) {
      if (!b.active) continue;

      if (b.delay > 0) {
        b.delay -= dt;
        continue;
      }

      b.life -= dt;

      const expansionSpeed = 10.0 * Math.pow(b.life / b.maxLife, 0.5);
      b.size += dt * expansionSpeed;

      const lifeRatio = b.life / b.maxLife;
      if (lifeRatio > 0.8) {
        b.alpha = (1 - lifeRatio) / 0.2;
      } else if (lifeRatio < 0.5) {
        b.alpha = Math.pow(lifeRatio / 0.5, 2.2);
      } else {
        b.alpha = 1.0;
      }

      if (b.life <= 0) {
        b.active = false;
        continue;
      }

      const currentSize = b.size * b.perspectiveScale * scale;
      const finalAlpha = b.alpha * 0.5;

      this.gfx.ellipse(b.x, b.y, currentSize, currentSize * 0.35);
      this.gfx.stroke({
        color: 0xffffff,
        alpha: finalAlpha,
        width: 1.0 * scale,
      });

      this.gfx.fill({
        color: 0xffffff,
        alpha: finalAlpha * 0.15,
      });
    }
  }

  public destroy(): void {
    this.gfx.destroy({ children: true });
  }
}
