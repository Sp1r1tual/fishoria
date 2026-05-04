import { Container, Graphics } from 'pixi.js';

export class RodEntity {
  private gfx: Graphics;
  private lineGfx: Graphics;

  baseX = 80;
  baseY = 0;
  hookX = 400;
  hookY = 300;
  aimX = 400;
  aimY = 300;
  tension = 0;
  lineSlack = 0;
  isCast = false;
  isSpinning = false;
  scale = 1.0;

  constructor(parent: Container) {
    this.lineGfx = new Graphics();
    this.gfx = new Graphics();
    parent.addChild(this.lineGfx);
    parent.addChild(this.gfx);
  }

  setVisible(visible: boolean): void {
    this.gfx.visible = visible;
    this.lineGfx.visible = visible;
  }

  update(
    baseX: number,
    baseY: number,
    aimX: number,
    aimY: number,
    lineX: number,
    lineY: number,
    rodTension: number,
    lineSlack: number,
    isCast: boolean = true,
    scale: number = 1.0,
    isSpinning: boolean = false,
  ): void {
    this.baseX = baseX;
    this.baseY = baseY;
    this.aimX = aimX;
    this.aimY = aimY;
    this.hookX = lineX;
    this.hookY = lineY;
    this.tension = rodTension;
    this.lineSlack = lineSlack;
    this.isCast = isCast;
    this.scale = scale;
    this.isSpinning = isSpinning;

    this.drawRod();
    this.drawLine();
  }

  private guidePoints: { x: number; y: number }[] = Array.from(
    { length: 17 },
    () => ({
      x: 0,
      y: 0,
    }),
  );
  private internalPoints: { x: number; y: number }[] = [];

  public get tipX(): number {
    const dx = this.aimX - this.baseX;
    const lean = Math.min(Math.abs(dx) * 0.1, 40 * this.scale);
    const dir = dx > 0 ? 1 : -1;
    const flex = this.tension * 70 * this.scale;
    return this.baseX + lean * dir + dir * flex;
  }

  public get tipY(): number {
    const length = 280 * this.scale;
    const dy = this.aimY - this.baseY;
    const vOffset = Math.max(-40, Math.min(40, dy * 0.05)) * this.scale;
    return this.baseY - length + this.tension * 80 * this.scale + vOffset;
  }

  private guidePointsCount = 0;

  private drawRod(): void {
    this.gfx.clear();
    this.guidePointsCount = 0;

    const segments = 16;
    const bx = this.baseX,
      by = this.baseY;
    const tx = this.tipX,
      ty = this.tipY;
    const dir = this.aimX >= bx ? 1 : -1;

    const handleLen = 50 * this.scale;
    const dx = tx - bx;
    const dy = ty - by;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const hx = bx + (dx / dist) * handleLen;
    const hy = by + (dy / dist) * handleLen;
    const handleColor = this.isSpinning ? 0x2d5a3d : 0xcc9966;

    this.gfx.moveTo(bx, by);
    this.gfx.lineTo(hx, hy);
    this.gfx.stroke({
      width: 10 * this.scale,
      color: handleColor,
      cap: 'round',
    });

    const nx = -dy / dist;
    const ny = dx / dist;

    this.gfx.moveTo(bx + nx * 2.5 * this.scale, by + ny * 2.5 * this.scale);
    this.gfx.lineTo(hx + nx * 2.5 * this.scale, hy + ny * 2.5 * this.scale);
    this.gfx.stroke({ width: 4 * this.scale, color: 0x000000, alpha: 0.12 });

    this.gfx.moveTo(bx, by);
    const buttLen = 6 * this.scale;
    this.gfx.lineTo(bx + (dx / dist) * buttLen, by + (dy / dist) * buttLen);
    this.gfx.stroke({
      width: 10.5 * this.scale,
      color: 0x222222,
      cap: 'round',
    });

    const grainColor = this.isSpinning ? 0x1a3322 : 0x825a38;
    const grainAlpha = this.isSpinning ? 0.4 : 0.3;

    for (let j = 1; j <= 8; j++) {
      const p = j / 9;
      const gx = bx + (hx - bx) * p;
      const gy = by + (hy - by) * p;
      const side = j % 2 === 0 ? 1 : -1;

      this.gfx.circle(
        gx + nx * side * 2.2 * this.scale,
        gy + ny * side * 2.2 * this.scale,
        (0.6 + (j % 3) * 0.6) * this.scale,
      );
    }
    this.gfx.fill({ color: grainColor, alpha: grainAlpha });

    this.guidePoints[this.guidePointsCount].x = hx;
    this.guidePoints[this.guidePointsCount].y = hy;
    this.guidePointsCount++;

    let prevX = hx;
    let prevY = hy;

    const batchSize = 4;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;

      const bend = Math.pow(t, 4.0) * this.tension * 85 * this.scale * dir;
      const currX = hx + (tx - hx) * t + bend;
      const currY = hy + (ty - hy) * t;

      const width = 6.5 * this.scale * (1 - t * 0.9);
      this.gfx.moveTo(prevX, prevY);
      this.gfx.lineTo(currX, currY);

      if (i % batchSize === 0 || i === segments) {
        this.gfx.stroke({
          width: Math.max(0.8, width),
          color: 0x111111,
          cap: 'round',
          join: 'round',
        });
      }

      if (i % 4 === 0 || i === segments) {
        const rodDx = currX - prevX;
        const rodDy = currY - prevY;
        const len = Math.sqrt(rodDx * rodDx + rodDy * rodDy) || 1;

        const rnx = -rodDy / len;
        const rny = rodDx / len;
        const flip = dir;

        const offsetDist = width + 1.5 * this.scale;
        const ringX = currX + rnx * flip * offsetDist;
        const ringY = currY + rny * flip * offsetDist;

        this.guidePoints[this.guidePointsCount].x = ringX;
        this.guidePoints[this.guidePointsCount].y = ringY;
        this.guidePointsCount++;

        if (i < segments) {
          this.gfx.moveTo(currX, currY);
          this.gfx.lineTo(ringX, ringY);
          this.gfx.stroke({ width: 1.2 * this.scale, color: 0x444444 });

          this.gfx.circle(ringX, ringY, 1.8 * this.scale);
          this.gfx.stroke({ width: 1, color: 0xdddddd });
        }
      }

      prevX = currX;
      prevY = currY;
    }

