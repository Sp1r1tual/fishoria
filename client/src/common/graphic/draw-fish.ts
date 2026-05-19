import type { IFishVisualState } from '@/common/types';

import perchSrc from '@/assets/fish/perch.webp';

const perchImg = new Image();
perchImg.src = perchSrc;

export const drawFish = (
  ctx: CanvasRenderingContext2D,
  fish: IFishVisualState,
  fishSize: number,
) => {
  if (fish.opacity <= 0.01) return;

  const facingLeft = Math.abs(fish.angle) > Math.PI / 2;
  const S = fishSize / 100;

  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.rotate(fish.angle);

  if (facingLeft) ctx.scale(1, -1);

  ctx.globalAlpha = fish.opacity;

  if (perchImg.complete && perchImg.naturalHeight !== 0) {
    const drawWidth = 300 * S;
    const drawHeight =
      drawWidth * (perchImg.naturalHeight / perchImg.naturalWidth);

    const swimWiggle = Math.sin(fish.t * 8) * 0.04;

    const squeezeX = 1 + Math.sin(fish.t * 8) * 0.015;
    const squeezeY = 1 + Math.cos(fish.t * 8) * 0.015;

    ctx.rotate(swimWiggle);

    ctx.scale(-squeezeX, squeezeY);

    ctx.drawImage(
      perchImg,
      -drawWidth / 2 + 30 * S,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );
  }

  ctx.restore();
};
