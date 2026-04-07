import { Container, Graphics, Sprite, Text, Assets, Texture } from 'pixi.js';

import { FishState } from '../../domain/fish/FishState';
import type { Fish } from '../../domain/fish/Fish';

export class FishEntity {
  fish: Fish;
  private container: Container;
  private body: Sprite;
  private interestRing: Graphics;
  private debugGfx: Graphics;
  private debugLabel: Text;
  private indicatorAlpha = 0;
  private debugNeedsClear = false;
  private lastLabelText = '';
  private labelUpdateCounter = 0;
  private rippleNeedsClear = false;
  private activeRipple: {
    age: number;
    maxAge: number;
    scaleX: number;
    scaleY: number;
    isDouble: boolean;
    x: number;
    y: number;
  } | null = null;

  constructor(fish: Fish, parent: Container) {
    this.fish = fish;
    this.container = new Container();
    this.interestRing = new Graphics();
    this.debugGfx = new Graphics();
    this.debugLabel = new Text({
      text: '',
      style: { fontSize: 10, fill: 0xff4444, align: 'center' },
    });

    this.body = new Sprite();
    Assets.load(fish.config.imageUrl)
      .then((texture) => {
        if (!this.body.destroyed && this.fish === fish) {
          this.body.texture = texture;
        }
      })
      .catch(console.error);
    this.body.anchor.set(0.5); // Center the sprite
    this.body.visible = false; // Fish are underwater, hidden entirely

    // Scale body down based on weight
    const scale = Math.max(0.15, Math.min(fish.weightRange.max / 15, 0.4));
    this.body.scale.set(scale);

    this.container.addChild(this.body);
    this.container.addChild(this.debugGfx);
    this.container.addChild(this.debugLabel);
    // Draw ripples on the static parent layer, divorced from the moving fish container
    parent.addChild(this.interestRing);

    // Initial species dot draw - only color and alpha change later
    this.debugGfx.circle(0, 0, 3);
    this.debugGfx.fill({ color: fish.config.color });
    this.debugLabel.y = -20;
    this.debugLabel.anchor.set(0.5);

    parent.addChild(this.container);
  }

  update(
    deltaTime: number,
    visibility: {
      debug: boolean;
      echo: boolean;
      isCast?: boolean;
      intensity?: number;
    },
  ): void {
    this.container.x = this.fish.position.x;
    this.container.y = this.fish.position.y;

    const { x: vx, y: vy } = this.fish.velocity;
    if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) {
      this.body.scale.x = Math.abs(this.body.scale.y) * (vx < 0 ? -1 : 1);
      const pitch = Math.atan2(vy, Math.abs(vx));
      this.body.rotation = pitch * 0.3;
    }

    // Random surface ripple to indicate fish presence
    if (
      !this.activeRipple &&
      this.fish.state === FishState.Idle &&
      this.fish.nearbyFishCount >= 3 &&
      Math.random() < 0.0006 * deltaTime
    ) {
      this.activeRipple = {
        age: 0,
        maxAge: 120 + Math.random() * 60,
        scaleX: 1 + (Math.random() - 0.5) * 0.2,
        scaleY: 0.6 + (Math.random() - 0.5) * 0.1,
        isDouble: Math.random() > 0.5,
        x: this.fish.position.x,
        y: this.fish.position.y,
      };
      this.interestRing.x = this.activeRipple.x;
      this.interestRing.y = this.activeRipple.y;
    }

    if (this.activeRipple) {
      this.interestRing.clear();
      this.activeRipple.age += deltaTime;
      const r = this.activeRipple;
      const agePct = r.age / r.maxAge;

      if (agePct >= 1) {
        this.activeRipple = null;
      } else {
        const radius1 = 2 + agePct * 6;
        this.interestRing.ellipse(0, 0, radius1 * r.scaleX, radius1 * r.scaleY);
        this.interestRing.stroke({
          width: 0.8,
          color: 0xffffff,
          alpha: (1 - agePct) * 0.35,
        });

        if (r.isDouble && agePct > 0.2) {
          const agePct2 = (agePct - 0.2) / 0.8;
          const radius2 = 2 + agePct2 * 5;
          this.interestRing.ellipse(
            0,
            0,
            radius2 * r.scaleX,
            radius2 * r.scaleY,
          );
          this.interestRing.stroke({
            width: 0.8,
            color: 0xffffff,
            alpha: (1 - agePct2) * 0.25,
          });
        }
      }
      this.rippleNeedsClear = true;
    } else if (this.rippleNeedsClear) {
      this.interestRing.clear();
      this.rippleNeedsClear = false;
    }

