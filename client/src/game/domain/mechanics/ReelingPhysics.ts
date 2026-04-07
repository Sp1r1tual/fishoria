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
  deltaTime: number,
  getDepthAt: (nx: number, ny: number) => number,
  horizonY: number,
  canvasWidth: number,
): void {
  const dtSec = deltaTime / 60; // Pixi frame scalar to seconds
  const fishWeight = fish.weight || fish.config.weightRange.max; // fallback for safety

  // Fish resists strongly if it has energy
  const resistance =
    fish.energy > 0
      ? fish.energy *
        fish.config.behavior.stamina *
        fishWeight *
        REELING_PHYSICS.resistanceFactor
      : 0;

  // Effective mechanical pull: gear speed minus the fish's active resistance
  let effectivePull = reelSpeed * REELING_PHYSICS.basePull - resistance;

  // Limit how fast an energetic fish can pull line *out* while reeling
  const maxSlip =
    REELING_PHYSICS.maxSlipBase -
    (1.0 - reelSpeed) * REELING_PHYSICS.maxSlipReelBonus;
  effectivePull = Math.max(maxSlip, effectivePull);

  // Heavier fish are always slower to drag through the water
  const weightPenalty = Math.max(
    1,
    Math.sqrt(fishWeight) * REELING_PHYSICS.weightPenaltyFactor,
  );

  // Scale to actual on-screen pixels-per-second movement
  const scale = targetY / 800;
  const pullSpeed =
    (effectivePull / weightPenalty) *
    REELING_PHYSICS.pullSpeedScale *
    dtSec *
    scale;

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
