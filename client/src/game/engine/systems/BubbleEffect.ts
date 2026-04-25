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
}

export class BubbleEffect {
  private bubbles: IBubble[] = [];
  private gfx: Graphics;

  constructor(parent: Container) {
    this.gfx = new Graphics();
    parent.addChild(this.gfx);
  }

  public spawn(x: number, y: number, amount: number = 3): void {
    for (let i = 0; i < amount; i++) {
      const size = 0.3;
      const life = 0.8 + Math.random() * 1.0;

      const delay = i * (0.3 + Math.random() * 0.4);

      this.bubbles.push({
        x: x + (Math.random() - 0.5) * 35,
        y: y + (Math.random() - 0.5) * 20,

        vx: 0,
        vy: 0,
        life: life,
        maxLife: life,
        size: size,
        alpha: 0,
        delay: delay,
      });
    }
  }

  public update(dt: number): void {
    if (this.bubbles.length === 0) {
      if (this.gfx.alpha > 0) this.gfx.clear();
      return;
    }

    this.gfx.clear();

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];

      if (b.delay > 0) {
        b.delay -= dt;
        continue;
      }

      b.life -= dt;

      b.size += dt * 3.5;

      if (b.life > b.maxLife - 0.2) {
        b.alpha = (b.maxLife - b.life) / 0.2;
      } else {
        b.alpha = b.life / (b.maxLife - 0.2);
      }

      if (b.life <= 0) {
        this.bubbles[i] = this.bubbles[this.bubbles.length - 1];
        this.bubbles.pop();
        continue;
      }

      this.gfx.ellipse(b.x, b.y, b.size, b.size * 0.35);
      this.gfx.stroke({ color: 0xffffff, alpha: b.alpha * 0.5, width: 1.0 });
    }
  }

  public destroy(): void {
    this.gfx.destroy({ children: true });
  }
}
