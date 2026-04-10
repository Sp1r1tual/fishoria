import { useEffect } from 'react';
import {
  prepareWithSegments,
  layoutNextLine,
  type LayoutCursor,
} from '@chenglou/pretext';

import type { IFishVisualState } from '@/common/types';

import { drawFish } from '@/common/graphic/draw-fish';

interface UseBottomInfoAnimationProps {
  isVisible: boolean;
  prepared: ReturnType<typeof prepareWithSegments> | null;
  fontsLoaded: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  wrapRef: React.RefObject<HTMLDivElement | null>;
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
}

export const useBottomInfoAnimation = ({
  isVisible,
  prepared,
  fontsLoaded,
  canvasRef,
  wrapRef,
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
      const fishSize = isMobile ? 24 : baseFishSize;

      drawFish(ctx, fish, fishSize);

      const fishOp = Math.min(1, fish.opacity * 3);
      const textWidth = wrapW - horizontalPad * 2;
      const facingLeft = Math.abs(fish.angle) > Math.PI / 2;

      const A = fishSize * 1.35;
      const B = fishSize * 0.75;
      const cosT = Math.cos(fish.angle);
      const sinT = Math.sin(fish.angle);
      const localYScale = facingLeft ? -1 : 1;

      const localX = -15 * (fishSize / 100);
      const localY = -15 * (fishSize / 100);
      const rotatedX = localX * cosT - localY * localYScale * sinT;
      const rotatedY = localX * sinT + localY * localYScale * cosT;
      const centerX = fish.x + rotatedX;
      const centerY = fish.y + rotatedY;

      const RX =
        (Math.sqrt(A * A * cosT * cosT + B * B * sinT * sinT) + 6) * fishOp;
      const maskRX = RX * 1.4;

      ctx.font = fontStr;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';

      let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
      let y = padY + (lineH - fontSize) / 2;
      let lineIdx = 0;
      let textExhausted = false;

      while (lineIdx < maxLines && !textExhausted) {
        const line = layoutNextLine(prepared, cursor, textWidth);
        if (line && line.text) {
          const fullLineText = line.text;
          const naturalWidth = ctx.measureText(fullLineText).width;

          const tempCursor: LayoutCursor = {
            segmentIndex: line.end.segmentIndex,
            graphemeIndex: line.end.graphemeIndex,
          };
          const nextLine = layoutNextLine(prepared, tempCursor, textWidth);
          const isLastLine = !nextLine || !nextLine.text;

          let gapExtra = 0;
          if (!isLastLine && naturalWidth > 0 && naturalWidth < textWidth) {
            const words = fullLineText.trim().split(/\s+/).filter(Boolean);
            const numGaps = Math.max(0, words.length - 1);
            if (numGaps > 0) {
              const extraSpace = textWidth - naturalWidth;
              gapExtra = extraSpace / numGaps;
            }
          }

          let currentX = horizontalPad;
          const words = fullLineText.trim().split(/\s+/).filter(Boolean);

          for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
            const word = words[wordIdx];
            const wordChars = Array.from(word);

            for (const char of wordChars) {
              const charW = ctx.measureText(char).width;

              let displayX = currentX;
              let displayY = y;
              let displayRotate = 0;
              let displayAlpha = 1;

              if (fish.opacity > 0.01) {
                const dx = currentX + charW / 2 - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const effectRadius = maskRX * 1.8;

                if (dist < effectRadius) {
                  const power = Math.pow(1 - dist / effectRadius, 2);
                  const repulsion = power * 50 * fishOp;

                  displayX += (dx / dist) * repulsion;
                  displayY += (dy / dist) * repulsion;

                  const noiseX = Math.sin(currentX * 0.5 + y * 0.2);
                  const noiseY = Math.cos(currentX * 0.2 + y * 0.5);
                  const noiseRot = Math.sin(currentX * 0.1 + y * 0.1);

                  displayRotate =
                    (Math.sin(currentX * 0.1) * 0.5 + noiseRot) *
                    power *
                    1.5 *
                    fishOp;
                  displayAlpha = Math.max(0, 1 - power * 0.95 * fishOp);

                  displayX += noiseX * power * 20 * fishOp;
                  displayY += noiseY * power * 20 * fishOp;

                  const breathing = Math.sin(fish.t * 2 + currentX * 0.01) * 2;
                  displayX += noiseX * breathing * power;
                  displayY += noiseY * breathing * power;
                }
              }

              if (displayAlpha > 0.01) {
                ctx.save();
                ctx.translate(displayX + charW / 2, displayY);
                ctx.rotate(displayRotate);
                ctx.globalAlpha = displayAlpha;
                ctx.fillText(char, -charW / 2, 0);
                ctx.restore();
              }

              currentX += charW;
            }

            if (wordIdx < words.length - 1) {
              const spaceW = ctx.measureText(' ').width;
              currentX += spaceW + gapExtra;
            }
          }

          cursor = line.end;
          lineIdx++;
        } else {
          textExhausted = true;
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
    canvasRef,
    wrapRef,
  ]);
};
