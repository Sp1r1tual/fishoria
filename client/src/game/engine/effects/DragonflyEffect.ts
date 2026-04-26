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
      this.isFadingOut = true;
      this.isTargetingRod = false;
      this.targetX = this.x + (Math.random() - 0.5) * 400;
      this.targetY = this.y - 200;
      this.state = 'flying';
    } else if (this.state === 'perched') {
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

      if (dist < 4) {
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

        if (!this.isBursting) {
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

    this.wingAngle =
      this.state === 'perched' ? 0.1 : Math.sin(this.time * 60) * 0.5;
    this.gfx.moveTo(cx, cy);
    this.gfx.lineTo(
      cx - Math.cos(this.bodyAngle) * 8,
      cy - Math.sin(this.bodyAngle) * 8,
    );
    this.gfx.stroke({ width: 1.5, color: this.bodyColor, alpha: this.alpha });

    this.gfx.moveTo(cx, cy);
    this.gfx.lineTo(
      cx + Math.cos(this.bodyAngle) * 4,
      cy + Math.sin(this.bodyAngle) * 4,
    );
    this.gfx.stroke({ width: 2, color: this.headColor, alpha: this.alpha });

    const wingLength = 10;
    const wingColor = 0xffffff;
    const wingAlpha = (this.state === 'perched' ? 0.6 : 0.3) * this.alpha;
    const perpAngle = this.bodyAngle + Math.PI / 2;
    const w1x = cx + Math.cos(perpAngle - this.wingAngle) * wingLength;
    const w1y = cy + Math.sin(perpAngle - this.wingAngle) * wingLength;
    this.gfx.moveTo(cx, cy);
    this.gfx.lineTo(w1x, w1y);
    this.gfx.stroke({ width: 1, color: wingColor, alpha: wingAlpha });

    const w2x =
      cx + Math.cos(perpAngle + Math.PI + this.wingAngle) * wingLength;
    const w2y =
      cy + Math.sin(perpAngle + Math.PI + this.wingAngle) * wingLength;
    this.gfx.moveTo(cx, cy);
    this.gfx.lineTo(w2x, w2y);
    this.gfx.stroke({ width: 1, color: wingColor, alpha: wingAlpha });
  }

  public destroy(): void {
    this.gfx.destroy({ children: true });
  }
}
