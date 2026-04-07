import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/** Grouped parameters for HookEntity rendering — replaces 18 positional args */
interface IHookRenderState {
  x: number;
  y: number;
  baitName: string;
  isCast: boolean;
  phase: string;
  time: number;
  castX: number;
  castY: number;
  maxInterest: number;
  hookDepthM: number;
  groundDepthM: number;
  scale?: number;
  rigType?: string;
  currentDepthM?: number;
  debugActive?: boolean;
  escapeProgress?: number;
}

export class HookEntity {
  private container: Container;
  private gfx: Graphics;
  private baitLabel: Text;
  private debugDepthLabel: Text;
  private debugEscapeLabel: Text;
  x = 0;
  y = 0;
  baitName = 'Worm';
  isCast = false;
  scale = 1.0;
  rigType = 'float';

  constructor(parent: Container) {
    this.container = new Container();
    this.gfx = new Graphics();
    this.baitLabel = new Text({
      text: '',
      style: new TextStyle({ fontSize: 10, fill: 0xffffff }),
    });
    this.debugDepthLabel = new Text({
      text: '',
      style: new TextStyle({
        fontSize: 11,
        fill: 0xffff00,
        fontWeight: 'bold',
      }),
    });
    this.debugEscapeLabel = new Text({
      text: '',
      style: new TextStyle({ fontSize: 11, fill: 0xff4444, fontWeight: '900' }),
    });
    this.baitLabel.anchor.set(0.5, 1.5);
    this.debugDepthLabel.anchor.set(-0.5, 0.5);
    this.debugEscapeLabel.anchor.set(0.5, -1.5);
    this.container.addChild(this.gfx);
    this.container.addChild(this.baitLabel);
    this.container.addChild(this.debugDepthLabel);
    this.container.addChild(this.debugEscapeLabel);
    parent.addChild(this.container);
    this.container.visible = false;
  }

  update(state: IHookRenderState): void {
    const {
      x,
      y,
      baitName,
      isCast,
      phase,
      time,
      castX,
      castY,
      maxInterest,
      hookDepthM,
      groundDepthM,
      scale = 1.0,
      rigType = 'float',
      currentDepthM = 0.0,
      debugActive = false,
      escapeProgress = 0,
    } = state;

    this.x = x;
    this.y = y;
    this.baitName = baitName;
    this.isCast = isCast;
    this.scale = scale;
    this.rigType = rigType;
    this.container.visible = isCast;
    this.baitLabel.visible = false;
    this.container.x = x;
    this.container.y = y;
    this.drawHook(
      phase,
      time,
      castX,
      castY,
      maxInterest,
      hookDepthM,
      groundDepthM,
    );

    if (debugActive && isCast) {
      if (phase === 'waiting' || phase === 'bite') {
        this.debugDepthLabel.visible = true;
        this.debugDepthLabel.text = `${currentDepthM.toFixed(2)}m / ${groundDepthM.toFixed(2)}m`;
      } else {
        this.debugDepthLabel.visible = false;
      }

      if (phase === 'reeling' && escapeProgress > 0) {
        this.debugEscapeLabel.visible = true;
        this.debugEscapeLabel.text = `ESCAPE: ${escapeProgress.toFixed(1)}%`;
      } else {
        this.debugEscapeLabel.visible = false;
      }
    } else {
      this.debugDepthLabel.visible = false;
      this.debugEscapeLabel.visible = false;
    }
  }

