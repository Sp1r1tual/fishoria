import type { IUpdateContext } from '@/common/types';

import type { Fish } from '../Fish';
import { FISH_STATES } from '../constants/FishState';

import { vecLen, normalize } from '@/game/utils/MathUtils';
import { FISH_AI, ATTRACTION } from '@/common/configs/game';

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

  if (currentD >= minD - tolerance && currentD <= maxD + tolerance) {
    fish.cachedDepthBias[0] = 0;
    fish.cachedDepthBias[1] = 0;
    return fish.cachedDepthBias;
  }

  const targetDepth = currentD < minD ? minD : maxD;

  const d = FISH_AI.depthProbeStep;
  const probes = [
    { dx: 0, dy: -1, val: ctx.getDepthAt(nx, Math.max(0, ny - d)) },
    { dx: 0, dy: 1, val: ctx.getDepthAt(nx, Math.min(1, ny + d)) },
    { dx: -1, dy: 0, val: ctx.getDepthAt(Math.max(0, nx - d), ny) },
    { dx: 1, dy: 0, val: ctx.getDepthAt(Math.min(1, nx + d), ny) },
  ];

  let bestDir = { dx: 0, dy: 0, diff: Math.abs(currentD - targetDepth) };
  for (const probe of probes) {
    const diff = Math.abs(probe.val - targetDepth);
    if (diff < bestDir.diff) {
      bestDir = { dx: probe.dx, dy: probe.dy, diff };
    }
  }

  const jitterX = (Math.random() - 0.5) * 0.15;
  const jitterY = (Math.random() - 0.5) * 0.15;

  fish.cachedDepthBias[0] =
    (bestDir.dx + jitterX) * FISH_AI.depthBiasForceStrength;
  fish.cachedDepthBias[1] =
    (bestDir.dy + jitterY) * FISH_AI.depthBiasForceStrength;

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
  let isInfluencedByGroundbait = false;

  if (ctx.activeGroundbait) {
    const speciesMult =
      ctx.activeGroundbait.fishedSpeciesMultiplier?.[fish.config.id] || 0.0;

    if (speciesMult > 0) {
      gbRadiusScale = ctx.activeGroundbait.attractionRadiusScale || 1.0;
      gbStrBonus =
        (ctx.activeGroundbait.intensityMultiplier || 1.0) * speciesMult;
      isInfluencedByGroundbait = true;
    }
  }

  let str = 0;
  const baseRange = ATTRACTION.baseAttractionRange * gbRadiusScale;

  if (isInfluencedByGroundbait) {
    let shouldAttract = false;

    if (ctx.baitPosition && ctx.rigType) {
      const minD = fish.originalDepthRange.min;
      const maxD = fish.originalDepthRange.max;
      const isComfortableDepth = ctx.baitDepth >= minD && ctx.baitDepth <= maxD;

      if (ctx.rigType === 'float') {
        shouldAttract = isComfortableDepth;
      } else if (ctx.rigType === 'feeder') {
        shouldAttract = true;
      } else if (ctx.rigType === 'spinning') {
        shouldAttract = true;
      }

      if (shouldAttract && ctx.rigType === 'feeder') {
        fish.preferredDepthRange = {
          min: ctx.lakeMaxDepth * 0.9,
          max: ctx.lakeMaxDepth,
        };
      } else {
        fish.preferredDepthRange = { ...fish.originalDepthRange };
      }
    } else {
      fish.preferredDepthRange = { ...fish.originalDepthRange };
      shouldAttract = false;
    }

    if (!shouldAttract) return [0, 0];

    const maxGbDist = baseRange * 2.2;
    if (dist > maxGbDist) return [0, 0];

    const comfortZone = baseRange * 0.15;

    if (dist > comfortZone) {
      const fadeOut = Math.max(
        0,
        1 - (dist - baseRange) / (maxGbDist - baseRange),
      );
      str =
        Math.min(1.8, (baseRange * 2.0) / dist) *
        fish.config.behavior.curiosity *
        gbStrBonus *
        (dist > baseRange ? fadeOut : 1.0);
    } else {
      str = (0.12 + 0.1 * fish.config.behavior.curiosity) * gbStrBonus;
    }
  } else {
    const maxBaitDist = ATTRACTION.baseAttractionRange * 3.0;
    if (dist > maxBaitDist) return [0, 0];

    str =
      Math.min(1.1, ATTRACTION.baseAttractionRange / dist) *
      fish.config.behavior.curiosity *
      Math.max(0, 1 - dist / maxBaitDist);
  }

  const [nx, ny] = normalize(dx, dy);

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
  if (
    fish.position.y > ctx.canvasHeight - margin &&
    fish.state !== FISH_STATES.Hooked
  ) {
    fy -= ((fish.position.y - (ctx.canvasHeight - margin)) / margin) * 0.5;
  }

  return [fx, fy];
}
