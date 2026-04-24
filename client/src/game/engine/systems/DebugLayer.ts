import { Container, Graphics, Text, Application } from 'pixi.js';

import type {
  ILakeConfig,
  TimeOfDayType,
  WeatherType,
  IGroundbaitConfig,
} from '@/common/types';

import type { DepthSystem } from './DepthSystem';
import type { SectorSystem } from './SectorSystem';
import { pointInPolygon } from '@/game/utils/MathUtils';
import { FISH_SPECIES } from '@/common/configs/game';

export class DebugLayer {
  private container: Container;
  private terrainGfx: Graphics;
  private dynamicGfx: Graphics;
  private infoBgGfx: Graphics;
  private fpsLabel: Text;
  private depthSystem: DepthSystem;
  private snagLabel: Text;
  private sectorInfoLabel: Text;
  private envLabel: Text;
  private config: ILakeConfig;
  private app: Application;
  private sectorSystem: SectorSystem;
  private lastFpsUpdateTime = 0;
  private showGrid = true;
  private showLabels = false;

  private currentTimeOfDay: TimeOfDayType = 'day';
  private currentWeather: WeatherType = 'clear';
  private currentGroundbait: IGroundbaitConfig | null = null;

  constructor(
    parent: Container,
    app: Application,
    depthSystem: DepthSystem,
    sectorSystem: SectorSystem,
    config: ILakeConfig,
  ) {
    this.container = new Container();
    this.terrainGfx = new Graphics();
    this.dynamicGfx = new Graphics();
    this.infoBgGfx = new Graphics();
    this.app = app;
    this.depthSystem = depthSystem;
    this.sectorSystem = sectorSystem;
    this.config = config;

    this.container.addChild(this.terrainGfx);
    this.container.addChild(this.dynamicGfx);
    this.container.addChild(this.infoBgGfx);

    this.fpsLabel = new Text({
      text: 'FPS: 00',
      style: {
        fontSize: 14,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    this.fpsLabel.resolution = window.devicePixelRatio || 1;
    this.fpsLabel.position.set(10, app.renderer.height - 20);
    this.container.addChild(this.fpsLabel);

    this.snagLabel = new Text({
      text: 'Snag: 0.0',
      style: {
        fontSize: 12,
        fill: 0xff8888,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    this.snagLabel.resolution = window.devicePixelRatio || 1;
    this.snagLabel.visible = false;
    this.container.addChild(this.snagLabel);

    this.envLabel = new Text({
      text: '',
      style: {
        fontSize: 14,
        fill: 0xffffaa,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    this.envLabel.resolution = window.devicePixelRatio || 1;
    this.envLabel.position.set(10, 40);
    this.container.addChild(this.envLabel);

    this.sectorInfoLabel = new Text({
      text: '',
      style: {
        fontSize: 12,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 3 },
      },
    });
    this.sectorInfoLabel.resolution = window.devicePixelRatio || 1;
    this.sectorInfoLabel.visible = false;
    this.infoBgGfx.visible = false;
    this.container.addChild(this.sectorInfoLabel);

    this.container.visible = false;
    parent.addChild(this.container);
  }

  public setVisible(visible: boolean, showGrid = true): void {
    this.container.visible = visible;
    this.showGrid = showGrid;
    if (visible) {
      this.terrainGfx.clear();
      this.drawTerrain();
      if (this.showGrid) {
        this.drawSectors();
      }
    }
  }

  public setLabelsVisible(visible: boolean): void {
    this.showLabels = visible;
    this.fpsLabel.visible = visible;
    this.envLabel.visible = visible;
    if (!visible) {
      this.snagLabel.visible = false;
      this.sectorInfoLabel.visible = false;
    }
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  public setEnv(
    time: TimeOfDayType,
    weather: WeatherType,
    gb: IGroundbaitConfig | null,
  ): void {
    this.currentTimeOfDay = time;
    this.currentWeather = weather;
    this.currentGroundbait = gb;
  }

  public update(): void {
    if (this.container.visible) {
      this.dynamicGfx.clear();
      const now = performance.now();
      if (now - this.lastFpsUpdateTime > 250) {
        const currentFps = Math.round(this.app.ticker.FPS);
        this.fpsLabel.text = `FPS: ${currentFps}`;
        this.lastFpsUpdateTime = now;

        const isSmall = this.app.renderer.width < 768;
        const targetFpsSize = isSmall ? 10 : 13;
        if (this.fpsLabel.style.fontSize !== targetFpsSize) {
          this.fpsLabel.style.fontSize = targetFpsSize;
        }
      }

      const isSmall = this.app.renderer.width < 768;
      const targetSnagSize = isSmall ? 9 : 11;
      if (this.snagLabel.style.fontSize !== targetSnagSize) {
        this.snagLabel.style.fontSize = targetSnagSize;
      }

      if (this.showLabels) {
        this.updateSectorHover();
      } else {
        this.sectorInfoLabel.visible = false;
        this.infoBgGfx.visible = false;
      }
    }
  }

  public updateSnag(
    progress: number,
    x: number,
    y: number,
    isCast: boolean,
  ): void {
    if (this.container.visible && this.showLabels && isCast && progress > 0) {
      this.snagLabel.visible = true;
      this.snagLabel.anchor.set(1, 0.5);
      this.snagLabel.position.set(x - 10, y - 10);
      this.snagLabel.text = `Snag: ${progress.toFixed(2)}`;
    } else {
      this.snagLabel.visible = false;
    }
  }

  public resize(): void {
    this.fpsLabel.position.set(10, this.app.renderer.height - 20);

    if (this.container.visible) {
      this.terrainGfx.clear();
      this.drawTerrain();
      if (this.showGrid) {
        this.drawSectors();
      }
    }
  }

  public drawTerrain(): void {
    const W = this.app.renderer.width,
      H = this.app.renderer.height;
    const gfx = this.terrainGfx;

    const isSmallScreen = this.app.renderer.width < 1000;
    const rows = isSmallScreen ? 30 : 50;
    const cols = isSmallScreen ? 45 : 75;
    const waterBoundaryY = this.config.environment.waterBoundaryY;
    const horizonY = H * waterBoundaryY;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / (cols - 1);
        const ny = r / (rows - 1);
        const px = nx * W;
        const py = horizonY + ny * (H - horizonY);

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

  public drawSectors(): void {
    const W = this.app.renderer.width,
      H = this.app.renderer.height;
    const gfx = this.terrainGfx;
    const grid = this.sectorSystem.getGrid();
    if (!grid.length) return;
    const bounds = this.sectorSystem.getBounds();
    const cols = grid.length;
    const rows = grid[0].length;

    const pxMinX = bounds.minX * W;
    const pxMaxX = bounds.maxX * W;
    const pxMinY = bounds.minY * H;
    const pxMaxY = bounds.maxY * H;

    const cellW = (pxMaxX - pxMinX) / cols;
    const cellH = (pxMaxY - pxMinY) / rows;
    gfx.setStrokeStyle({ width: 1, color: 0xffffff, alpha: 0.1 });

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (!grid[c][r]) continue;

        const x = pxMinX + c * cellW;
        const y = pxMinY + r * cellH;

        gfx.rect(x, y, cellW + 0.5, cellH + 0.5);
      }
    }
    gfx.stroke();
  }

  private updateSectorHover(): void {
    const mouse = this.app.renderer.events.pointer;
    if (!mouse) return;

    const W = this.app.renderer.width;
    const nx = mouse.x / W;
    const ny = mouse.y / this.app.renderer.height;

    const sector = this.sectorSystem.getSectorAt(nx, ny);
    if (sector && Object.keys(sector.availability).length > 0) {
      this.sectorInfoLabel.visible = true;

      const speciesList = Object.entries(sector.availability)
        .map(([id, availability]) => {
          const config = this.sectorSystem.getConfigForSpecies(id);
          const globalConfig = FISH_SPECIES[id];

          let factorsStr = '';
          let tMult = 1.0;
          let wMult = 1.0;
          let gMult = 1.0;

          if (globalConfig) {
            tMult =
              globalConfig.activityByTimeOfDay[this.currentTimeOfDay] ?? 1.0;
            wMult = globalConfig.activityByWeather[this.currentWeather] ?? 1.0;

            if (this.currentGroundbait) {
              const gb = this.currentGroundbait;
              if (
                gb.fishedSpeciesMultiplier &&
                gb.fishedSpeciesMultiplier[id]
              ) {
                gMult = gb.fishedSpeciesMultiplier[id];
              } else {
                gMult = 1.0;
              }
            }

            const tSign = tMult >= 1.0 ? '+' : '';
            const wSign = wMult >= 1.0 ? '+' : '';
            const gSign = gMult >= 1.0 ? '+' : '';

            const tLabel = `${tSign}${Math.round((tMult - 1) * 100)}%`;
            const wLabel = `${wSign}${Math.round((wMult - 1) * 100)}%`;
            const gLabel = `${gSign}${Math.round((gMult - 1) * 100)}%`;

            factorsStr = ` [T:${tLabel}, W:${wLabel}, G:${gLabel}]`;
          }

          const rangeStr = config
            ? `(${config.preferredDepthRange.min}-${config.preferredDepthRange.max}m)`
            : '';
          let effectiveAvailability = availability * tMult * wMult * gMult;
          if (effectiveAvailability < 0.001) effectiveAvailability = 0;

          const chancePercent = (effectiveAvailability * 100).toFixed(1);
          return `${id} ${rangeStr}: Chance: ${chancePercent}%${factorsStr}`;
        })
        .join('\n');

      const exactDepth = this.depthSystem.getDepthAt(nx, ny);
      this.sectorInfoLabel.text = `Depth: ${exactDepth.toFixed(1)}m\n---\n${speciesList}`;

      const H = this.app.renderer.height;
      let targetX = mouse.x + 15;
      let targetY = mouse.y + 15;

      if (targetX + this.sectorInfoLabel.width > W) {
        targetX = mouse.x - this.sectorInfoLabel.width - 15;
      }
      if (targetY + this.sectorInfoLabel.height > H) {
        targetY = mouse.y - this.sectorInfoLabel.height - 15;
      }

      targetX = Math.round(targetX);
      targetY = Math.round(targetY);

      this.sectorInfoLabel.position.set(targetX, targetY);

      // Update background box
      this.infoBgGfx.clear();
      this.infoBgGfx.roundRect(
        targetX - 10,
        targetY - 10,
        Math.round(this.sectorInfoLabel.width) + 20,
        Math.round(this.sectorInfoLabel.height) + 20,
        6,
      );
      this.infoBgGfx.fill({ color: 0x000000, alpha: 0.6 });
      this.infoBgGfx.stroke({ color: 0xffffff, width: 1, alpha: 0.2 });
      this.infoBgGfx.visible = true;
    } else {
      this.sectorInfoLabel.visible = false;
      this.infoBgGfx.visible = false;
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
