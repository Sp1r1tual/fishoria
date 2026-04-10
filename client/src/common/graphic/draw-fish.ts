import type { IFishVisualState } from '@/common/types';

export const drawFish = (
  ctx: CanvasRenderingContext2D,
  fish: IFishVisualState,
  fishSize: number,
) => {
  if (fish.opacity <= 0.01) return;

  const facingLeft = Math.abs(fish.angle) > Math.PI / 2;
  const S = fishSize / 100;
  const tailMove = Math.sin(fish.t * 8) * 15;

  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.rotate(fish.angle);
  if (facingLeft) ctx.scale(1, -1);
  ctx.globalAlpha = fish.opacity;

  // Tail
  ctx.beginPath();
  ctx.moveTo(-95 * S, 0);
  ctx.bezierCurveTo(
    -145 * S,
    (-60 + tailMove) * S,
    -145 * S,
    (60 + tailMove) * S,
    -95 * S,
    0,
  );
  ctx.fillStyle = 'rgba(179, 71, 20, 0.8)';
  ctx.fill();

  // Body gradient
  const grad = ctx.createLinearGradient(0, -40 * S, 0, 40 * S);
  grad.addColorStop(0, '#4a5d23');
  grad.addColorStop(0.5, '#c2a13e');
  grad.addColorStop(1, '#e8e2c1');

  ctx.beginPath();
  ctx.ellipse(-15 * S, 0, 100 * S, 40 * S, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Scales
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1 * S;
  for (let i = -90; i <= 60; i += 20) {
    for (let j = -40; j <= 40; j += 20) {
      ctx.beginPath();
      ctx.moveTo((i - 15) * S, (j + 10) * S);
      ctx.quadraticCurveTo((i - 10) * S, j * S, (i - 5) * S, (j + 10) * S);
      ctx.stroke();
    }
  }

  // Stripes
  const stripes: [number, number, number, number][] = [
    [-75, -25, -81, 12],
    [-50, -32, -57, 22],
    [-25, -35, -27, 28],
    [0, -35, -3, 25],
    [25, -32, 23, 18],
    [50, -25, 48, 10],
  ];
  ctx.strokeStyle = 'rgba(45, 51, 25, 0.2)';
  ctx.lineWidth = 3 * S;
  ctx.lineCap = 'round';
  for (const [x1, y1, x2, y2] of stripes) {
    ctx.beginPath();
    ctx.moveTo(x1 * S, y1 * S);
    ctx.lineTo(x2 * S, y2 * S);
    ctx.stroke();
  }

  // Top fin
  ctx.beginPath();
  ctx.moveTo(-35 * S, -30 * S);
  ctx.quadraticCurveTo(-15 * S, -70 * S, 5 * S, -30 * S);
  ctx.fillStyle = 'rgba(204, 88, 34, 0.6)';
  ctx.fill();

  // Eye white
  ctx.beginPath();
  ctx.arc(45 * S, -5 * S, 12 * S, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Pupil
  ctx.beginPath();
  ctx.arc(50 * S, -5 * S, 6 * S, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();

  // Eye glint
  ctx.beginPath();
  ctx.arc(47 * S, -8 * S, 2 * S, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  ctx.restore();
};
