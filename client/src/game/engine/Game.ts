import { Application } from 'pixi.js';

import type { IScene } from '@/common/types';

export class Game {
  private app!: Application;
  private currentScene: IScene | null = null;
  private isDestroyed = false;

  async init(container: HTMLDivElement): Promise<void> {
    this.app = new Application();

    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (/Macintosh|Mac OS X/.test(navigator.userAgent) &&
        navigator.maxTouchPoints > 1);
    // Increase resolution for better quality on iOS (Retina), but cap at 2.5 for performance balance
    const maxResolution = isIOS
      ? Math.min(window.devicePixelRatio || 2, 2.5)
      : window.devicePixelRatio || 1;

    await this.app.init({
      width: W,
      height: H,
      backgroundColor: 0x0d1b2a,
      antialias: true, // Re-enable for smooth edges
      resolution: maxResolution,
      autoDensity: true,
      roundPixels: false, // OFF to allow sub-pixel smoothing for curves
      powerPreference: 'high-performance',
    });

    if (this.isDestroyed) {
      this.app.destroy(false);
      return;
    }

    // Let PixiJS own the canvas — avoids WebGL context sharing issues
    this.app.canvas.style.display = 'block';
    this.app.canvas.style.width = '100%';
    this.app.canvas.style.height = '100%';
    this.app.canvas.style.border = 'none';
    this.app.canvas.style.outline = 'none';
    this.app.canvas.style.margin = '0';
    container.appendChild(this.app.canvas);

    this.app.ticker.add((ticker) => {
      this.currentScene?.update(ticker.deltaTime);
    });
  }

  async loadScene(scene: IScene): Promise<void> {
    if (this.currentScene) {
      this.currentScene.destroy();
      this.app.stage.removeChildren();
      this.currentScene = null;
    }
    await scene.init(this.app.stage, this.app);
    this.currentScene = scene;
  }

  resize(width: number, height: number): void {
    if (!this.app?.renderer) return;
    this.app.renderer.resize(width, height);
    this.currentScene?.resize(width, height);
  }

  get canvas(): HTMLCanvasElement | undefined {
    return this.app?.canvas;
  }
  get width(): number {
    return this.app?.renderer?.width ?? 0;
  }
  get height(): number {
    return this.app?.renderer?.height ?? 0;
  }

  destroy(): void {
    this.isDestroyed = true;
    this.currentScene?.destroy();
    try {
      if (this.app?.renderer && this.app.canvas) {
        this.app.canvas.remove();
      }
    } catch {
      // ignore pixi canvas getter errors
    }
    try {
      if (this.app && this.app.renderer) {
        this.app.destroy(false);
      }
    } catch {
      // Ignore errors if Pixi isn't fully initialized
    }
  }
}
