import { useEffect } from 'react';
import {
  prepareWithSegments,
  layoutNextLine,
  type LayoutCursor,
} from '@chenglou/pretext';

import type { IFishVisualState } from '@/common/types';

interface UseBottomInfoAnimationProps {
  isVisible: boolean;
  prepared: ReturnType<typeof prepareWithSegments> | null;
  fontsLoaded: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  wrapRef: React.RefObject<HTMLDivElement | null>;
  fishRef: React.RefObject<SVGSVGElement | null>;
  updateFishLogic: (
    dt: number,
    width: number,
    height: number,
  ) => IFishVisualState;
  containerWidth: number;
  horizontalPad: number;
  isMobile: boolean;
  baseFishSize: number;
  fontStr: string;
  lineH: number;
  padY: number;
  fontSize: number;
  maxLines: number;
  minSlot: number;
}

export const useBottomInfoAnimation = ({
  isVisible,
  prepared,
  fontsLoaded,
  canvasRef,
  wrapRef,
  fishRef,
  updateFishLogic,
  containerWidth,
  horizontalPad,
  isMobile,
  baseFishSize,
  fontStr,
  lineH,
  padY,
  fontSize,
  maxLines,
  minSlot,
}: UseBottomInfoAnimationProps) => {
  useEffect(() => {
    if (!isVisible || !prepared || !fontsLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;

    let rafId = 0;
    let lastTime: number | null = null;
    let textColor = '';

    const animate = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const wrap = wrapRef.current;
      const fishEl = fishRef.current;
      if (!wrap) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      if (!textColor) {
        textColor =
          getComputedStyle(wrap).getPropertyValue('--clr-text').trim() ||
          '#fff';
      }

      const wrapW = containerWidth || wrap.clientWidth;
      const H = wrap.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (
        canvas.width !== Math.floor(wrapW * dpr) ||
        canvas.height !== Math.floor(H * dpr)
      ) {
        canvas.width = Math.floor(wrapW * dpr);
        canvas.height = Math.floor(H * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, wrapW, H);

      const fish = updateFishLogic(dt, wrapW, H);
      const W = wrapW - horizontalPad * 2 - 8;
      const fishSize = isMobile ? 24 : baseFishSize;

      // Update Fish DOM
      if (fishEl) {
        if (fish.opacity > 0.01) {
          const facingLeft = Math.abs(fish.angle) > Math.PI / 2;
          const tailMove = Math.sin(fish.t * 8) * 15;

          fishEl.style.display = 'block';
          fishEl.style.opacity = fish.opacity.toString();
          fishEl.style.left = `${fish.x}px`;
          fishEl.style.top = `${fish.y}px`;
          fishEl.style.width = `${fishSize * 3}px`;
          fishEl.style.height = `${fishSize * 1.5}px`;
          fishEl.style.transform = `translate(-50%, -50%) rotate(${fish.angle}rad) ${facingLeft ? 'scale(1, -1)' : ''}`;

          const tailPath = fishEl.querySelector('[data-tail]');
          if (tailPath) {
            tailPath.setAttribute(
              'd',
              `M-95 0 C-145 ${-60 + tailMove} -145 ${60 + tailMove} -95 0`,
            );
          }
        } else {
          fishEl.style.display = 'none';
        }
      }

      ctx.font = fontStr;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';

      const A = fishSize * 1.35;
      const B = fishSize * 0.75;
      const cosT = Math.cos(fish.angle);
      const sinT = Math.sin(fish.angle);
      const facingLeft = Math.abs(fish.angle) > Math.PI / 2;
      const localYScale = facingLeft ? -1 : 1;

      const localX = -15 * (fishSize / 100);
      const localY = -15 * (fishSize / 100);
      const rotatedX = localX * cosT - localY * localYScale * sinT;
      const rotatedY = localX * sinT + localY * localYScale * cosT;
      const centerX = fish.x + rotatedX;
      const centerY = fish.y + rotatedY;

      const RY =
        Math.sqrt(A * A * sinT * sinT + B * B * cosT * cosT) + lineH * 0.5 + 4;
      const RX = Math.sqrt(A * A * cosT * cosT + B * B * sinT * sinT) + 6;

      let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
      let y = padY + fontSize / 2;
      let lineIdx = 0;
      let textExhausted = false;

      while (lineIdx < maxLines && !textExhausted) {
        const lineMid = y;
        const dy = lineMid - centerY;
        const opacityFactor = Math.min(1, fish.opacity * 3);
        const currentRY = RY * opacityFactor;
        const currentRX = RX * opacityFactor;
        const blocked = fish.opacity > 0.01 && Math.abs(dy) < currentRY;

        if (!blocked) {
          const line = layoutNextLine(prepared, cursor, W);
          if (line && line.text) {
            ctx.fillText(line.text, horizontalPad, y);
            cursor = line.end;
            lineIdx++;
          } else {
            textExhausted = true;
          }
        } else {
          const hw =
            currentRX *
              Math.sqrt(Math.max(0, 1 - (dy * dy) / (currentRY * currentRY))) +
            2;
          const leftEnd = centerX - hw;
          const rightStart = centerX + hw;
          const leftW = Math.max(0, leftEnd - horizontalPad);
          const rightW = Math.max(0, wrapW - horizontalPad - rightStart);

          let leftExhausted = false;
          if (leftW >= minSlot) {
            const line = layoutNextLine(prepared, cursor, leftW);
            if (line && line.text) {
              ctx.fillText(line.text, horizontalPad, y);
              cursor = line.end;
              lineIdx++;
            } else if (!line && leftW > 0) {
              leftExhausted = true;
            }
          }

          if (!textExhausted && !leftExhausted && rightW >= minSlot) {
            const line = layoutNextLine(prepared, cursor, rightW);
            if (line && line.text) {
              ctx.fillText(line.text, rightStart, y);
              cursor = line.end;
              lineIdx++;
            } else if (!line && rightW > 0) {
              textExhausted = true;
            }
          }
        }
        y += lineH;
      }

      ctx.restore();
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [
    isVisible,
    prepared,
    fontsLoaded,
    updateFishLogic,
    containerWidth,
    horizontalPad,
    isMobile,
    baseFishSize,
    fontStr,
    lineH,
    padY,
    fontSize,
    maxLines,
    minSlot,
    canvasRef,
    wrapRef,
    fishRef,
  ]);
};
