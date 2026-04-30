import { Container, Graphics } from 'pixi.js';

export class DragonflyEffect {
  private gfx: Graphics;
  private state: 'hidden' | 'flying' | 'perched' = 'hidden';
  private x = 0;
  private y = 0;
  private targetX = 0;
  private targetY = 0;
  private wingAngle = 0;
  private bodyAngle = 0;
  private time = 0;

  private isTargetingRod = false;
  private currentSpeed = 0;
  private burstTimer = 0;
  private isBursting = false;
  private alpha = 1.0;
  private isFadingOut = false;
  private isFadingIn = false;

  private bodyColor = 0x228b22;
  private headColor = 0x32cd32;

  private readonly PALETTE = [
    { body: 0x228b22, head: 0x32cd32 }, // Green
    { body: 0x800080, head: 0xda70d6 }, // Purple
    { body: 0xdaa520, head: 0xffd700 }, // Golden/Yellow
    { body: 0x008b8b, head: 0x00ffff }, // Cyan/Teal
    { body: 0x8b0000, head: 0xff4500 }, // Crimson/Orange
    { body: 0x1e90ff, head: 0x00bfff }, // DodgerBlue/DeepSkyBlue
  ];

  constructor(parent: Container) {
    this.gfx = new Graphics();
    parent.addChild(this.gfx);
    this.gfx.visible = false;
  }