    this.container.alpha = this.fish.state === FishState.Hooked ? 0.4 : 0.85;

    // Calculate target and smooth the indicator visibility
    const targetAlpha = visibility.debug
      ? 1.0
      : visibility.echo
        ? Math.max(0, visibility.intensity || 0)
        : 0;

    // Smooth alpha changes: fast fade-in, slow decay (phosphor-like)
    const fadeSpeed = targetAlpha > this.indicatorAlpha ? 0.15 : 0.05;
    this.indicatorAlpha +=
      (targetAlpha - this.indicatorAlpha) * fadeSpeed * deltaTime;
    if (this.indicatorAlpha < 0.005) {
      this.indicatorAlpha = 0;
    }

    const isVisible = this.indicatorAlpha > 0;
    this.container.visible = isVisible;

    if (isVisible) {
      this.debugNeedsClear = true;
      this.debugGfx.alpha = this.indicatorAlpha;
      this.debugGfx.tint = visibility.debug ? 0xffffff : 0x00ff00; // Efficient way to change color if it's white or colored

      // Labels only appear if indicator is fairly strong and update less frequently
      this.debugLabel.alpha = Math.max(0, (this.indicatorAlpha - 0.4) * 1.6);

      if (this.debugLabel.alpha > 0) {
        this.labelUpdateCounter += deltaTime;
        if (this.labelUpdateCounter >= 10) {
          // Update every 10 frames approx
          this.labelUpdateCounter = 0;
          let newText = '';
          if (visibility.debug) {
            const weightStr =
              this.fish.weight > 0
                ? `\nWt: ${this.fish.weight.toFixed(2)}kg`
                : '';
            const isEngaged =
              this.fish.state === FishState.Biting ||
              this.fish.state === FishState.Hooked ||
              this.fish.state === FishState.Escaping;
            const showInterest = !isEngaged && visibility.isCast;
            const interestStr = showInterest
              ? `\nInt: ${this.fish.interestLevel.toFixed(2)}`
              : '';
            newText = `${this.fish.config.name}${interestStr}\nDep: ${this.fish.depth.toFixed(2)}m${weightStr}`;
          } else {
            newText = `${this.fish.depth.toFixed(1)}m`;
          }

          if (this.lastLabelText !== newText) {
            this.debugLabel.text = newText;
            this.lastLabelText = newText;
          }
        }
      }
    } else if (this.debugNeedsClear) {
      this.debugNeedsClear = false;
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
    this.interestRing.destroy();
  }

  reset(fish: Fish): void {
    this.fish = fish;
    this.indicatorAlpha = 0;
    this.debugNeedsClear = false;
    this.lastLabelText = '';
    this.labelUpdateCounter = 0;
    this.rippleNeedsClear = false;
    this.activeRipple = null;

    this.body.texture = Texture.EMPTY;
    Assets.load(fish.config.imageUrl)
      .then((texture) => {
        if (!this.body.destroyed && this.fish === fish) {
          this.body.texture = texture;
        }
      })
      .catch(console.error);
    this.body.visible = false;
    const scale = Math.max(0.15, Math.min(fish.weightRange.max / 15, 0.4));
    this.body.scale.set(scale);

    this.debugGfx.clear();
    this.debugGfx.circle(0, 0, 3);
    this.debugGfx.fill({ color: fish.config.color });
    this.debugLabel.alpha = 0;
    this.debugLabel.text = '';

    this.interestRing.clear();
    this.interestRing.alpha = 1;
    this.interestRing.visible = true;

    this.container.alpha = 0.85;
    this.container.visible = false;
  }
}
