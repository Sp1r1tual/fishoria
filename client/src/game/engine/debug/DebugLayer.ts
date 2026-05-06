import {
  Container,
  Graphics,
  Text,
  Application,
  Sprite,
  Texture,
  Color,
} from 'pixi.js';

import type {
  ILakeConfig,
  TimeOfDayType,
  WeatherType,
  IGroundbaitConfig,
  BaitTypeType,
  LureTypeType,
} from '@/common/types';

import type { DepthSystem } from '../systems/DepthSystem';
import type { SectorSystem } from '../systems/SectorSystem';

import { FISH_SPECIES, BITE_DETECTION } from '@/common/configs/game';
import { isMobile, isSmallMobile } from '@/game/utils/ScreenUtils';

export class DebugLayer {
  private container: Container;
  private terrainGfx: Graphics;
  private dynamicGfx: Graphics;
  private mapSprite: Sprite;
  private mapMask: Graphics;
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
  private targetAlpha = 0;

  private currentTimeOfDay: TimeOfDayType = 'day';
  private currentWeather: WeatherType = 'clear';
  private currentGroundbait: IGroundbaitConfig | null = null;
  private currentRigType: string | undefined = undefined;
  private currentBaitType: string | undefined = undefined;

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
    this.mapSprite = new Sprite();
    this.mapMask = new Graphics();
    this.infoBgGfx = new Graphics();
    this.app = app;
    this.depthSystem = depthSystem;
    this.sectorSystem = sectorSystem;
    this.config = config;

    this.container.addChild(this.mapSprite);
    this.container.addChild(this.mapMask);
    this.container.addChild(this.terrainGfx);
    this.container.addChild(this.dynamicGfx);
    this.container.addChild(this.infoBgGfx);