  public update(
    dt: number,
    W: number,
    H: number,
    weather: string,
    timeOfDay: string,
    phase: string,
    rodTipX: number,
    rodTipY: number,
    maxInterest: number,
    playerReeling: boolean,
    isCast: boolean,
    rigType: string | undefined,
  ): void {
    this.time += dt;

    const canBePresent =
      (weather === 'clear' || weather === 'overcast') &&
      timeOfDay !== 'night' &&
      rigType !== 'spinning';
    const rodIsCalm =
      phase === 'idle' ||
      (isCast && phase === 'waiting' && maxInterest < 0.2 && !playerReeling);

    if (this.state === 'hidden') {
      if (canBePresent && rodIsCalm && Math.random() < dt * 0.045) {
        this.state = 'flying';
        this.isTargetingRod = true;
        this.currentSpeed = 0;
        this.burstTimer = 0.5;
        this.isBursting = true;
        this.alpha = 0;
        this.isFadingIn = true;
        this.isFadingOut = false;

        const variation =
          this.PALETTE[Math.floor(Math.random() * this.PALETTE.length)];
        this.bodyColor = variation.body;
        this.headColor = variation.head;

        const minApproachDist = W < 768 ? 160 : 250;
        const spawnDist = minApproachDist + Math.random() * 100;
        const spawnAngle = Math.random() * Math.PI * 2;

        let sx = rodTipX + Math.cos(spawnAngle) * spawnDist;
        let sy = rodTipY + Math.sin(spawnAngle) * spawnDist;

        sx = Math.max(50, Math.min(W - 50, sx));
        sy = Math.max(50, Math.min(H / 2, sy));

        const dx = sx - rodTipX;
        const dy = sy - (rodTipY - 2);
        const actualDist = Math.sqrt(dx * dx + dy * dy);

        if (actualDist < minApproachDist) {
          const altAngle = spawnAngle + Math.PI;
          let ax = rodTipX + Math.cos(altAngle) * spawnDist;
          let ay = rodTipY + Math.sin(altAngle) * spawnDist;
          ax = Math.max(50, Math.min(W - 50, ax));
          ay = Math.max(50, Math.min(H / 2, ay));

          const adx = ax - rodTipX;
          const ady = ay - (rodTipY - 2);
          const altDist = Math.sqrt(adx * adx + ady * ady);

          if (altDist > actualDist) {
            sx = ax;
            sy = ay;
          }
        }

        this.x = sx;
        this.y = sy;

        this.gfx.visible = true;
        this.targetX = rodTipX;
        this.targetY = rodTipY - 2;
      }
      return;
    }

    if (!canBePresent) {
      if (!this.isFadingOut) {
        this.isFadingOut = true;
        this.isTargetingRod = false;
        this.targetX = this.x + (Math.random() - 0.5) * 400;
        this.targetY = this.y - 200;
        this.state = 'flying';
      }
    }

    if (this.state === 'perched') {
      const dx = rodTipX - this.x;
      const dy = rodTipY - 2 - this.y;
      const movedDist = Math.sqrt(dx * dx + dy * dy);

      if (!rodIsCalm || movedDist > 10) {
        this.state = 'flying';
        this.isTargetingRod = false;
        this.isFadingOut = true;
        this.targetX = this.x + (Math.random() - 0.5) * 300;
        this.targetY = this.y - 150;
      } else {
        this.x = rodTipX;
        this.y = rodTipY - 2;
        this.bodyAngle = 0;
        this.alpha = 1.0;
      }
    } else if (this.state === 'flying') {
      if (this.isTargetingRod) {
        this.targetX = rodTipX;
        this.targetY = rodTipY - 2;

        if (!rodIsCalm) {
          this.isTargetingRod = false;
          this.isFadingOut = true;
          this.targetX = this.x + (Math.random() - 0.5) * 300;
          this.targetY = this.y - 150;
        }
      }

      if (this.isFadingOut) {
        this.alpha -= dt * 1.5;
        if (this.alpha <= 0) {
          this.state = 'hidden';
          this.gfx.visible = false;
          return;
        }
      } else if (this.isFadingIn) {
        this.alpha += dt * 1.2;
        if (this.alpha >= 1.0) {
          this.alpha = 1.0;
          this.isFadingIn = false;
        }
      }

      this.burstTimer -= dt;
      if (this.burstTimer <= 0) {
        this.isBursting = !this.isBursting;

        this.burstTimer = this.isBursting
          ? 0.12 + Math.random() * 0.18
          : 0.2 + Math.random() * 0.3;
      }

      const speedScale = W < 768 ? 0.6 : W < 1000 ? 0.8 : 1.0;
      const targetSpeed = (this.isBursting ? 300 : 20) * speedScale;

      this.currentSpeed += (targetSpeed - this.currentSpeed) * dt * 7;

      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const perchThreshold = 8;

      if (dist < perchThreshold) {
        if (this.isTargetingRod && rodIsCalm) {
          this.state = 'perched';
          this.currentSpeed = 0;
        } else if (!this.isTargetingRod) {
          this.state = 'hidden';
          this.gfx.visible = false;
        }
      } else {
        const moveDist = Math.min(dist, this.currentSpeed * dt);
        this.x += (dx / dist) * moveDist;
        this.y += (dy / dist) * moveDist;

        if (!this.isBursting && dist > 15) {
          this.y += Math.sin(this.time * 25) * 0.4;
        }

        this.bodyAngle = Math.atan2(dy, dx);
      }
    }

    this.draw();
  }

