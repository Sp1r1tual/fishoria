import type { Fish } from '@/game/domain/fish/Fish';

import { REELING_PHYSICS } from '@/common/configs/game';

export function pullFishToShore(
  fish: Fish,
  targetX: number,
  targetY: number,
  reelSpeed: number,
  gearMaxWeight: number,
  deltaTime: number,
  getDepthAt: (nx: number, ny: number) => number,
  horizonY: number,
  canvasWidth: number,
): void {
  const dtSec = deltaTime / 60;
  const fishWeight =
    fish.weight ||
    (fish.config.weightRange.min + fish.config.weightRange.max) / 2;

  const effectivePull = reelSpeed;

  const weightRatio = Math.max(0.1, fishWeight / Math.max(1, gearMaxWeight));

  const weightPenalty = Math.max(
    1,
    Math.pow(weightRatio, 0.6) * REELING_PHYSICS.weightPenaltyFactor,
  );

  const scale = targetY / 800;
  let pullSpeedRaw =
    (effectivePull / weightPenalty) * REELING_PHYSICS.pullSpeedScale;

  const minSpeed = REELING_PHYSICS.minPullSpeed ?? 15.0;
  pullSpeedRaw = Math.max(minSpeed, pullSpeedRaw);

  const pullSpeed = pullSpeedRaw * dtSec * scale;

  const dx = targetX - fish.position.x;
  const dy = targetY - fish.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 5 * scale) {
    fish.position.x += (dx / dist) * pullSpeed;
    fish.position.y += (dy / dist) * pullSpeed;

    const waterHeight = Math.max(1, targetY - horizonY);
    const nx = Math.max(
      0,
      Math.min(1, fish.position.x / Math.max(1, canvasWidth)),
    );
    const ny = Math.max(
      0,
      Math.min(1, (fish.position.y - horizonY) / waterHeight),
    );

    fish.depth = getDepthAt(nx, ny);
  }
}