    this.mapSprite.mask = this.mapMask;
    this.mapSprite.alpha = 0.8;

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
    this.container.alpha = 0;
    parent.addChild(this.container);
  }

  public setVisible(visible: boolean, showGrid = true): void {
    this.targetAlpha = visible ? 1 : 0;
    this.showGrid = showGrid;

    if (visible) {
      this.container.visible = true;
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

  public setSystems(
    depthSystem: DepthSystem,
    sectorSystem: SectorSystem,
  ): void {
    this.depthSystem = depthSystem;
    this.sectorSystem = sectorSystem;
  }

  public isVisible(): boolean {
    return this.container.visible || this.container.alpha > 0;
  }

  public setEnv(
    time: TimeOfDayType,
    weather: WeatherType,
    gb: IGroundbaitConfig | null,
    rigType?: string,
    baitType?: string,
  ): void {
    this.currentTimeOfDay = time;
    this.currentWeather = weather;
    this.currentGroundbait = gb;
    this.currentRigType = rigType;
    this.currentBaitType = baitType;
  }

  public update(dt: number = 1 / 60): void {
    if (this.container.alpha !== this.targetAlpha) {
      const speed = 5;
      const diff = this.targetAlpha - this.container.alpha;
      const step = dt * speed;

      if (Math.abs(diff) < step) {
        this.container.alpha = this.targetAlpha;
      } else {
        this.container.alpha += Math.sign(diff) * step;
      }

      if (this.container.alpha === 0 && this.targetAlpha === 0) {
        this.container.visible = false;
      }
    }

    if (this.container.visible) {
      this.dynamicGfx.clear();
      const now = performance.now();
      if (now - this.lastFpsUpdateTime > 250) {
        const currentFps = Math.round(this.app.ticker.FPS);
        this.fpsLabel.text = `FPS: ${currentFps}`;
        this.lastFpsUpdateTime = now;

        const isSmall = isSmallMobile(this.app.renderer.width);
        const targetFpsSize = isSmall ? 10 : 13;
        if (this.fpsLabel.style.fontSize !== targetFpsSize) {
          this.fpsLabel.style.fontSize = targetFpsSize;
        }
      }

      const isSmallDevice = isSmallMobile(this.app.renderer.width);
      const targetSnagSize = isSmallDevice ? 9 : 11;
      if (this.snagLabel.style.fontSize !== targetSnagSize) {
        this.snagLabel.style.fontSize = targetSnagSize;
      }

      const isMobileDevice = isMobile(this.app.renderer.width);
      const targetSectorInfoSize = isMobileDevice ? 9 : 12;
      if (this.sectorInfoLabel.style.fontSize !== targetSectorInfoSize) {
        this.sectorInfoLabel.style.fontSize = targetSectorInfoSize;
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

    this.mapMask.clear();
    if (
      this.config.allowedCastArea.type === 'polygon' &&
      this.config.allowedCastArea.points
    ) {
      const waterBoundaryY = this.config.environment.waterBoundaryY;
      const horizonY = H * waterBoundaryY;
      const waterH = H - horizonY;

      const polyPoints = this.config.allowedCastArea.points.map((p) => ({
        x: p.x * W,
        y: horizonY + ((p.y - waterBoundaryY) / (1 - waterBoundaryY)) * waterH,
      }));

      this.mapMask.poly(polyPoints);
      this.mapMask.fill(0xffffff);
    } else {
      this.mapMask.rect(0, 0, W, H);
      this.mapMask.fill(0xffffff);
    }

    const rows = 128;
    const cols = 128;
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(cols, rows);
    const data = imageData.data;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / (cols - 1);
        const ny = r / (rows - 1);

        const depth = this.depthSystem.getDepthAt(nx, ny);
        const depthNorm =
          (depth - this.config.depthMap.minDepth) /
          Math.max(
            0.1,
            this.config.depthMap.maxDepth - this.config.depthMap.minDepth,
          );

        const hue = 40 + depthNorm * 220;
        const color = new Color({ h: hue, s: 90, l: 45 });
        const rgb = color.toRgbArray();

        const idx = (r * cols + c) * 4;
        data[idx] = rgb[0] * 255;
        data[idx + 1] = rgb[1] * 255;
        data[idx + 2] = rgb[2] * 255;

        const fadeX = Math.min(1, nx * 10, (1 - nx) * 10);

        const fadeY = Math.min(1, (1 - ny) * 10);
        const alphaFade = fadeX * fadeY;

        data[idx + 3] = (0.5 + depthNorm * 0.4) * 255 * alphaFade;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    if (this.mapSprite.texture && this.mapSprite.texture !== Texture.EMPTY) {
      this.mapSprite.texture.destroy(true);
    }

    this.mapSprite.texture = Texture.from(canvas);

    const waterBoundaryY = this.config.environment.waterBoundaryY;
    let minY = waterBoundaryY;
    let maxY = 1.0;
    if (
      this.config.allowedCastArea.type === 'polygon' &&
      this.config.allowedCastArea.points
    ) {
      const ys = this.config.allowedCastArea.points.map((p) => p.y);
      minY = Math.min(...ys);
      maxY = Math.max(...ys);
    }

    const horizonY = H * minY;
    const mapH = H * (maxY - minY);

    this.mapSprite.position.set(0, horizonY);
    this.mapSprite.width = W;
    this.mapSprite.height = mapH;

    const gfx = this.terrainGfx;
    gfx.clear();
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
    gfx.setStrokeStyle({ width: 1, color: 0xffffff, alpha: 0.15 });
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
          let rMult = 1.0;
          let bMult = 1.0;

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
              }
            }

            if (this.currentRigType === 'feeder') {
              rMult = BITE_DETECTION.feederBiteMultiplier;
            } else if (
              this.currentRigType === 'spinning' &&
              globalConfig.isPredator
            ) {
              rMult = BITE_DETECTION.spinningBiteMultiplier;
            }

            if (this.currentRigType === 'spinning' && this.currentBaitType) {
              const lureType = this.currentBaitType.replace(
                'lure_',
                '',
              ) as LureTypeType;
              bMult = globalConfig.isPredator
                ? (globalConfig.lureMultipliers?.[lureType] ?? 1.0)
                : 0.0;
            } else if (this.currentBaitType) {
              bMult = globalConfig.preferredBaits.includes(
                this.currentBaitType as BaitTypeType,
              )
                ? 1.0
                : 0.0;
            }

            const tSign = tMult >= 1.0 ? '+' : '';
            const wSign = wMult >= 1.0 ? '+' : '';
            const gSign = gMult >= 1.0 ? '+' : '';
            const rSign = rMult >= 1.0 ? '+' : '';
            const bSign = bMult >= 1.0 ? '+' : '';

            const tLabel = `${tSign}${Math.round((tMult - 1) * 100)}%`;
            const wLabel = `${wSign}${Math.round((wMult - 1) * 100)}%`;
            const gLabel = `${gSign}${Math.round((gMult - 1) * 100)}%`;
            const rLabel = `${rSign}${Math.round((rMult - 1) * 100)}%`;
            const bLabel = `${bSign}${Math.round((bMult - 1) * 100)}%`;

            const showB =
              this.currentRigType !== 'spinning' || globalConfig.isPredator;
            const showG = Math.abs(gMult - 1.0) > 0.001;
            const showR = Math.abs(rMult - 1.0) > 0.001;

            const parts: string[] = [];
            parts.push(`T:${tLabel}`);
            parts.push(`W:${wLabel}`);
            if (showG) parts.push(`G:${gLabel}`);
            if (showR) parts.push(`R:${rLabel}`);
            if (showB) parts.push(`B:${bLabel}`);

            factorsStr = ` [${parts.join(', ')}]`;
          }

          const rangeStr = config
            ? `(${config.preferredDepthRange.min}-${config.preferredDepthRange.max}m)`
            : '';
          let effectiveAvailability =
            availability * tMult * wMult * gMult * rMult * bMult;
          if (effectiveAvailability < 0.001) effectiveAvailability = 0;

          const chancePercent = (effectiveAvailability * 100).toFixed(1);
          return `${id} ${rangeStr}: Chance: ${chancePercent}%${factorsStr}`;
        })
        .join('\n');

      let minY = this.config.environment.waterBoundaryY;
      let maxY = 1.0;
      if (
        this.config.allowedCastArea.type === 'polygon' &&
        this.config.allowedCastArea.points
      ) {
        const ys = this.config.allowedCastArea.points.map((p) => p.y);
        minY = Math.min(...ys);
        maxY = Math.max(...ys);
      }

      const localNy = (ny - minY) / (maxY - minY);
      const exactDepth = this.depthSystem.getDepthAt(
        nx,
        Math.max(0, Math.min(1, localNy)),
      );
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

      const isMobileDevice = isMobile(this.app.renderer.width);
      const padding = isMobileDevice ? 5 : 10;
      const radius = isMobileDevice ? 4 : 6;

      this.infoBgGfx.clear();
      this.infoBgGfx.roundRect(
        targetX - padding,
        targetY - padding,
        Math.round(this.sectorInfoLabel.width) + padding * 2,
        Math.round(this.sectorInfoLabel.height) + padding * 2,
        radius,
      );
      this.infoBgGfx.fill({ color: 0x000000, alpha: 0.6 });
      this.infoBgGfx.stroke({ color: 0xffffff, width: 1, alpha: 0.2 });
      this.infoBgGfx.visible = true;
    } else {
      this.sectorInfoLabel.visible = false;
      this.infoBgGfx.visible = false;
    }
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
