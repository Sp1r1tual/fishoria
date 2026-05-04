import type { IVec2 } from '@/common/types';

export function pointInPolygon(pt: IVec2, poly: IVec2[]): boolean {
  if (poly.length < 3) return false;

  let minX = poly[0].x,
    maxX = poly[0].x;
  let minY = poly[0].y,
    maxY = poly[0].y;
  for (let i = 1; i < poly.length; i++) {
    const p = poly[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  if (pt.x < minX || pt.x > maxX || pt.y < minY || pt.y > maxY) {
    return false;
  }

  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y;
    const xj = poly[j].x,
      yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
