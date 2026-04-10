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

  /**
   * Spawns a burst of groundbait particles
   */
  public spawn(W: number, H: number): void {
    // Spawn large burst of particles with wide horizontal spread
    for (let i = 0; i < 75; i++) {
      const color =
        this.PALETTE[Math.floor(Math.random() * this.PALETTE.length)];

      this.particles.push({
        x: W / 2 + (Math.random() - 0.5) * 40,
        y: H + 10,
        vx: (Math.random() - 0.5) * 55, // Wide horizontal spread
        vy: -8 - Math.random() * 40, // Much lower vertical arc
        life: 1.0,
        size: 1.0 + Math.random() * 3.5,
        alpha: 1.0,
        color,
      });
    }
  }

  /**
   * Updates particle positions and transparency
   */
  public update(dt: number): void {
    if (this.particles.length === 0) {
      if (this.gfx.alpha > 0) this.gfx.clear();
      return;
    }

    this.gfx.clear();
    const spd = dt / 6; // Snappy simulation speed

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * spd;
      p.y += p.vy * spd;
      p.vy += 3.2 * spd; // Strong gravity
      p.life -= 0.08 * spd; // Quick decay
      p.alpha = Math.min(1.0, p.life * 4.0);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.gfx.circle(p.x, p.y, p.size);
      this.gfx.fill({ color: p.color, alpha: p.alpha });
    }
  }

  /**
   * Cleans up PIXI resources
   */
  public destroy(): void {
    this.gfx.destroy({ children: true });
  }
}
