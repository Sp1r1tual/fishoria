import { Container, Graphics, Application } from 'pixi.js';

import type { WeatherType } from '@/common/types';

import { isMobile } from '@/game/utils/ScreenUtils';

interface IRainDrop {
  x: number;
  y: number;
  vy: number;
  vx: number;
  length: number;
  active: boolean;
}

interface IScreenDroplet {
  x: number;
  y: number;
  r: number;
  alpha: number;
  targetAlpha: number;
  life: number;
  maxLife: number;
  active: boolean;
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
  active: boolean;
}

interface IMeteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
  active: boolean;
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
      const drop = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        length: 0,
        active: false,
      };
      this.resetRainDrop(drop, true);
      this.rainDrops.push(drop);
    }

    for (let i = 0; i < this.MAX_SCREEN_DROPLETS; i++) {
      this.screenDroplets.push({
        x: 0,
        y: 0,
        r: 0,
        alpha: 0,
        targetAlpha: 0,
        life: 0,
        maxLife: 0,
        active: false,
      });
    }
  }

  private resetRainDrop(drop: IRainDrop, randomY = false): void {
    const W = this.app.renderer.width;
    const H = this.app.renderer.height > 0 ? this.app.renderer.height : 1000;
    const isSmall = isMobile(W);

    const startY = randomY ? Math.random() * H : -(Math.random() * H) - 50;

    const speedScale = isSmall ? 0.6 : 1.0;
    const lengthScale = isSmall ? 0.5 : 1.0;

    drop.x = Math.random() * W;
    drop.y = startY;
    drop.vx = (-1 - Math.random() * 1.5) * speedScale;
    drop.vy = (12 + Math.random() * 6) * speedScale;
    drop.length = (15 + Math.random() * 20) * lengthScale;
    drop.active = true;
  }

  private spawnScreenDroplet(): void {
    const W = this.app.renderer.width;
    const H = this.app.renderer.height;

    const d = this.screenDroplets.find((sd) => !sd.active);
    if (!d) return;

    const maxLife = 80 + Math.random() * 80;
    d.x = Math.random() * W;
    d.y = Math.random() * H;
    d.r = 1.5 + Math.random() * 2.5;
    d.alpha = 0;
    d.targetAlpha = 0.1 + Math.random() * 0.2;
    d.life = maxLife;
    d.maxLife = maxLife;
    d.active = true;
  }

  public setWeather(type: WeatherType) {
    this.weatherType = type;
  }

  private spawnBird(W: number, H: number) {
    const isLeft = Math.random() > 0.5;
    const isSmall = isMobile(W);
    const scale = isSmall ? 0.6 : 1.0;

    let b = this.birds.find((bird) => !bird.active);
    if (!b) {
      b = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        wingSpan: 0,
        flapSpeed: 0,
        time: 0,
        scale: 1,
        active: false,
      };
      this.birds.push(b);
    }

    b.x = isLeft ? -50 : W + 50;
    b.y = Math.random() * (H * 0.12) + 5;
    b.vx = (isLeft ? 1 : -1) * (1 + Math.random() * 2);
    b.vy = (Math.random() - 0.5) * 0.2;
    b.wingSpan = (6 + Math.random() * 6) * scale;
    b.flapSpeed = 0.1 + Math.random() * 0.1;
    b.time = Math.random() * 100;
    b.scale = scale;
    b.active = true;
  }

  private spawnMeteor(W: number) {
    let m = this.meteors.find((met) => !met.active);
    if (!m) {
      m = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        length: 0,
        active: false,
      };
      this.meteors.push(m);
    }

    m.x = Math.random() * W;
    m.y = -50;
    m.vx = -15 + Math.random() * 30;
    m.vy = 10 + Math.random() * 15;
    m.life = 1.0;
    m.maxLife = 1.0;
    m.length = 80 + Math.random() * 100;
    m.active = true;
  }

  public update(dtSeconds: number, timeOfDay: string = 'day') {
    const dt = dtSeconds * 60;
    const W = this.app.renderer.width;
    const H = this.app.renderer.height;

    const hasVisibleDrops = this.rainDrops.some((d) => d.y > -50 && d.y < H);

    if (this.weatherType === 'rain' || hasVisibleDrops) {
      this.rainGfx.clear();
      this.rainGfx.setStrokeStyle({ color: 0x94a3b8, width: 1, alpha: 0.4 });

      const maxVisibleDrops = isMobile(W) ? 70 : this.MAX_RAIN_DROPS;

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
        }

        if (drop.y > H) {
          if (this.weatherType === 'rain') {
            this.resetRainDrop(drop);
          } else {
            drop.y = -100;
            drop.active = false;
          }
        }
        if (drop.x < 0) drop.x = W;
      }
      this.rainGfx.stroke();
    } else {
      this.rainGfx.clear();
    }

    if (this.weatherType === 'rain' && Math.random() < 0.02 * dt) {
      this.spawnScreenDroplet();
    }

    this.dropletsGfx.clear();

    for (const d of this.screenDroplets) {
      if (!d.active) continue;

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

      if (d.life <= 0 || d.alpha < 0.01) {
        d.active = false;
        continue;
      }

      this.dropletsGfx.circle(d.x, d.y, d.r);
      this.dropletsGfx.fill({ color: 0xffffff, alpha: d.alpha });

      this.dropletsGfx.circle(d.x - d.r / 3, d.y - d.r / 3, d.r / 4);
      this.dropletsGfx.fill({ color: 0xffffff, alpha: d.alpha * 1.5 });
    }

    let targetTintAlpha = 0;
    if (this.weatherType === 'rain' || this.weatherType === 'cloudy') {
      targetTintAlpha = 0.07;
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

    for (const b of this.birds) {
      if (!b.active) continue;

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
        width: 1.5 * b.scale,
        color: 0x1a202c,
        alpha,
        cap: 'round',
        join: 'round',
      });

      const dirX = b.vx > 0 ? 1 : -1;
      this.ambientGfx.ellipse(
        b.x + dirX * 1.5 * b.scale,
        b.y,
        2.8 * b.scale,
        1.4 * b.scale,
      );
      this.ambientGfx.fill({ color: 0x1a202c, alpha });

      if (b.x < -100 || b.x > W + 100) {
        b.active = false;
      }
    }

    if (
      timeOfDay === 'night' &&
      this.weatherType === 'clear' &&
      Math.random() < 0.0005 * dt
    ) {
      this.spawnMeteor(W);
    }

    for (const m of this.meteors) {
      if (!m.active) continue;

      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt * 0.02;

      this.ambientGfx.moveTo(m.x, m.y);
      this.ambientGfx.lineTo(m.x - m.vx * 4.5, m.y - m.vy * 4.5);

      const alpha = m.life * Math.max(0, 1 - Math.max(0, m.y) / (H * 0.2));
      this.ambientGfx.stroke({ width: 2, color: 0xfffbea, alpha });

      if (m.life <= 0 || m.y > H * 0.2) {
        m.active = false;
      }
    }
  }

  public resize() {
    for (const d of this.screenDroplets) d.active = false;
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
