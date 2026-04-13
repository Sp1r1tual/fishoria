import type { Application } from 'pixi.js';

import type { GamePhaseType } from '@/common/types';

export class InputHandler {
  private castClickBound: (e: MouseEvent | TouchEvent) => void;
  private keyDownBound: (e: KeyboardEvent) => void;
  private keyUpBound: (e: KeyboardEvent) => void;
  private canvas: HTMLCanvasElement;

  constructor(
    canvas: HTMLCanvasElement,
    app: Application,
    onCast: (pixel: { x: number; y: number }) => void,
    onHook: () => void,
    onReelingStart: () => void,
    onReelingStop: () => void,
    onRelaxStart: () => void,
    onRelaxStop: () => void,
    onReset: () => void,
    onToggleDebug: () => void,
    onSpeedChange: (speed: 1 | 2 | 3) => void,
    getPhase: () => GamePhaseType,
    getIsSpinning: () => boolean,
  ) {
    this.canvas = canvas;

    this.castClickBound = (e: MouseEvent | PointerEvent | TouchEvent) => {
      const phase = getPhase();
      if (
        phase === 'reeling' ||
        phase === 'caught' ||
        phase === 'broken' ||
        phase === 'escaped'
      )
        return;
      const rect = canvas.getBoundingClientRect();
      let cx: number, cy: number;
      if (
        e instanceof MouseEvent ||
        (window.PointerEvent && e instanceof PointerEvent)
      ) {
        cx = e.clientX - rect.left;
        cy = e.clientY - rect.top;
      } else {
        const touch =
          (e as TouchEvent).changedTouches?.[0] ??
          (e as TouchEvent).touches?.[0];
        if (!touch) return;
        cx = touch.clientX - rect.left;
        cy = touch.clientY - rect.top;
      }
      const scaleX = app.renderer.width / rect.width;
      const scaleY = app.renderer.height / rect.height;
      onCast({ x: cx * scaleX, y: cy * scaleY });
    };

    this.keyDownBound = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      const phase = getPhase();

      const debugKeys = ['`', "'", 'ё', 'Ё'];
      if (debugKeys.includes(e.key)) {
        onToggleDebug();
        return;
      }
      if (e.code === 'Space') {
        if (phase === 'bite') {
          onHook();
          onReelingStart();
        } else if (phase === 'reeling') onReelingStart();
        else if (phase === 'waiting') {
          if (getIsSpinning()) onReelingStart();
          else onHook();
        }
        e.preventDefault();
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (phase === 'bite') {
          onHook();
          onReelingStart();
        } else if (phase === 'waiting') {
          if (getIsSpinning()) onReelingStart();
          else onHook();
        } else {
          onReelingStart();
          onRelaxStop();
        }
        e.preventDefault();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        onRelaxStart();
        onReelingStop();
      }
      if (e.code === 'Digit1') {
        onSpeedChange(1);
        e.preventDefault();
      }
      if (e.code === 'Digit2') {
        onSpeedChange(2);
        e.preventDefault();
      }
      if (e.code === 'Digit3') {
        onSpeedChange(3);
        e.preventDefault();
      }
      if (e.code === 'Escape') onReset();
    };

    this.keyUpBound = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space')
        onReelingStop();
      if (e.code === 'ArrowDown' || e.code === 'KeyS') onRelaxStop();
    };

    if (window.PointerEvent) {
      canvas.addEventListener(
        'pointerup',
        this.castClickBound as EventListener,
      );
    } else {
      canvas.addEventListener(
        'touchend',
        (e) => {
          this.castClickBound(e);
          e.preventDefault();
        },
        { passive: false },
      );
      canvas.addEventListener('click', this.castClickBound as EventListener);
    }
    window.addEventListener('keydown', this.keyDownBound);
    window.addEventListener('keyup', this.keyUpBound);
  }

  destroy(): void {
    if (window.PointerEvent) {
      this.canvas.removeEventListener(
        'pointerup',
        this.castClickBound as EventListener,
      );
    } else {
      this.canvas.removeEventListener(
        'click',
        this.castClickBound as EventListener,
      );
    }
    window.removeEventListener('keydown', this.keyDownBound);
    window.removeEventListener('keyup', this.keyUpBound);
  }
}