  private draw(): void {
    this.gfx.clear();

    const cx = this.x;
    const cy = this.y;

    const distToTarget = this.isTargetingRod
      ? Math.sqrt(
          Math.pow(this.targetX - this.x, 2) +
            Math.pow(this.targetY - this.y, 2),
        )
      : 100;

    const flapMult =
      this.state === 'flying' && this.isTargetingRod && distToTarget < 20
        ? Math.max(0.1, distToTarget / 20)
        : 1.0;

    const flapSpeed = 70;
    this.wingAngle =
      this.state === 'perched'
        ? -0.05
        : Math.sin(this.time * flapSpeed) * 0.6 * flapMult;

    const bodyAngle = this.bodyAngle;
    const alpha = this.alpha;

    const tailLength = 12;
    const tailEndX = cx - Math.cos(bodyAngle) * tailLength;
    const tailEndY = cy - Math.sin(bodyAngle) * tailLength;

    this.gfx.moveTo(cx, cy);
    this.gfx.lineTo(cx - Math.cos(bodyAngle) * 4, cy - Math.sin(bodyAngle) * 4);
    this.gfx.stroke({ width: 2.2, color: this.bodyColor, alpha });

    this.gfx.moveTo(cx - Math.cos(bodyAngle) * 3, cy - Math.sin(bodyAngle) * 3);
    this.gfx.lineTo(tailEndX, tailEndY);
    this.gfx.stroke({ width: 1.2, color: this.bodyColor, alpha });

    const headX = cx + Math.cos(bodyAngle) * 2.5;
    const headY = cy + Math.sin(bodyAngle) * 2.5;
    this.gfx.circle(headX, headY, 1.8);
    this.gfx.fill({ color: this.headColor, alpha });

    const eyeOffset = 0.6;
    const eyeAngleLeft = bodyAngle + 0.7;
    const eyeAngleRight = bodyAngle - 0.7;
    this.gfx.circle(
      headX + Math.cos(eyeAngleLeft) * eyeOffset,
      headY + Math.sin(eyeAngleLeft) * eyeOffset,
      0.8,
    );
    this.gfx.circle(
      headX + Math.cos(eyeAngleRight) * eyeOffset,
      headY + Math.sin(eyeAngleRight) * eyeOffset,
      0.8,
    );
    this.gfx.fill({ color: 0x000000, alpha: alpha * 0.8 });

    const wingColor = 0xffffff;
    const wingAlpha = (this.state === 'perched' ? 0.45 : 0.25) * alpha;
    const perpAngle = bodyAngle + Math.PI / 2;

    this.drawWing(
      cx,
      cy,
      perpAngle + this.wingAngle,
      11,
      3.5,
      wingColor,
      wingAlpha,
    );
    this.drawWing(
      cx,
      cy,
      perpAngle + Math.PI - this.wingAngle,
      11,
      3.5,
      wingColor,
      wingAlpha,
    );

    const backWingAngle =
      this.state === 'perched'
        ? -0.2
        : Math.sin(this.time * flapSpeed + 1.2) * 0.5 * flapMult;

    const bx = cx - Math.cos(bodyAngle) * 2.5;
    const by = cy - Math.sin(bodyAngle) * 2.5;
    this.drawWing(
      bx,
      by,
      perpAngle + backWingAngle,
      9,
      3,
      wingColor,
      wingAlpha,
    );
    this.drawWing(
      bx,
      by,
      perpAngle + Math.PI - backWingAngle,
      9,
      3,
      wingColor,
      wingAlpha,
    );
  }

  private drawWing(
    x: number,
    y: number,
    angle: number,
    length: number,
    width: number,
    color: number,
    alpha: number,
  ): void {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const pCos = Math.cos(angle + Math.PI / 2);
    const pSin = Math.sin(angle + Math.PI / 2);

    const tx = x + cos * length;
    const ty = y + sin * length;
    const m1x = x + cos * length * 0.5 + pCos * width * 0.5;
    const m1y = y + sin * length * 0.5 + pSin * width * 0.5;
    const m2x = x + cos * length * 0.5 - pCos * width * 0.5;
    const m2y = y + sin * length * 0.5 - pSin * width * 0.5;

    const offset = 1.2;
    const startX = x + cos * offset;
    const startY = y + sin * offset;

    this.gfx.moveTo(startX, startY);
    this.gfx.bezierCurveTo(m1x, m1y, tx, ty, tx, ty);
    this.gfx.bezierCurveTo(tx, ty, m2x, m2y, startX, startY);
    this.gfx.fill({ color, alpha });

    this.gfx.stroke({ width: 0.4, color: 0xffffff, alpha: alpha * 0.3 });
  }

  public destroy(): void {
    this.gfx.destroy({ children: true });
  }
}
