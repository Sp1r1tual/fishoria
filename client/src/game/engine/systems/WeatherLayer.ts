import { Container, Graphics, Application } from 'pixi.js';

import type { WeatherType } from '@/common/types';

interface IRainDrop {
  x: number;
  y: number;
  vy: number;
  vx: number;
  length: number;
}

interface IScreenDroplet {
  x: number;
  y: number;
  r: number;
  alpha: number;
  targetAlpha: number;
  life: number;
  maxLife: number;
}

interface IBird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wingSpan: number;
  flapSpeed: number;
  time: number;
  scale: number;
}

interface IMeteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

export class WeatherLayer {
  private container: Container;
  private rainGfx: Graphics;
  private dropletsGfx: Graphics;
  private overlayGfx: Graphics;
  private app: Application;

  private rainDrops: IRainDrop[] = [];
  private screenDroplets: IScreenDroplet[] = [];
  private birds: IBird[] = [];
  private meteors: IMeteor[] = [];
  private ambientGfx: Graphics;
  private weatherType: WeatherType = 'clear';
  private currentTintAlpha = 0;

  private readonly MAX_RAIN_DROPS = 180;
  private readonly MAX_SCREEN_DROPLETS = 12;

  constructor(parent: Container, app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.zIndex = 1000;

    this.rainGfx = new Graphics();
    this.dropletsGfx = new Graphics();
    this.overlayGfx = new Graphics();
    this.ambientGfx = new Graphics();

    this.container.addChild(this.ambientGfx);
    this.container.addChild(this.overlayGfx);
    this.container.addChild(this.rainGfx);
    this.container.addChild(this.dropletsGfx);

    parent.sortableChildren = true;
    parent.addChild(this.container);

    this.initRain();
  }

  private initRain() {
    for (let i = 0; i < this.MAX_RAIN_DROPS; i++) {
      this.rainDrops.push(this.createRainDrop(false));
    }
  }

  private createRainDrop(randomY = false): IRainDrop {
    const W = this.app.renderer.width;
    const H = this.app.renderer.height > 0 ? this.app.renderer.height : 1000;
    const isSmall = W < 1000;

    const startY = randomY ? Math.random() * H : -(Math.random() * H) - 50;

    const speedScale = isSmall ? 0.6 : 1.0;
    const lengthScale = isSmall ? 0.5 : 1.0;

    return {
      x: Math.random() * W,
      y: startY,
      vx: (-1 - Math.random() * 1.5) * speedScale,
      vy: (12 + Math.random() * 6) * speedScale,
      length: (15 + Math.random() * 20) * lengthScale,
    };
  }

