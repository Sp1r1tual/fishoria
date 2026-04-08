import { createNoise2D } from 'simplex-noise';

import type { IVec2, IUpdateContext, IFishBehavior } from '@/common/types';

import { FishState } from './FishState';
import type { Fish } from './Fish';

import {
  getDepthBiasForce,
  getAttractionForce,
  getAvoidanceForce,
} from './movement/SteeringForces';

import {
  vecLen,
  normalize,
  clamp,
  pointInPolygon,
} from '../../utils/MathUtils';
import {
  FISH_AI,
  FISH_STATE_SPEEDS,
  CAST_SPLASH,
  GLOBAL_CONSTANTS,
} from '@/common/configs/game';

export class SteeringBehavior implements IFishBehavior {
  private noise2D = createNoise2D();
  private wanderAngle = Math.random() * Math.PI * 2;
  private noiseTime = Math.random() * 100;

  update(fish: Fish, ctx: IUpdateContext): void {
    const dt = ctx.deltaTime * 0.016;
    this.noiseTime += dt * FISH_AI.noiseSpeed;

    const scaleX = ctx.canvasWidth / GLOBAL_CONSTANTS.baseWidth;
    const scaleY = ctx.canvasHeight / GLOBAL_CONSTANTS.baseHeight;
    const avgScale = (scaleX + scaleY) / 2;

    const horizonY = ctx.canvasHeight * ctx.waterBoundaryY;
    const waterHeight = ctx.canvasHeight - horizonY;
    const nx = Math.max(0, Math.min(1, fish.position.x / ctx.canvasWidth));
    const ny = Math.max(
      0,
      Math.min(1, (fish.position.y - horizonY) / waterHeight),
    );

    // The total floor depth at this (x, y) point on the screen
    const floorDepthAtPoint = ctx.getDepthAt(nx, ny);

    // --- VERTICAL DEPTH LOGIC ---
    // The fish's ideal depth oscillates slowly within its preferred depth range
    const bob =
      (this.noise2D(
        this.noiseTime * 0.2,
        fish.id.charCodeAt(fish.id.length - 1),
      ) +
        1) /
      2; // 0.0 to 1.0
    let targetD =
      fish.preferredDepthRange.min +
      (fish.preferredDepthRange.max - fish.preferredDepthRange.min) * bob;

    // If interested, try to match bait depth
    if (
      fish.state === FishState.Interested &&
      ctx.baitPosition &&
      ctx.baitDepth !== undefined &&
      ctx.rigType !== 'spinning'
    ) {
      targetD = ctx.baitDepth;
    }

    // Clamp target depth so fish doesn't dig into the floor or breach the surface
    targetD = Math.max(0.05, Math.min(targetD, floorDepthAtPoint));

    // Initialize depth if it's 0 (freshly spawned)
    if (fish.depth === 0) {
      fish.depth = targetD;
    }

    // Smoothly adjust current depth towards target
    fish.depth += (targetD - fish.depth) * 0.05;

    // Hard clamp to actual floor depth in case the floor rises abruptly
    fish.depth = Math.max(0.05, Math.min(fish.depth, floorDepthAtPoint));

    // Safety clamp (not used since we moved towards map-based depth, but keeps the fish within world bounds)
    if (fish.position.y < horizonY) {
      fish.position.y = horizonY;
    }
    if (
      fish.position.y > ctx.canvasHeight - 5 &&
      fish.state !== FishState.Hooked
    ) {
      fish.position.y = ctx.canvasHeight - 5;
    }

    let forceX = 0;
    let forceY = 0;
    let speed = fish.config.behavior.mobility * FISH_AI.baseSpeedMultiplier;

    const [wx, wy] = this.wander(fish);

    if (fish.state === FishState.Hooked) {
      // Struggling
      const rodX = ctx.canvasWidth / 2;
      const dx = fish.position.x - rodX;
      const [nx] = normalize(dx, 0);

      forceX =
        nx * FISH_STATE_SPEEDS.hooked.fleeForce +
        wx * FISH_STATE_SPEEDS.hooked.wanderForce;
      forceY =
        wy * FISH_STATE_SPEEDS.hooked.verticalWanderForce +
        FISH_STATE_SPEEDS.hooked.verticalBias;

      if (ctx.playerReeling) {
        speed =
          FISH_STATE_SPEEDS.hooked.reelingSpeedMultiplier *
          fish.config.behavior.stamina;
      } else {
        speed =
          FISH_STATE_SPEEDS.hooked.freeSpeedMultiplier *
          fish.config.behavior.stamina;
      }
    } else if (fish.state === FishState.Escaping && ctx.baitPosition) {
      // Flee
      const dx = fish.position.x - ctx.baitPosition.x;
      const dy = fish.position.y - ctx.baitPosition.y;
      const [nx, ny] = normalize(dx, dy);

      forceX =
        nx * FISH_STATE_SPEEDS.escaping.fleeForce +
        wx * FISH_STATE_SPEEDS.escaping.wanderForce;
      forceY =
        ny * FISH_STATE_SPEEDS.escaping.verticalFleeForce +
        wy * FISH_STATE_SPEEDS.escaping.wanderForce;
      speed =
        FISH_STATE_SPEEDS.escaping.speedMultiplier *
        fish.config.behavior.mobility;
      if (fish.stateTimer > FISH_STATE_SPEEDS.escaping.returnToIdleAfter)
        fish.setState(FishState.Idle);
    } else if (fish.state === FishState.Biting) {
      forceX = wx * FISH_STATE_SPEEDS.biting.wanderForceX;
      forceY = wy * FISH_STATE_SPEEDS.biting.wanderForceY;
      speed =
        FISH_STATE_SPEEDS.biting.multiplier * fish.config.behavior.mobility;
    } else if (
      fish.state === FishState.Interested &&
      ctx.baitPosition &&
      !ctx.isAnyFishHooked
    ) {
      const [ax, ay] = getAttractionForce(fish, ctx);
      const [bx, by] = getDepthBiasForce(fish, ctx);
      const dx = ctx.baitPosition.x - fish.position.x;
      const dy = ctx.baitPosition.y - fish.position.y;
      const closeDist = vecLen(dx, dy);

      const interestBonus =
        1.0 + fish.interestLevel * FISH_STATE_SPEEDS.interested.interestBonus;
      const wanderMod =
        closeDist < FISH_STATE_SPEEDS.interested.closeDist * avgScale
          ? FISH_STATE_SPEEDS.interested.wanderCloseMultiplier
          : FISH_STATE_SPEEDS.interested.wanderFarMultiplier;

      forceX =
        wx * wanderMod +
        ax * FISH_STATE_SPEEDS.interested.attractionForce * interestBonus +
        bx * FISH_STATE_SPEEDS.interested.depthBiasWeight;
      forceY =
        wy * wanderMod +
        ay * FISH_STATE_SPEEDS.interested.attractionForce * interestBonus +
        by * FISH_STATE_SPEEDS.interested.depthBiasWeight;
      speed =
        (FISH_STATE_SPEEDS.interested.baseSpeed +
          fish.interestLevel *
            FISH_STATE_SPEEDS.interested.interestSpeedBonus) *
        fish.config.behavior.mobility;
      speed *= FISH_STATE_SPEEDS.interested.scale;
    } else {
      forceX = wx;
      forceY = wy;
      const [bx, by] = getDepthBiasForce(fish, ctx);

      // --- RESTING LOGIC ---
      if (!fish.isResting) {
        fish.restTimer -= dt;
        if (fish.restTimer <= 0 && fish.state === FishState.Idle) {
          fish.isResting = true;
          fish.restDuration =
            FISH_AI.restDurationBase +
            Math.random() * FISH_AI.restDurationRange;
          fish.restTimer =
            FISH_AI.restTimerBase + Math.random() * FISH_AI.restTimerRange;
          fish.velocity.x *= FISH_AI.restDamping;
          fish.velocity.y *= FISH_AI.restDamping;
        }
      } else {
        fish.restDuration -= dt;
        if (
          fish.restDuration <= 0 ||
          fish.interestLevel > FISH_AI.restInterruptInterest
        ) {
          fish.isResting = false;
        }
      }

      // --- MIGRATION LOGIC ---
      // Distant explorer logic
      if (!fish.isResting) {
        fish.migrationTimer -= dt;
        if (fish.migrationTimer <= 0 && fish.state === FishState.Idle) {
          const tx = 50 + Math.random() * (ctx.canvasWidth - 100);
          const ty =
            horizonY + Math.random() * (ctx.canvasHeight - horizonY - 10);
          const nx = tx / ctx.canvasWidth;
          const ny = Math.max(0, Math.min(1, (ty - horizonY) / waterHeight));
          const d = ctx.getDepthAt(nx, ny);

          // Only migrate if destination has suitable depth (with tolerance)
          if (
            d >=
              fish.preferredDepthRange.min - FISH_AI.migrationDepthTolerance &&
            d <= fish.preferredDepthRange.max + FISH_AI.migrationDepthTolerance
          ) {
            fish.migrationTarget = { x: tx, y: ty };
            fish.migrationTimer =
              FISH_AI.migrationTimerBase +
              Math.random() * FISH_AI.migrationTimerRange;
          } else {
            fish.migrationTimer = FISH_AI.migrationRetryInterval; // Try again soon
          }
        }
      }

      if (fish.migrationTarget) {
        const dx = fish.migrationTarget.x - fish.position.x;
        const dy = fish.migrationTarget.y - fish.position.y;
        const dist = vecLen(dx, dy);
        if (dist < FISH_AI.migrationArrivalDist * avgScale) {
          fish.migrationTarget = null;
        } else {
          const [nx, ny] = normalize(dx, dy);
          forceX += nx * FISH_AI.migrationForce;
          forceY += ny * FISH_AI.migrationForce;
        }
      }

      // Extra strong depth bias for idle state (but reduce it by 70% during migration to allow travel)
      const migrationBiasModifier = fish.migrationTarget ? 0.3 : 1.0;
      forceX += bx * FISH_AI.idleDepthBiasForce * migrationBiasModifier;
      forceY += by * FISH_AI.idleDepthBiasForce * migrationBiasModifier;

      speed = FISH_STATE_SPEEDS.idle.multiplier * fish.config.behavior.mobility;
      if (fish.migrationTarget) {
        speed *= FISH_AI.migrationSpeedMultiplier; // Swim faster during migration
        // Reduce random wandering during focused travel
        forceX *= 0.5;
        forceY *= 0.5;
        const [dx, dy] = normalize(
          fish.migrationTarget.x - fish.position.x,
          fish.migrationTarget.y - fish.position.y,
        );
        forceX += dx * FISH_AI.migrationForce * 1.5;
        forceY += dy * FISH_AI.migrationForce * 1.5;
      }
      speed *= FISH_STATE_SPEEDS.idle.scale;

      if (fish.isResting) {
        speed = 0;
        forceX = 0;
        forceY = 0;
      }
    }

    // --- BOUNDARY STEERING (stay within allowedCastArea) ---
    if (
      ctx.allowedCastArea &&
      (ctx.allowedCastArea.type === 'polygon' ||
        ctx.allowedCastArea.type === 'circle')
    ) {
      const pt: IVec2 = {
        x: fish.position.x / ctx.canvasWidth,
        y: fish.position.y / ctx.canvasHeight,
      };

      let isInside = false;
      if (
        ctx.allowedCastArea.type === 'polygon' &&
        ctx.allowedCastArea.points
      ) {
        isInside = pointInPolygon(pt, ctx.allowedCastArea.points);
      } else if (
        ctx.allowedCastArea.type === 'circle' &&
        ctx.allowedCastArea.center &&
        ctx.allowedCastArea.radius != null
      ) {
        const dx = pt.x - ctx.allowedCastArea.center.x;
        const dy = pt.y - ctx.allowedCastArea.center.y;
        isInside = dx * dx + dy * dy <= ctx.allowedCastArea.radius ** 2;
      } else {
        isInside = true;
      }

      if (!isInside) {
        // If outside, steer towards the middle of the lake area (roughly 0.5, 0.75)
        const targetX = 0.5 * ctx.canvasWidth;
        const targetY = 0.75 * ctx.canvasHeight;
        const [dx, dy] = normalize(
          targetX - fish.position.x,
          targetY - fish.position.y,
        );

        // Strong steering back to keep fish within allowed boundaries
        forceX += dx * 2.5;
        forceY += dy * 2.5;
        // Don't modify speed so aggressively
      }
    }

    if (fish.state === FishState.Hooked || fish.state === FishState.Escaping) {
      fish.migrationTarget = null;
      fish.isResting = false;
    }

    let avx = 0,
      avy = 0;
    const [rvx, rvy] = getAvoidanceForce(fish, ctx);
    avx = rvx;
    avy = rvy;

    // --- Cast Splash Response ---
    if (ctx.timeSinceCast < CAST_SPLASH.duration && ctx.baitPosition) {
      // If this is a new splash (timeSinceCast reset), make a persistent decision for this fish
      if (
        ctx.timeSinceCast < fish.lastSplashSeenTime ||
        fish.lastSplashSeenTime < 0
      ) {
        const isPredatory =
          fish.config.behavior.fear <= CAST_SPLASH.predatorFearThreshold;
        if (isPredatory) {
          // Predatory species have a fixed chance to be curious about the splash
          fish.isSplashCurious =
            Math.random() < CAST_SPLASH.predatorInterestChance;
        } else {
          // Prey species are never curious about splashes; they always flee
          fish.isSplashCurious = false;
        }
      }
      fish.lastSplashSeenTime = ctx.timeSinceCast;

      const dx = fish.position.x - ctx.baitPosition.x;
      const dy = fish.position.y - ctx.baitPosition.y;
      const d = vecLen(dx, dy);

      if (d < CAST_SPLASH.radius * avgScale) {
        const [nx, ny] = normalize(dx, dy);
        const intensity = CAST_SPLASH.duration - ctx.timeSinceCast;

        if (fish.isSplashCurious) {
          // Predatory curiosity: Slight attraction to the splash
          avx -= nx * (intensity * CAST_SPLASH.predatorAttractionForce);
          avy -= ny * (intensity * CAST_SPLASH.predatorAttractionForce);
          speed *= CAST_SPLASH.predatorSpeedBoost;
        } else {
          // Others (prey or uninterested predators): Fear/Repulsion
          avx += nx * (intensity * CAST_SPLASH.preyRepulsionForce);
          avy += ny * (intensity * CAST_SPLASH.preyRepulsionForce);
          speed *= CAST_SPLASH.preySpeedBoost;
        }
      }
    } else {
      // Reset tracker when no active splash is present
      fish.lastSplashSeenTime = -1;
      fish.isSplashCurious = false;
    }

    forceX += avx * CAST_SPLASH.avoidanceWeight;
    forceY += avy * CAST_SPLASH.avoidanceWeight;

    // Apply school separation force (calculated in LakeScene updateSchoolDensity)
    // Only for non-engaged fish to avoid interfering with hook/bite physics
    if (fish.state !== FishState.Hooked && fish.state !== FishState.Biting) {
      forceX += fish.separationForce.x * FISH_AI.separation.forceMultiplier;
      forceY += fish.separationForce.y * FISH_AI.separation.forceMultiplier;
    }

    // --- Day/Night and Weather Activity Penalty/Bonus ---
    if (fish.state !== FishState.Hooked && fish.state !== FishState.Escaping) {
      if (ctx.timeOfDay === 'night') {
        // Decrease mobility heavily for diurnal fish, but keep nocturnal predators fast.
        const nightActivity = fish.config.activityByTimeOfDay['night'] ?? 1.0;
        const penalty = Math.pow(nightActivity, 1.5);
        speed *= Math.max(0.1, penalty);
      }

      if (ctx.weather === 'rain') {
        if (fish.config.isPredator) {
          speed *= 1.3; // Predators are highly active hunting in the rain
        } else {
          speed *= 0.6; // Prey fish hide and become less active
        }
      } else if (ctx.weather === 'cloudy') {
        if (fish.config.isPredator) {
          speed *= 1.1; // Slightly more active due to lower light
        } else {
          speed *= 0.85; // Slightly less active
        }
      }
    }

    fish.velocity.x +=
      clamp(forceX, -FISH_AI.maxSteeringForce, FISH_AI.maxSteeringForce) *
      speed;
    fish.velocity.y +=
      clamp(forceY, -FISH_AI.maxSteeringForce, FISH_AI.maxSteeringForce) *
      speed;
    fish.velocity.x *= FISH_AI.velocityDamping;
    fish.velocity.y *= FISH_AI.velocityDamping;

    const maxV = speed * FISH_AI.maxVelocityMultiplier;
    const vlen = vecLen(fish.velocity.x, fish.velocity.y);
    if (vlen > maxV) {
      fish.velocity.x = (fish.velocity.x / vlen) * maxV;
      fish.velocity.y = (fish.velocity.y / vlen) * maxV;
    }

    fish.position.x += fish.velocity.x * dt * 60 * scaleX;
    fish.position.y += fish.velocity.y * dt * 60 * scaleY;

    const m = 24 * scaleX;
    if (fish.position.x < m) {
      fish.position.x = m;
      fish.velocity.x *= -0.5;
    }
    if (fish.position.x > ctx.canvasWidth - m) {
      fish.position.x = ctx.canvasWidth - m;
      fish.velocity.x *= -0.5;
    }

    if (fish.position.y < horizonY) {
      fish.position.y = horizonY;
      fish.velocity.y *= -0.5;
    }
    if (
      fish.position.y > ctx.canvasHeight - 5 * scaleY &&
      fish.state !== FishState.Hooked
    ) {
      fish.position.y = ctx.canvasHeight - 5 * scaleY;
      fish.velocity.y *= -0.5;
    }

    if (fish.state === FishState.Interested && ctx.baitDepth !== undefined) {
      const realNx = Math.max(
        0,
        Math.min(1, fish.position.x / ctx.canvasWidth),
      );
      const realNy = Math.max(
        0,
        Math.min(1, (fish.position.y - horizonY) / waterHeight),
      );
      const realDepthAtPos = ctx.getDepthAt(realNx, realNy);

      fish.depth = Math.min(
        realDepthAtPos,
        fish.depth + (ctx.baitDepth - fish.depth) * 0.12,
      );
      fish.depth = Math.max(0.05, fish.depth);
    }
  }

  private wander(fish: Fish): [number, number] {
    const n = this.noise2D(this.noiseTime, fish.id.charCodeAt(5) * 0.13);
    this.wanderAngle += n * FISH_AI.wanderAngleNoise;
    return [Math.cos(this.wanderAngle), Math.sin(this.wanderAngle)];
  }
}
