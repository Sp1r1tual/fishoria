import { useEffect } from 'react';
import {
  prepareWithSegments,
  layoutNextLine,
  type LayoutCursor,
} from '@chenglou/pretext';

import type { IFishVisualState } from '@/common/types';

import { drawFish } from '@/common/graphic/draw-fish';

interface IUseBottomInfoAnimationProps {
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
}: IUseBottomInfoAnimationProps) => {
  useEffect(() => {
    if (!isVisible || !prepared || !fontsLoaded) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx || !wrap) return;

    const textColor =
      getComputedStyle(wrap).getPropertyValue('--clr-text').trim() || '#fff';

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

    ctx.font = fontStr;
    const textWidth = wrapW - horizontalPad * 2;

    type Glyph = {
      char: string;
      x: number;
      y: number;
      w: number;
      cx: number;
      nx: number;
      ny: number;
      nr: number;
      ph: number;
    };
    const glyphs: Glyph[] = [];

    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
    let y = padY + (lineH - fontSize) / 2;
    let lineIdx = 0;
    let textExhausted = false;

    while (lineIdx < maxLines && !textExhausted) {
      const line = layoutNextLine(prepared, cursor, textWidth);
      if (line && line.text) {
        const fullLineText = line.text;
        const naturalWidth = line.width;

        const nextLine = layoutNextLine(prepared, line.end, textWidth);
        const isLastLine = !nextLine || !nextLine.text;

        const textToDisplay = fullLineText.trim();
        const numGaps = (textToDisplay.match(/\s+/g) || []).length;

        let gapExtra = 0;
        if (
          !isLastLine &&
          naturalWidth > 0 &&
          naturalWidth < textWidth &&
          numGaps > 0
        ) {
          gapExtra = (textWidth - naturalWidth) / numGaps;
        }

        let currentX = horizontalPad;
        const spaceW = ctx.measureText(' ').width;
        let inWhitespace = false;

        for (const char of textToDisplay) {
          if (/\s/.test(char)) {
            if (!inWhitespace) {
              currentX += spaceW + gapExtra;
              inWhitespace = true;
            }
          } else {
            inWhitespace = false;
            const charW = ctx.measureText(char).width;
            glyphs.push({
              char,
              x: currentX,
              y,
              w: charW,
              cx: currentX + charW / 2,
              nx: Math.sin(currentX * 0.5 + y * 0.2),
              ny: Math.cos(currentX * 0.2 + y * 0.5),
              nr:
                Math.sin(currentX * 0.1) * 0.5 +
                Math.sin(currentX * 0.1 + y * 0.1),
              ph: currentX * 0.01,
            });
            currentX += charW;
          }
        }

        cursor = line.end;
        lineIdx++;
      } else {
        textExhausted = true;
      }
      y += lineH;
    }

    let rafId = 0;
    let lastTime: number | null = null;

    const animate = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, wrapW, H);

      const fish = updateFishLogic(dt, wrapW, H);
      const fishSize = isMobile ? 24 : baseFishSize;

      drawFish(ctx, fish, fishSize);

      const fishOp = Math.min(1, fish.opacity * 3);
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

      const effectRadius = maskRX * 1.8;
      const effectRadiusSq = effectRadius * effectRadius;
      const fishActive = fish.opacity > 0.01;
      const baseBreathingPhase = fish.t * 2;
      const fOp50 = 50 * fishOp;

      for (const glyph of glyphs) {
        let displayX = glyph.x;
        let displayY = glyph.y;
        let displayRotate = 0;
        let displayAlpha = 1;

        if (fishActive) {
          const dx = glyph.cx - centerX;
          const dy = glyph.y - centerY;
          const distSq = dx * dx + dy * dy;

          if (distSq < effectRadiusSq) {
            const dist = Math.sqrt(distSq);
            const ratio = 1 - dist / effectRadius;
            const power = ratio * ratio;

            const repulsion = power * fOp50;

            displayX += (dx / dist) * repulsion;
            displayY += (dy / dist) * repulsion;

            displayRotate = glyph.nr * power * 1.5 * fishOp;
            displayAlpha = Math.max(0, 1 - power * 0.95 * fishOp);

            const shift =
              power *
              (20 * fishOp + Math.sin(baseBreathingPhase + glyph.ph) * 2);
            displayX += glyph.nx * shift;
            displayY += glyph.ny * shift;
          }
        }

        if (displayAlpha > 0.01) {
          if (displayRotate === 0 && displayAlpha === 1) {
            ctx.fillText(glyph.char, displayX, displayY);
          } else {
            ctx.save();
            ctx.translate(displayX + glyph.w / 2, displayY);
            if (displayRotate !== 0) ctx.rotate(displayRotate);
            if (displayAlpha !== 1) ctx.globalAlpha = displayAlpha;
            ctx.fillText(glyph.char, -glyph.w / 2, 0);
            ctx.restore();
          }
        }
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