  private drawHook(
    phase: string,
    time: number,
    castX: number,
    castY: number,
    maxInterest: number,
    hookDepthM: number,
    groundDepthM: number,
  ): void {
    this.gfx.clear();

    // 1. Bobber rendering (NOT for spinning lures)
    if (
      this.isCast &&
      this.rigType !== 'spinning' &&
      phase !== 'reeling' &&
      phase !== 'caught' &&
      phase !== 'broken' &&
      phase !== 'escaped'
    ) {
      const bx = castX - this.container.x;
      const by = castY - this.container.y;

      const isLayingOnSide = hookDepthM > groundDepthM;

      // Animations
      const bobCycle = Math.sin(time * 0.005);

      let tilt = isLayingOnSide
        ? Math.PI / 2.1 // Slightly less than 90 deg for better visibility
        : bobCycle * 0.15 +
          (maxInterest > 0.3 && !isLayingOnSide
            ? (Math.random() - 0.5) * 0.1
            : 0);

      let sinkY = 0;
      let bulbAlphaOverride: number | null = null;

      if (this.rigType === 'feeder') {
        sinkY = 0; // Feeder indicator stays static
      } else if (phase === 'waiting') {
        if (maxInterest > 0.15) {
          // Dynamic Nibble Dips
          const pulse = Math.sin(time * 0.05) * maxInterest;
          const dipThreshold = 0.09;

          if (isLayingOnSide) {
            // When laying on side, "nibble" means the bobber twitches and slightly stands up
            tilt -= pulse * 0.3; // Much more stable rotation range
            sinkY = pulse * 2 * this.scale;
          } else {
            sinkY = Math.max(0, pulse * 14 * this.scale);
            if (pulse > dipThreshold) bulbAlphaOverride = 0;
          }
        } else if (!isLayingOnSide) {
          sinkY = bobCycle * 3 * this.scale;
        }
      } else if (phase === 'bite') {
        if (isLayingOnSide) {
          // When fish bites a laying bobber, it stands up partially and twitches
          tilt = Math.PI / 2.8; // Approx 65 deg
          sinkY = (4 + Math.sin(time * 0.15) * 2) * this.scale;
        } else {
          sinkY = 5 * this.scale;
          tilt = 0;
          bulbAlphaOverride = 0;
        }
      }

      const totalY = by + sinkY;

      // Draw Ripples
      if (phase === 'bite' || bulbAlphaOverride === 0) {
        const isStrike = phase === 'bite';
        const maxRipple = isStrike ? 50 : 80;
        const rippleAge = (time % maxRipple) / maxRipple;
        this.gfx.circle(
          bx,
          by,
          ((isStrike ? 10 : 8) + rippleAge * 22) * this.scale,
        );
        this.gfx.stroke({
          width: 1 * this.scale,
          color: 0xffffff,
          alpha: (1 - rippleAge) * 0.4,
        });
      }

      // 2. Render Bobber
      const bulbRadius = 4.5 * this.scale;

      const sinT = Math.sin(tilt);
      const cosT = Math.cos(tilt);

      // Helper to draw parts with surface clipping
      const drawClippedSegment = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        width: number,
        color: number,
      ) => {
        const midY = (y0 + y1) / 2;
        const underwater = midY > by + 1;
        const alpha = underwater ? Math.max(0.1, 0.5 - (midY - by) * 0.05) : 1;
        if (alpha <= 0) return;

        this.gfx.moveTo(x0, y0);
        this.gfx.lineTo(x1, y1);
        this.gfx.stroke({ width: width * this.scale, color, alpha });
      };

      if (this.rigType === 'feeder') {
        const bulbAlpha = bulbAlphaOverride != null ? bulbAlphaOverride : 1;
        if (bulbAlpha > 0) {
          this.gfx.circle(bx, totalY, 3 * this.scale);
          this.gfx.fill({ color: 0xffffff, alpha: bulbAlpha });
        }
        this.gfx.moveTo(bx, totalY);
        this.gfx.lineTo(0, 0);
        this.gfx.stroke({
          width: 0.5 * this.scale,
          color: 0xffffff,
          alpha: 0.2,
        });
      } else {
        // White Bulb
        const bulbDist = 4 * this.scale;
        const bulbX = bx + sinT * bulbDist;
        const bulbY = totalY + cosT * bulbDist;

        if (isLayingOnSide) {
          const surfaceY = bulbY;
          this.gfx.moveTo(bulbX - bulbRadius, surfaceY);
          this.gfx.arc(bulbX, surfaceY, bulbRadius, Math.PI, 0);
          this.gfx.fill({ color: 0xffffff, alpha: 1 });
          this.gfx.stroke({ width: 1 * this.scale, color: 0xffffff, alpha: 1 });

          this.gfx.moveTo(bulbX + bulbRadius, surfaceY);
          this.gfx.arc(bulbX, surfaceY, bulbRadius, 0, Math.PI);
          this.gfx.fill({ color: 0xffffff, alpha: 0.9 });
          this.gfx.stroke({
            width: 1 * this.scale,
            color: 0xffffff,
            alpha: 0.9,
          });
        } else {
          const bulbAlpha = bulbAlphaOverride != null ? bulbAlphaOverride : 1;

          if (bulbAlpha > 0) {
            this.gfx.circle(bulbX, bulbY, bulbRadius);
            this.gfx.fill({ color: 0xffffff, alpha: bulbAlpha });
            this.gfx.stroke({
              width: 1 * this.scale,
              color: 0xffffff,
              alpha: bulbAlpha,
            });
          }
        }

        // Top Stem (Hi-Viz Orange)
        const topStemStart = 4 * this.scale - bulbRadius;
        const topStemEnd = -14 * this.scale;
        drawClippedSegment(
          bx + sinT * topStemStart,
          totalY + cosT * topStemStart,
          bx + sinT * topStemEnd,
          totalY + cosT * topStemEnd,
          2.8,
          0xff4411,
        );

        // Bottom Stem (Dark)
        const botStemStart = 4 * this.scale + bulbRadius;
        const botStemEnd = 12 * this.scale;
        drawClippedSegment(
          bx + sinT * botStemStart,
          totalY + cosT * botStemStart,
          bx + sinT * botStemEnd,
          totalY + cosT * botStemEnd,
          2,
          0x333333,
        );

        // Line to hook (always underwater part)
        this.gfx.moveTo(bx + sinT * botStemEnd, totalY + cosT * botStemEnd);
        this.gfx.lineTo(0, 0);
        this.gfx.stroke({
          width: 0.5 * this.scale,
          color: 0xffffff,
          alpha: 0.2,
        });
      }
    }

