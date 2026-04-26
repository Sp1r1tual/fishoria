import { Container, Graphics } from 'pixi.js';

interface IParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  alpha: number;
  color: number;
}

export class GroundbaitEffect {
  private particles: IParticle[] = [];
  private gfx: Graphics;
  private readonly PALETTE = [
    0x5d4037, // Dark Brown
    0x8d6e63, // Soft Brown
    0x4e342e, // Deep Umber
    0x795548, // Terra Cotta
    0x3e2723, // Black Coffee
    0xd7ccc8, // Sand/Beige
  ];

  constructor(parent: Container) {
    this.gfx = new Graphics();
    parent.addChild(this.gfx);
  }

  public spawn(W: number, H: number): void {
    const isSmallScreen = W < 1000;
    const scale = isSmallScreen ? 0.65 : 1.0;
    const count = isSmallScreen ? 50 : 75;

    for (let i = 0; i < count; i++) {
      const color =
        this.PALETTE[Math.floor(Math.random() * this.PALETTE.length)];

      this.particles.push({
        x: W / 2 + (Math.random() - 0.5) * (40 * scale),
        y: H - 15,
        vx: (Math.random() - 0.5) * (50 * scale),
        vy: (-12 - Math.random() * 38) * scale,
        life: 1.0,
        size: (1.0 + Math.random() * 1.5) * scale,
        alpha: 1.0,
        color,
      });
    }
  }

  public update(dt: number): void {
    if (this.particles.length === 0) {
      if (this.gfx.alpha > 0) this.gfx.clear();
      return;
    }

    this.gfx.clear();
    const frameScalar = dt * 60;
    const spd = frameScalar / 6;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * spd;
      p.y += p.vy * spd;
      p.vy += 3.2 * spd;
      p.life -= 0.08 * spd;
      p.alpha = Math.min(1.0, p.life * 4.0);

      if (p.life <= 0) {
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
        continue;
      }

      this.gfx.circle(p.x, p.y, p.size);
      this.gfx.fill({ color: p.color, alpha: p.alpha });
    }
  }

  public destroy(): void {
    this.gfx.destroy({ children: true });
  }
}
