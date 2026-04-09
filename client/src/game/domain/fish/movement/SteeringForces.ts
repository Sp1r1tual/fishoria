import type { IUpdateContext } from '@/common/types';

import type { Fish } from '../Fish';
import { FISH_AI, ATTRACTION } from '@/common/configs/game';
import { vecLen, normalize } from '../../../utils/MathUtils';

export function getDepthBiasForce(
  fish: Fish,
  ctx: IUpdateContext,
): [number, number] {
  fish.depthProbeCounter++;
  if (fish.depthProbeCounter < fish.depthProbeInterval) {
    return fish.cachedDepthBias;
  }
  fish.depthProbeCounter = 0;

  const horizonY = ctx.canvasHeight * ctx.waterBoundaryY;
  const waterHeight = ctx.canvasHeight - horizonY;

  const nx = fish.position.x / ctx.canvasWidth;
  const ny = Math.max(
    0,
    Math.min(1, (fish.position.y - horizonY) / waterHeight),
  );
  const currentD = ctx.getDepthAt(nx, ny);

  const minD = fish.preferredDepthRange.min;
  const maxD = fish.preferredDepthRange.max;
  const tolerance = FISH_AI.depthBiasComfortTolerance;

  // If we are within the preferred range (with tolerance), we feel NO bias force.
  // This allows the fish to wander UNIFORMLY within its preferred depths.
  if (currentD >= minD - tolerance && currentD <= maxD + tolerance) {
    fish.cachedDepthBias[0] = 0;
    fish.cachedDepthBias[1] = 0;
    return fish.cachedDepthBias;
  }

  // Gradient search for the NEAREST boundary (min or max)
  const targetDepth = currentD < minD ? minD : maxD;

  const d = 0.05; // Probe 5% of map width/height
  const probes = [
    { dx: 0, dy: -1, val: ctx.getDepthAt(nx, Math.max(0, ny - d)) }, // Up
    { dx: 0, dy: 1, val: ctx.getDepthAt(nx, Math.min(1, ny + d)) }, // Down
    { dx: -1, dy: 0, val: ctx.getDepthAt(Math.max(0, nx - d), ny) }, // Left
    { dx: 1, dy: 0, val: ctx.getDepthAt(Math.min(1, nx + d), ny) }, // Right
  ];

  let bestDir = { dx: 0, dy: 0, diff: Math.abs(currentD - targetDepth) };
  for (const probe of probes) {
    const diff = Math.abs(probe.val - targetDepth);
    if (diff < bestDir.diff) {
      bestDir = { dx: probe.dx, dy: probe.dy, diff };
    }
  }

  // Apply return force with slight randomized jitter to ensure fish don't all follow exactly same paths
  const jitterX = (Math.random() - 0.5) * 0.15;
  const jitterY = (Math.random() - 0.5) * 0.15;

  fish.cachedDepthBias[0] =
    (bestDir.dx + jitterX) * FISH_AI.depthBiasForceStrength;
  fish.cachedDepthBias[1] =
    (bestDir.dy + jitterY) * FISH_AI.depthBiasForceStrength;

  // HURRY UP if way outside the zone
  const discomfortDist = currentD < minD ? minD - currentD : currentD - maxD;
  if (discomfortDist > FISH_AI.depthDiscomfortThreshold) {
    fish.velocity.x *= FISH_AI.depthDiscomfortSpeedBoost;
    fish.velocity.y *= FISH_AI.depthDiscomfortSpeedBoost;
  }

  return fish.cachedDepthBias;
}

export function getAttractionForce(
  fish: Fish,
  ctx: IUpdateContext,
): [number, number] {
  if (!ctx.baitPosition) return [0, 0];
  const dx = ctx.baitPosition.x - fish.position.x;
  const dy = ctx.baitPosition.y - fish.position.y;
  const dist = vecLen(dx, dy);
  if (dist < 1) return [0, 0];
  let gbRadiusScale = 1.0;
  let gbStrBonus = 1.0;

  if (ctx.activeGroundbait) {
    gbRadiusScale = ctx.activeGroundbait.attractionRadiusScale || 1.0;
    gbStrBonus = ctx.activeGroundbait.intensityMultiplier || 1.0;
    const speciesMult =
      ctx.activeGroundbait.fishedSpeciesMultiplier?.[fish.config.id] || 0.0;
    gbStrBonus *= speciesMult;

    // If species is not interested at all, early exit
    if (speciesMult <= 0) return [0, 0];
  }

  // Base attraction calculation
  let str = 0;
  const baseRange = ATTRACTION.baseAttractionRange * gbRadiusScale;

  if (ctx.activeGroundbait) {
    // Groundbait Logic: Create a "gathering zone" around the bait.
    const comfortZone = baseRange * 0.45;

    if (dist > comfortZone) {
      // Zone 1: Strong outer pull to the area
      str =
        Math.min(1.5, (baseRange * 1.8) / dist) *
        fish.config.behavior.curiosity *
        gbStrBonus;
    } else {
      // Zone 2: Weak inner pull to bring fish directly to the hook
      // Scaling force from 0.05 to 0.15 based on curiosity and groundbait strength
      str = (0.05 + 0.1 * fish.config.behavior.curiosity) * gbStrBonus;
    }
  } else {
    // Standard bait attraction: Pulls the fish directly toward the hook.
    str =
      Math.min(1, ATTRACTION.baseAttractionRange / dist) *
      fish.config.behavior.curiosity;
  }

  const [nx, ny] = normalize(dx, dy);

  // --- ADD JITTER if interested (Strong Tugging effect) ---
  if (
    fish.interestLevel > ATTRACTION.jitterInterestThreshold &&
    dist < ATTRACTION.jitterMaxDist
  ) {
    const jitter =
      Math.sin(performance.now() * 0.03) *
      (fish.interestLevel - ATTRACTION.jitterInterestThreshold) *
      ATTRACTION.jitterAmplitude;
    return [
      nx * str + (Math.random() - 0.5) * jitter,
      ny * str + (Math.random() - 0.5) * jitter,
    ];
  }

  return [nx * str, ny * str];
}

export function getAvoidanceForce(
  fish: Fish,
  ctx: IUpdateContext,
): [number, number] {
  let fx = 0,
    fy = 0;

  for (const obs of ctx.obstacles) {
    const dx = fish.position.x - obs.x;
    const dy = fish.position.y - obs.y;
    const dist = vecLen(dx, dy);
    const avoidR = obs.radius + ATTRACTION.obstacleAvoidanceExtraMargin;
    if (dist < avoidR && dist > 0) {
      const [nx, ny] = normalize(dx, dy);
      fx += nx * ((avoidR - dist) / avoidR);
      fy += ny * ((avoidR - dist) / avoidR);
    }
  }

  // Boundary repulsion to prevent clustering in canvas corners
  const margin = FISH_AI.boundaryRepulsionMargin;
  if (fish.position.x < margin) {
    fx += ((margin - fish.position.x) / margin) * 0.5;
  }
  if (fish.position.x > ctx.canvasWidth - margin) {
    fx -= ((fish.position.x - (ctx.canvasWidth - margin)) / margin) * 0.5;
  }

  const horizonY = ctx.canvasHeight * ctx.waterBoundaryY;
  if (fish.position.y < horizonY + margin) {
    fy += ((horizonY + margin - fish.position.y) / margin) * 0.5;
  }
  if (fish.position.y > ctx.canvasHeight - margin && fish.state !== 'Hooked') {
    fy -= ((fish.position.y - (ctx.canvasHeight - margin)) / margin) * 0.5;
  }

  return [fx, fy];
}
