import { Application } from 'pixi.js';

import type { IScene } from '@/common/types';

import BackgroundTimerWorker from './workers/backgroundTimer.worker?worker';

export class Game {
  private app!: Application;
  private currentScene: IScene | null = null;
  private isDestroyed = false;
  private worker: Worker | null = null;
  private handleVisibilityChange: (() => void) | null = null;

  async init(container: HTMLDivElement): Promise<void> {
    this.app = new Application();

    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (/Macintosh|Mac OS X/.test(navigator.userAgent) &&
        navigator.maxTouchPoints > 1);
    // Increase resolution for better quality on iOS (Retina), capped at 3.0
    const maxResolution = isIOS
      ? Math.min(window.devicePixelRatio || 2, 3)
      : window.devicePixelRatio || 1;

    await this.app.init({
      width: W,
      height: H,
      backgroundColor: 0x0d1b2a,
      antialias: true,
      resolution: maxResolution,
      autoDensity: true,
      roundPixels: false,
      powerPreference: 'high-performance',
      preference: isIOS ? 'webgl' : undefined,
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

    // When visible, use standard PixiJS ticker
    this.app.ticker.add((ticker) => {
      if (!document.hidden) {
        this.currentScene?.update(ticker.deltaTime);
      }
    });

    // Instantiate the Web Worker to act as a reliable background timer (bypassing main thread 1000ms throttle)
    this.worker = new BackgroundTimerWorker();
    this.worker.onmessage = (e) => {
      // If hidden, update game logic with calculated delta time
      if (document.hidden && !this.isDestroyed) {
        this.currentScene?.update(e.data.dt);
      }
    };

    this.handleVisibilityChange = () => {
      if (document.hidden) {
        this.worker?.postMessage('start');
      } else {
        this.worker?.postMessage('stop');
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
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
    if (this.handleVisibilityChange) {
      document.removeEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
    }
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
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