  private createScreenDroplet(): IScreenDroplet {
    const W = this.app.renderer.width;
    const H = this.app.renderer.height;
    const maxLife = 80 + Math.random() * 80;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.5 + Math.random() * 2.5,
      alpha: 0,
      targetAlpha: 0.1 + Math.random() * 0.2,
      life: maxLife,
      maxLife: maxLife,
    };
  }

  public setWeather(type: WeatherType) {
    this.weatherType = type;
  }

  private spawnBird(W: number, H: number) {
    const isLeft = Math.random() > 0.5;
    const isSmall = W < 768;
    const scale = isSmall ? 0.6 : 1.0;

    this.birds.push({
      x: isLeft ? -50 : W + 50,
      y: Math.random() * (H * 0.12) + 5,
      vx: (isLeft ? 1 : -1) * (1 + Math.random() * 2),
      vy: (Math.random() - 0.5) * 0.2,
      wingSpan: 6 + Math.random() * 6,
      flapSpeed: 0.1 + Math.random() * 0.1,
      time: Math.random() * 100,
      scale,
    });
  }

  private spawnMeteor(W: number) {
    this.meteors.push({
      x: Math.random() * W,
      y: -50,
      vx: -15 + Math.random() * 30,
      vy: 10 + Math.random() * 15,
      life: 1.0,
      maxLife: 1.0,
      length: 80 + Math.random() * 100,
    });
  }

  public update(dt: number, timeOfDay: string = 'day') {
    const W = this.app.renderer.width;
    const H = this.app.renderer.height;

    const hasVisibleDrops = this.rainDrops.some((d) => d.y > -50 && d.y < H);

    if (this.weatherType === 'rain' || hasVisibleDrops) {
      this.rainGfx.clear();
      this.rainGfx.setStrokeStyle({ color: 0x94a3b8, width: 1, alpha: 0.4 });

      const maxVisibleDrops = W < 1000 ? 70 : this.MAX_RAIN_DROPS;

      for (
        let i = 0;
        i < Math.min(this.rainDrops.length, maxVisibleDrops);
        i++
      ) {
        const drop = this.rainDrops[i];

        if (this.weatherType === 'rain' || drop.y > -50) {
          drop.x += drop.vx * dt;
          drop.y += drop.vy * dt;
        }

        if (drop.y > 0 && drop.y < H) {
          this.rainGfx.moveTo(drop.x, drop.y);
          this.rainGfx.lineTo(drop.x + drop.vx * 2, drop.y + drop.length);
          this.rainGfx.stroke();
        }

        if (drop.y > H) {
          if (this.weatherType === 'rain') {
            Object.assign(drop, this.createRainDrop());
          } else {
            drop.y = -100;
          }
        }
        if (drop.x < 0) drop.x = W;
      }
    } else {
      this.rainGfx.clear();
    }

    if (this.weatherType === 'rain' || this.screenDroplets.length > 0) {
      this.dropletsGfx.clear();
    } else {
      this.dropletsGfx.clear();
    }

    if (
      this.weatherType === 'rain' &&
      this.screenDroplets.length < this.MAX_SCREEN_DROPLETS &&
      Math.random() < 0.02 * dt
    ) {
      this.screenDroplets.push(this.createScreenDroplet());
    }

    for (let i = this.screenDroplets.length - 1; i >= 0; i--) {
      const d = this.screenDroplets[i];
      d.life -= dt;

      if (d.life > d.maxLife * 0.7) {
        d.alpha += (d.targetAlpha - d.alpha) * 0.1;
      } else {
        d.y += d.r * 0.15 * dt;
        d.x += (Math.random() - 0.5) * dt * 0.1;

        if (d.life < d.maxLife * 0.4) {
          d.alpha *= 0.92;
        }
      }

      this.dropletsGfx.moveTo(d.x, d.y);
      this.dropletsGfx.circle(d.x, d.y, d.r);
      this.dropletsGfx.fill({ color: 0xffffff, alpha: d.alpha });

      this.dropletsGfx.circle(d.x - d.r / 3, d.y - d.r / 3, d.r / 4);
      this.dropletsGfx.fill({ color: 0xffffff, alpha: d.alpha * 1.5 });

      if (d.life <= 0 || d.alpha < 0.01) {
        this.screenDroplets[i] =
          this.screenDroplets[this.screenDroplets.length - 1];
        this.screenDroplets.pop();
      }
    }

    let targetTintAlpha = 0;
    if (this.weatherType === 'rain' || this.weatherType === 'cloudy') {
      targetTintAlpha = 0.12;
    }

    const lerpSpeed = 0.02;
    this.currentTintAlpha +=
      (targetTintAlpha - this.currentTintAlpha) * lerpSpeed * dt;

    if (this.currentTintAlpha > 0.001) {
      this.overlayGfx.clear();
      this.overlayGfx.rect(0, 0, W, H);
      this.overlayGfx.fill({ color: 0x0f172a, alpha: this.currentTintAlpha });
    } else {
      this.overlayGfx.clear();
    }

    this.ambientGfx.clear();

    if (this.weatherType !== 'rain' && timeOfDay !== 'night') {
      if (Math.random() < 0.0005 * dt) {
        this.spawnBird(W, H);
      }
    }

    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.time += dt;

      const alpha =
        timeOfDay === 'evening' || timeOfDay === 'morning' ? 0.3 : 0.6;
      const wingY =
        b.y - Math.abs(Math.sin(b.time * b.flapSpeed)) * (b.wingSpan * 0.8);

      this.ambientGfx.moveTo(b.x - b.wingSpan, wingY);
      this.ambientGfx.quadraticCurveTo(b.x - b.wingSpan * 0.5, b.y, b.x, b.y);
      this.ambientGfx.quadraticCurveTo(
        b.x + b.wingSpan * 0.5,
        b.y,
        b.x + b.wingSpan,
        wingY,
      );
      this.ambientGfx.stroke({
        width: 1.5,
        color: 0x1a202c,
        alpha,
        cap: 'round',
        join: 'round',
      });

      const dirX = b.vx > 0 ? 1 : -1;
      this.ambientGfx.ellipse(
        b.x + dirX * 1.5,
        b.y,
        2.8 * b.scale,
        1.4 * b.scale,
      );
      this.ambientGfx.fill({ color: 0x1a202c, alpha });

      if (b.x < -100 || b.x > W + 100) {
        this.birds[i] = this.birds[this.birds.length - 1];
        this.birds.pop();
      }
    }

    if (
      timeOfDay === 'night' &&
      this.weatherType === 'clear' &&
      Math.random() < 0.0005 * dt
    ) {
      this.spawnMeteor(W);
    }

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt * 0.02;

      this.ambientGfx.moveTo(m.x, m.y);
      this.ambientGfx.lineTo(m.x - m.vx * 4.5, m.y - m.vy * 4.5);

      const alpha = m.life * Math.max(0, 1 - Math.max(0, m.y) / (H * 0.2));
      this.ambientGfx.stroke({ width: 2, color: 0xfffbea, alpha });

      if (m.life <= 0 || m.y > H * 0.2) {
        this.meteors[i] = this.meteors[this.meteors.length - 1];
        this.meteors.pop();
      }
    }
  }

  public resize() {
    this.screenDroplets = [];
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
