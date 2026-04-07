import { Container, Graphics, Text, Application } from 'pixi.js';

import type { ILakeConfig } from '@/common/types';

import type { DepthSystem } from './DepthSystem';
import { pointInPolygon } from '@/game/utils/MathUtils';

export class DebugLayer {
  private container: Container;
  private terrainGfx: Graphics;
  private dynamicGfx: Graphics;
  private fpsLabel: Text;
  private depthSystem: DepthSystem;
  private snagLabel: Text;
  private config: ILakeConfig;
  private app: Application;

  constructor(
    parent: Container,
    app: Application,
    depthSystem: DepthSystem,
    config: ILakeConfig,
  ) {
    this.container = new Container();
    this.terrainGfx = new Graphics();
    this.dynamicGfx = new Graphics();
    this.app = app;
    this.depthSystem = depthSystem;
    this.config = config;

    this.container.addChild(this.terrainGfx);
    this.container.addChild(this.dynamicGfx);

    this.fpsLabel = new Text({
      text: 'FPS: 00',
      style: {
        fontSize: 13,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 2 },
      },
    });
    this.fpsLabel.position.set(10, app.renderer.height - 20);
    this.container.addChild(this.fpsLabel);

    this.snagLabel = new Text({
      text: 'Snag: 0.0',
      style: {
        fontSize: 11,
        fill: 0xff8888,
        stroke: { color: 0x000000, width: 2 },
      },
    });
    this.snagLabel.visible = false;
    this.container.addChild(this.snagLabel);

    this.container.visible = false;
    parent.addChild(this.container);
  }

  public setVisible(visible: boolean): void {
    this.container.visible = visible;
    if (visible) {
      this.drawTerrain();
    }
  }

  public setLabelsVisible(visible: boolean): void {
    this.fpsLabel.visible = visible;
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  private fpsHistory: { fps: number; time: number }[] = [];

  public update(): void {
    this.dynamicGfx.clear();
    if (this.container.visible) {
      const now = performance.now();
      const currentFps = this.app.ticker.FPS;

      // Store current FPS and timestamp
      this.fpsHistory.push({ fps: currentFps, time: now });

      // Prune history older than 1 second (1000ms)
      const oneSecondAgo = now - 1000;
      while (
        this.fpsHistory.length > 0 &&
        this.fpsHistory[0].time < oneSecondAgo
      ) {
        this.fpsHistory.shift();
      }

      // Calculate average
      const avgFps =
        this.fpsHistory.length > 0
          ? Math.round(
              this.fpsHistory.reduce((sum, item) => sum + item.fps, 0) /
                this.fpsHistory.length,
            )
          : 0;

      this.fpsLabel.text = `FPS: ${avgFps}`;
    }
  }

  public updateSnag(
    progress: number,
    x: number,
    y: number,
    isCast: boolean,
  ): void {
    if (this.container.visible && isCast && progress > 0) {
      this.snagLabel.visible = true;
      this.snagLabel.anchor.set(1, 0.5); // Right-aligned, vertically centered
      this.snagLabel.position.set(x - 10, y - 10);
      this.snagLabel.text = `Snag: ${progress.toFixed(2)}`;
    } else {
      this.snagLabel.visible = false;
    }
  }

  public updateGroundbait(
    x: number,
    y: number,
    radius: number,
    isCast: boolean,
  ): void {
    if (!this.container.visible || !isCast || radius <= 0) return;

    this.dynamicGfx.circle(x, y, radius);
    this.dynamicGfx.stroke({ color: 0x60a5fa, width: 1.5, alpha: 0.35 });
    this.dynamicGfx.fill({ color: 0x60a5fa, alpha: 0.1 });

    // Optional: add a small label "Groundbait"
  }

  public resize(): void {
    this.fpsLabel.position.set(10, this.app.renderer.height - 20);

    if (this.container.visible) {
      this.drawTerrain();
    }
  }

  public drawTerrain(): void {
    const W = this.app.renderer.width,
      H = this.app.renderer.height;
    const gfx = this.terrainGfx;
    gfx.clear();
    const rows = 40,
      cols = 60;
    const waterBoundaryY = this.config.environment.waterBoundaryY;
    const horizonY = H * waterBoundaryY;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / (cols - 1);
        const ny = r / (rows - 1);
        const px = nx * W;
        const py = horizonY + ny * (H - horizonY);

        // Global normalized position for polygon check
        const globalNY = waterBoundaryY + ny * (1.0 - waterBoundaryY);

        if (
          this.config.allowedCastArea.type === 'polygon' &&
          this.config.allowedCastArea.points &&
          !pointInPolygon(
            { x: nx, y: globalNY },
            this.config.allowedCastArea.points,
          )
        ) {
          continue;
        }

        const depth = this.depthSystem.getDepthAt(nx, ny);
        const depthNorm =
          (depth - this.config.depthMap.minDepth) /
          Math.max(
            0.1,
            this.config.depthMap.maxDepth - this.config.depthMap.minDepth,
          );

        const hue = 60 + depthNorm * 180;
        const color = this.hslToHex(hue, 90, 45);

        gfx.circle(px, py, 2.0);
        gfx.fill({ color, alpha: 0.2 + depthNorm * 0.3 });
      }
    }
  }

  private hslToHex(h: number, s: number, l: number): number {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return parseInt(`${f(0)}${f(8)}${f(4)}`, 16);
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
