import type { IVec2, IAllowedCastArea, ICastTarget } from '@/common/types';

import { pointInPolygon } from '@/game/utils/MathUtils';

import { SCENE_TIMING } from '@/common/configs/game';

function pointInCircle(pt: IVec2, center: IVec2, r: number): boolean {
  const dx = pt.x - center.x,
    dy = pt.y - center.y;
  return dx * dx + dy * dy <= r * r;
}

export function validateCast(
  clickPixel: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number,
  allowedArea: IAllowedCastArea,
  waterBoundaryY: number,
): ICastTarget | null {
  // 1. Initial clamp to water boundary (before checking against specific area polygon)
  const nyRaw = clickPixel.y / canvasHeight;
  const ny = Math.max(waterBoundaryY + SCENE_TIMING.castWaterMargin, nyRaw); // Clamp to water plus margin
  const nx = clickPixel.x / canvasWidth;
  const pt: IVec2 = { x: nx, y: ny };

  let valid = false;
  if (allowedArea.type === 'polygon' && allowedArea.points) {
    valid = pointInPolygon(pt, allowedArea.points);
  } else if (
    allowedArea.type === 'circle' &&
    allowedArea.center &&
    allowedArea.radius != null
  ) {
    valid = pointInCircle(pt, allowedArea.center, allowedArea.radius);
  }

  if (!valid) return null;

  // Return the CLAMPED pixel coordinates
  return {
    normalizedX: nx,
    normalizedY: ny,
    pixelX: nx * canvasWidth,
    pixelY: ny * canvasHeight,
  };
}