    // 2. Lure rendering (for spinning)
    if (
      this.isCast &&
      this.rigType === 'spinning' &&
      phase !== 'caught' &&
      phase !== 'broken' &&
      phase !== 'escaped'
    ) {
      // No depth offset - user wants to keep things anchored to the surface for top-down view
      const depthOffset = 0;

      this.gfx.circle(0, depthOffset, 3 * this.scale);
      this.gfx.fill({ color: 0xcccccc, alpha: 0.8 });
      this.gfx.stroke({ width: 0.5 * this.scale, color: 0xffffff });

      // Main line is handled by RodEntity. No extra visual line here.
    }

    // 2. Hook/Bait Point (underwater vs surface)
    if (phase === 'reeling' || phase === 'caught') {
      // Small bright dot indicating where the fish is hooked
      this.gfx.circle(0, 0, 3 * this.scale);
      this.gfx.fill({ color: 0xffffff, alpha: 1.0 });
      this.gfx.stroke({ width: 1 * this.scale, color: 0xaaaaaa });
    } else if (!this.isCast) {
      if (this.rigType === 'feeder') {
        // Just draw a small white dot/sinker
        this.gfx.circle(0, 0, 3 * this.scale);
        this.gfx.fill({ color: 0xdddddd });
        this.gfx.stroke({ width: 0.5 * this.scale, color: 0x999999 });
      } else {
        // 2. Initial state (UI/Preparing) - Show white ball/float
        this.gfx.circle(0, 0, 4.5 * this.scale);
        this.gfx.fill({ color: 0xffffff });
        this.gfx.stroke({ width: 0.5 * this.scale, color: 0x999999 });

        // Small hook representation
        this.gfx.moveTo(0, 4.5 * this.scale);
        this.gfx.lineTo(0, 10 * this.scale);
        this.gfx.arc(
          5 * this.scale,
          10 * this.scale,
          5 * this.scale,
          Math.PI,
          0,
        );
        this.gfx.stroke({ width: 1.5 * this.scale, color: 0xc0c0c0 });
      }
    }
    // If waiting/bite, we draw nothing extra at 0,0 - only the bobber is relevant.
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
