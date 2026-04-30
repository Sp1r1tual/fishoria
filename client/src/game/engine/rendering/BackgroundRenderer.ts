import {
  Container,
  Graphics,
  Assets,
  Sprite,
  DisplacementFilter,
  Texture,
} from 'pixi.js';

import type { ILakeConfig, TimeOfDayType, WeatherType } from '@/common/types';

function createDisplacementTexture(size = 256): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      const f = (2 * Math.PI) / size;
      const v =
        128 +
        30 * Math.sin(x * f * 2 + y * f * 1) +
        20 * Math.cos(x * f * 3 - y * f * 2) +
        15 * Math.sin((x + y) * f * 4) +
        10 * Math.cos(x * f * 6) * Math.sin(y * f * 5);

      const clamped = Math.max(0, Math.min(255, Math.round(v)));
      data[idx] = clamped;
      data[idx + 1] = clamped;
      data[idx + 2] = clamped;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return Texture.from(canvas);
}

export class BackgroundRenderer {
  private bgSprite: Sprite;
  private waterGfx: Graphics;
  private obstacleGfx: Graphics;
  private config: ILakeConfig;
  private currentTintFactor = 1.0;
  private targetTintFactor = 1.0;

  private waterContainer: Container;
  private waterBgSprite: Sprite;
  private waterMaskGfx: Graphics;
  private displacementSprite: Sprite | null = null;
  private displacementFilter: DisplacementFilter | null = null;

  constructor(bgLayer: Container, config: ILakeConfig) {
    this.config = config;
    this.bgSprite = new Sprite();
    this.waterContainer = new Container();
    this.waterBgSprite = new Sprite();
    this.waterGfx = new Graphics();
    this.waterMaskGfx = new Graphics();
    this.obstacleGfx = new Graphics();
    this.waterGfx.visible = false;
    this.obstacleGfx.visible = false;

    this.waterContainer.mask = this.waterMaskGfx;
    this.waterContainer.addChild(this.waterBgSprite);

    bgLayer.addChild(this.bgSprite);
    bgLayer.addChild(this.waterContainer);
    bgLayer.addChild(this.waterGfx);
    bgLayer.addChild(this.waterMaskGfx);
    bgLayer.addChild(this.obstacleGfx);

    try {
      const tex = createDisplacementTexture(256);
      tex.source.addressMode = 'repeat';
      this.displacementSprite = new Sprite(tex);
      this.displacementSprite.texture.source.addressMode = 'repeat';
      this.displacementFilter = new DisplacementFilter({
        sprite: this.displacementSprite,
        scale: this.config.environment.waterRippleScale ?? 6,
      });
      this.waterContainer.filters = [this.displacementFilter];
      bgLayer.addChild(this.displacementSprite);
    } catch (e) {
      console.warn(
        '[BackgroundRenderer] Failed to create displacement filter:',
        e,
      );
    }
  }

  setBackgroundTexture(url: string): void {
    const tex = Assets.get(url);
    if (tex) {
      this.bgSprite.texture = tex;
      this.waterBgSprite.texture = tex;
    }
  }

  drawBackground(
    W: number,
    H: number,
    timeOfDay: TimeOfDayType,
    weather: WeatherType = 'clear',
  ): void {
    const tod = this.config.timeOfDayConfig[timeOfDay];
    this.bgSprite.width = W;
    this.bgSprite.height = H;
    this.waterBgSprite.width = W;
    this.waterBgSprite.height = H;

    if (weather === 'rain') this.targetTintFactor = 0.75;
    else if (weather === 'cloudy') this.targetTintFactor = 0.85;
    else this.targetTintFactor = 1.0;

    this.applyCurrentTint();

    this.waterGfx.clear();
    this.waterMaskGfx.clear();
    const area = this.config.allowedCastArea;
    if (area.type === 'polygon' && area.points) {
      const polyPoints = area.points.flatMap((p) => [p.x * W, p.y * H]);
      this.waterGfx.poly(polyPoints);
      this.waterMaskGfx.poly(polyPoints);
    } else {
      const waterY = this.config.environment.waterBoundaryY * H;
      const waterH = H - waterY;
      this.waterGfx.rect(0, waterY, W, waterH);
      this.waterMaskGfx.rect(0, waterY, W, waterH);
    }

    this.waterMaskGfx.fill({ color: 0xffffff, alpha: 1 });

    const waterAlpha =
      weather === 'rain' ? 0.5 : weather === 'cloudy' ? 0.4 : 0.3;
    this.waterGfx.fill({ color: tod.waterColor, alpha: waterAlpha });

    if (this.displacementFilter) {
      const baseScale = this.config.environment.waterRippleScale ?? 6;
      const waveScale = W < 1080 ? baseScale * 0.5 : baseScale;
      this.displacementFilter.scale.set(waveScale);
    }
  }

  private applyCurrentTint(): void {
    const val = Math.floor(255 * this.currentTintFactor);
    const tintColor = (val << 16) | (val << 8) | val;
    this.bgSprite.tint = tintColor;
    this.waterBgSprite.tint = tintColor;
  }

  public update(dtSeconds: number): void {
    const dt = dtSeconds * 60;
    const lerpSpeed = 0.02;
    if (Math.abs(this.currentTintFactor - this.targetTintFactor) > 0.001) {
      this.currentTintFactor +=
        (this.targetTintFactor - this.currentTintFactor) * lerpSpeed * dt;
      this.applyCurrentTint();
    }

    if (this.displacementSprite) {
      this.displacementSprite.x += 0.3 * dt;
      this.displacementSprite.y += 0.15 * dt;
    }
  }

  drawObstacles(W: number, H: number): void {
    this.obstacleGfx.clear();
    for (const obs of this.config.obstacles) {
      if (obs.type === 'circle' && obs.radius != null) {
        this.obstacleGfx.circle(
          obs.position.x * W,
          obs.position.y * H,
          obs.radius * W,
        );
        this.obstacleGfx.fill({ color: 0x2d5a3d, alpha: 0.3 });
        this.obstacleGfx.stroke({ color: 0x4a8a5a, width: 2, alpha: 0.8 });
      }
    }
  }

  setDebugVisible(visible: boolean): void {
    this.waterGfx.visible = visible;
    this.obstacleGfx.visible = visible;
  }
}
