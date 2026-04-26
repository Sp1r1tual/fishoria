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
  const dtSec = deltaTime;
  const fishWeight =
    fish.weight ||
    (fish.config.weightRange.min + fish.config.weightRange.max) / 2;

  const effectivePull = reelSpeed;

  const weightRatio = Math.max(0.1, fishWeight / Math.max(1, gearMaxWeight));

  const weightPenalty = Math.max(
    1,
    Math.pow(weightRatio, REELING_PHYSICS.weightPenaltyExponent) *
      REELING_PHYSICS.weightPenaltyFactor,
  );

  const scale = targetY / REELING_PHYSICS.referenceHeight;
  let pullSpeedRaw =
    (effectivePull / weightPenalty) * REELING_PHYSICS.pullSpeedScale;

  const minSpeed = REELING_PHYSICS.minPullSpeed ?? 15.0;
  pullSpeedRaw = Math.max(minSpeed, pullSpeedRaw);

  const pullSpeed = pullSpeedRaw * dtSec * scale;

  const dx = targetX - fish.position.x;
  const dy = targetY - fish.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 1 * scale) {
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

export function applyFishAutonomousMovement(
  fish: Fish,
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number,
  waterBoundaryY: number,
  isPositionAllowed?: (x: number, y: number) => boolean,
): void {
  const dtSec = deltaTime;

  fish.combatTimer -= dtSec;
  if (fish.combatTimer <= 0) {
    if (fish.isTrash) {
      fish.combatTimer = 999.0;
      fish.combatAngle = 0;
      fish.combatSpeed = 0;
    } else {
      const traits = fish.config.behavior;
      const aggression = traits.aggression ?? 0.5;
      const mobility = traits.mobility ?? 0.5;
      const fear = traits.fear ?? 0.5;
      const curiosity = traits.curiosity ?? 0.5;

      fish.combatTimer = (2.0 - mobility * 1.5 + Math.random() * 0.5) * 2.0;

      const normalizedY =
        (fish.position.y - canvasHeight * waterBoundaryY) /
        (canvasHeight * (1 - waterBoundaryY));
      const randomVal = Math.random();

      if (normalizedY < 0.15) {
        if (randomVal < 0.7) {
          fish.combatAngle =
            Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.4;
        } else {
          fish.combatAngle =
            (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.2;
        }
      } else {
        const upWeight = 0.4 + aggression * 0.5;
        const sideWeight = 0.2 + fear * 0.4;
        const downWeight = 0.05 + curiosity * 0.2;

        const totalWeight = upWeight + sideWeight + downWeight;
        const r = Math.random() * totalWeight;

        if (r < upWeight) {
          fish.combatAngle =
            -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
        } else if (r < upWeight + sideWeight) {
          const baseAngle = Math.random() < 0.5 ? 0 : Math.PI;

          fish.combatAngle =
            baseAngle + (Math.random() - 0.5) * Math.PI * (0.2 + fear * 0.3);
        } else {
          fish.combatAngle =
            Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5;
        }
      }
      const baseSpeed = (20 + mobility * 45 + aggression * 25) * 0.5;
      fish.combatSpeed = baseSpeed * (0.8 + Math.random() * 0.4);
    }
  }

  const perspectiveScale = fish.position.y / canvasHeight;
  const baseSpeed =
    fish.combatSpeed *
    dtSec *
    perspectiveScale *
    REELING_PHYSICS.autonomousSpeedScale;

  const vx =
    Math.cos(fish.combatAngle) *
    baseSpeed *
    REELING_PHYSICS.sideMovementSpeedMult;
  const vy = Math.sin(fish.combatAngle) * baseSpeed;

  const nextX = fish.position.x + vx;
  const nextY = fish.position.y + vy;

  if (isPositionAllowed && !isPositionAllowed(nextX, nextY)) {
    fish.combatTimer = 0;
  } else {
    fish.position.x = Math.max(0, Math.min(canvasWidth, nextX));
    fish.position.y = Math.max(0, Math.min(canvasHeight, nextY));
  }
}
