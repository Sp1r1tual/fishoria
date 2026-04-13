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

  private guidePoints: { x: number; y: number }[] = [];

  private get tipX(): number {
    const dx = this.aimX - this.baseX;
    const lean = Math.min(Math.abs(dx) * 0.1, 40 * this.scale);
    const dir = dx > 0 ? 1 : -1;
    const flex = this.tension * 70 * this.scale;
    return this.baseX + lean * dir + dir * flex;
  }

  private get tipY(): number {
    const length = 280 * this.scale;
    const dy = this.aimY - this.baseY;
    const vOffset = Math.max(-40, Math.min(40, dy * 0.05)) * this.scale;
    return this.baseY - length + this.tension * 80 * this.scale + vOffset;
  }

  private drawRod(): void {
    this.gfx.clear();
    this.guidePoints = [];

    const segments = 24;
    const bx = this.baseX,
      by = this.baseY;
    const tx = this.tipX,
      ty = this.tipY;
    const dir = this.aimX >= bx ? 1 : -1;

    const handleLen = 50 * this.scale;
    const dx = tx - bx;
    const dy = ty - by;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const hx = bx + (dx / dist) * handleLen;
    const hy = by + (dy / dist) * handleLen;
    const handleColor = this.isSpinning ? 0x2d5a3d : 0x825a38;
    this.gfx.moveTo(bx, by);
    this.gfx.lineTo(hx, hy);
    this.gfx.stroke({ width: 10 * this.scale, color: handleColor });

    this.gfx.circle(hx, hy + 5 * this.scale, 7 * this.scale);
    this.gfx.fill({ color: 0x222222 });

    this.guidePoints.push({ x: hx, y: hy + 5 * this.scale });

    let prevX = hx;
    let prevY = hy;

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;

      const bend = Math.pow(t, 4.0) * this.tension * 85 * this.scale * dir;
      const currX = hx + (tx - hx) * t + bend;
      const currY = hy + (ty - hy) * t;

      const width = 6.5 * this.scale * (1 - t * 0.9);
      this.gfx.moveTo(prevX, prevY);
      this.gfx.lineTo(currX, currY);
      this.gfx.stroke({ width: Math.max(0.6, width), color: 0x111111 });

      if (i % 6 === 0 || i === segments) {
        const rodDx = currX - prevX;
        const rodDy = currY - prevY;
        const len = Math.sqrt(rodDx * rodDx + rodDy * rodDy) || 1;

        const nx = -rodDy / len;
        const ny = rodDx / len;

        const flip = dir;

        const offsetDist = width + 1.5 * this.scale;
        const ringX = currX + nx * flip * offsetDist;
        const ringY = currY + ny * flip * offsetDist;

        this.guidePoints.push({ x: ringX, y: ringY });

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
    if (!this.isCast || this.guidePoints.length < 2) return;

    const isCritical = this.tension > 0.7;
    const color = isCritical ? 0xff0000 : 0xdddddd;
    const alpha = isCritical ? 0.9 : 0.4;

    this.lineGfx.moveTo(this.guidePoints[0].x, this.guidePoints[0].y);

    for (let i = 1; i < this.guidePoints.length; i++) {
      const p1 = this.guidePoints[i - 1];
      const p2 = this.guidePoints[i];
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2 + this.lineSlack * 20 * this.scale;
      this.lineGfx.quadraticCurveTo(mx, my, p2.x, p2.y);
    }

    const baseWidth = this.scale < 0.75 ? 2.6 : 1.4;
    const lineWidth = baseWidth * this.scale;

    this.lineGfx.stroke({ width: lineWidth, color, alpha: alpha });

    const tip = this.guidePoints[this.guidePoints.length - 1];
    const dx = this.hookX - tip.x;
    const dy = this.hookY - tip.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      const finalSlack = this.lineSlack * 90 * this.scale;

      this.lineGfx.moveTo(tip.x, tip.y);

      const segments = 12;
      const points: { x: number; y: number }[] = [];
      points.push({ x: tip.x, y: tip.y });

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

        points.push({ x: px, y: py });
      }

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        this.lineGfx.quadraticCurveTo(p0.x, p0.y, mx, my);
      }
      this.lineGfx.lineTo(this.hookX, this.hookY);

      this.lineGfx.stroke({
        width: lineWidth * 1.1,
        color,
        alpha: isCritical ? 0.95 : 0.6,
      });
    }
  }

  destroy(): void {
    this.gfx.destroy();
    this.lineGfx.destroy();
  }
}