    this.gfx.circle(prevX, prevY, 1.8 * this.scale);
    this.gfx.fill({ color: 0xff4444 });
  }

  private drawLine(): void {
    this.lineGfx.clear();
    if (this.guidePointsCount < 2) return;

    const isCritical = this.tension > 0.7;
    const color = isCritical ? 0xff0000 : 0xdddddd;

    this.lineGfx.moveTo(this.guidePoints[0].x, this.guidePoints[0].y);

    for (let i = 1; i < this.guidePointsCount; i++) {
      const p1 = this.guidePoints[i - 1];
      const p2 = this.guidePoints[i];
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2 + this.lineSlack * 20 * this.scale;
      this.lineGfx.quadraticCurveTo(mx, my, p2.x, p2.y);
    }

    if (this.isCast) {
      const tip = this.guidePoints[this.guidePointsCount - 1];
      const dx = this.hookX - tip.x;
      const dy = this.hookY - tip.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        const finalSlack = this.lineSlack * 90 * this.scale;

        this.lineGfx.moveTo(tip.x, tip.y);

        const segments = 12;
        this.internalPoints.length = 0;

        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          let px = tip.x + dx * t;
          let py = tip.y + dy * t;
          const sag = Math.sin(t * Math.PI) * finalSlack;

          let nx = -dy / dist;
          let ny = dx / dist;
          if (ny < 0) {
            nx = -nx;
            ny = -ny;
          }

          px += nx * sag;
          py += ny * sag;

          if (this.internalPoints.length < i + 1) {
            this.internalPoints.push({ x: px, y: py });
          } else {
            this.internalPoints[i].x = px;
            this.internalPoints[i].y = py;
          }
        }

        for (let i = 1; i < this.internalPoints.length; i++) {
          const p0 = this.internalPoints[i - 1];
          const p1 = this.internalPoints[i];
          const mx = (p0.x + p1.x) / 2;
          const my = (p0.y + p1.y) / 2;
          this.lineGfx.quadraticCurveTo(p0.x, p0.y, mx, my);
        }
        this.lineGfx.lineTo(this.hookX, this.hookY);
      }
    }

    const baseWidth = 1.4;
    const lineWidth = baseWidth * this.scale;
    const finalAlpha = isCritical ? 0.9 : 0.45;

    this.lineGfx.stroke({
      width: lineWidth,
      color,
      alpha: finalAlpha,
      cap: 'round',
      join: 'round',
    });
  }

  destroy(): void {
    this.gfx.destroy();
    this.lineGfx.destroy();
  }
}
