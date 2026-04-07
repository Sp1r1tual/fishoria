import { Container, Graphics, Assets, Sprite } from 'pixi.js';

import type { ILakeConfig, TimeOfDayType } from '@/common/types';

export class BackgroundRenderer {
  private bgSprite: Sprite;
  private waterGfx: Graphics;
  private obstacleGfx: Graphics;
  private config: ILakeConfig;

  constructor(bgLayer: Container, config: ILakeConfig) {
    this.config = config;
    this.bgSprite = new Sprite();
    this.waterGfx = new Graphics();
    this.obstacleGfx = new Graphics();
    this.waterGfx.visible = false;
    this.obstacleGfx.visible = false;
    bgLayer.addChild(this.bgSprite);
    bgLayer.addChild(this.waterGfx);
    bgLayer.addChild(this.obstacleGfx);
  }

  setBackgroundTexture(url: string): void {
    const tex = Assets.get(url);
    if (tex) this.bgSprite.texture = tex;
  }

  drawBackground(
    W: number,
    H: number,
    timeOfDay: TimeOfDayType,
    weather: 'clear' | 'cloudy' | 'rain' = 'clear',
  ): void {
    const tod = this.config.timeOfDayConfig[timeOfDay];
    this.bgSprite.width = W;
    this.bgSprite.height = H;

    // Apply weather tint
    if (weather === 'rain') {
      this.bgSprite.tint = 0xbbbbbb;
    } else if (weather === 'cloudy') {
      this.bgSprite.tint = 0xeeeeee;
    } else {
      this.bgSprite.tint = 0xffffff;
    }

    this.waterGfx.clear();
    const area = this.config.allowedCastArea;
    if (area.type === 'polygon' && area.points) {
      // Use the organic allowed cast area points
      const polyPoints = area.points.flatMap((p) => [p.x * W, p.y * H]);
      this.waterGfx.poly(polyPoints);
    } else {
      // Fallback to simple rectangle
      const waterY = this.config.environment.waterBoundaryY * H;
      const waterH = H - waterY;
      this.waterGfx.rect(0, waterY, W, waterH);
    }
    const waterAlpha =
      weather === 'rain' ? 0.5 : weather === 'cloudy' ? 0.4 : 0.3;
    this.waterGfx.fill({ color: tod.waterColor, alpha: waterAlpha });
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
