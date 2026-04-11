import type { Fish } from '@/game/domain/fish/Fish';

import { REELING_PHYSICS } from '@/common/configs/game';

/**
 * Pulls a hooked fish toward the shore (target position).
 * Pure function — no side effects beyond mutating the fish position.
 */
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
  const dtSec = deltaTime / 60; // Pixi frame scalar to seconds
  const fishWeight =
    fish.weight ||
    (fish.config.weightRange.min + fish.config.weightRange.max) / 2; // fallback to midpoint for safety

  // Base mechanical pull is directly equal to gear speed.
  const effectivePull = reelSpeed;

  // The penalty is based on how heavy the fish is relative to the gear's max weight.
  const weightRatio = Math.max(0.1, fishWeight / Math.max(1, gearMaxWeight));

  // We gently soften the weight penalty for very heavy fish so it doesn't become impossible.
  // A 5kg fish shouldn't be 10x harder than a 0.5kg fish, just considerably slower.
  const weightPenalty = Math.max(
    1,
    Math.pow(weightRatio, 0.6) * REELING_PHYSICS.weightPenaltyFactor,
  );

  // Scale to actual on-screen pixels-per-second movement
  const scale = targetY / 800;
  let pullSpeedRaw =
    (effectivePull / weightPenalty) * REELING_PHYSICS.pullSpeedScale;

  // Guarantee a minimum pull speed so the fish doesn't out-swim the reel with bad gear
  const minSpeed = REELING_PHYSICS.minPullSpeed ?? 15.0;
  pullSpeedRaw = Math.max(minSpeed, pullSpeedRaw);

  const pullSpeed = pullSpeedRaw * dtSec * scale;

  const dx = targetX - fish.position.x;
  const dy = targetY - fish.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 5 * scale) {
    fish.position.x += (dx / dist) * pullSpeed;
    fish.position.y += (dy / dist) * pullSpeed;

    // Update fish's numerical depth based on its new position in the water
    const waterHeight = Math.max(1, targetY - horizonY);
    const nx = Math.max(
      0,
      Math.min(1, fish.position.x / Math.max(1, canvasWidth)),
    );
    const ny = Math.max(
      0,
      Math.min(1, (fish.position.y - horizonY) / waterHeight),
    );

    // Smooth the depth transition as the fish moves
    fish.depth = getDepthAt(nx, ny);
  }
}
