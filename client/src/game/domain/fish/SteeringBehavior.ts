import { createNoise2D } from 'simplex-noise';

import type {
  IUpdateContext,
  IVec2,
  IFishBehavior,
  IActivityByTimeOfDay,
} from '@/common/types';

import type { Fish } from './Fish';

import {
  getDepthBiasForce,
  getAttractionForce,
  getAvoidanceForce,
} from './movement/SteeringForces';

import { MigrationRegistry } from './registers/MigrationRegistry';
import { FISH_STATES } from './constants/FishState';

import {
  vecLen,
  normalize,
  clamp,
  pointInPolygon,
} from '@/game/utils/MathUtils';
import {
  FISH_AI,
  FISH_STATE_SPEEDS,
  CAST_SPLASH,
  GLOBAL_CONSTANTS,
  ATTRACTION,
  STRIKE_CHANCES,
} from '@/common/configs/game';

const _tmpPt: IVec2 = { x: 0, y: 0 };

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

    const floorDepthAtPoint = ctx.getDepthAt(nx, ny);

    const bob =
      (this.noise2D(
        this.noiseTime * 0.2,
        fish.id.charCodeAt(fish.id.length - 1),
      ) +
        1) /
      2;
    let targetD =
      fish.preferredDepthRange.min +
      (fish.preferredDepthRange.max - fish.preferredDepthRange.min) * bob;

    if (
      fish.state === FISH_STATES.Interested &&
      ctx.baitPosition &&
      ctx.baitDepth !== undefined &&
      (ctx.rigType !== 'spinning' || fish.interestLevel >= 0.2)
    ) {
      targetD = ctx.baitDepth;
    }

    targetD = Math.max(0.05, Math.min(targetD, floorDepthAtPoint));

    if (fish.depth === 0) {
      fish.depth = targetD;
    }

    const depthLerpRate = 1.0 - Math.pow(0.95, dt * 60);
    fish.depth += (targetD - fish.depth) * depthLerpRate;

    fish.depth = Math.max(0.05, Math.min(fish.depth, floorDepthAtPoint));

    if (fish.position.y < horizonY) {
      fish.position.y = horizonY;
    }
    if (
      fish.position.y > ctx.canvasHeight - 5 &&
      fish.state !== FISH_STATES.Hooked
    ) {
      fish.position.y = ctx.canvasHeight - 5;
    }

    let forceX = 0;
    let forceY = 0;
    let speed = fish.config.behavior.mobility * FISH_AI.baseSpeedMultiplier;

    const [wx, wy] = this.wander(fish);

    if (fish.state === FISH_STATES.Hooked) {
      const rodX = ctx.canvasWidth / 2;
      const dx = fish.position.x - rodX;
      const [nx] = normalize(dx, 0);

      forceX =
        nx * FISH_STATE_SPEEDS.hooked.fleeForce +
        wx * FISH_STATE_SPEEDS.hooked.wanderForce;
      forceY =
        wy * FISH_STATE_SPEEDS.hooked.verticalWanderForce +
        FISH_STATE_SPEEDS.hooked.verticalBias;

      const sluggishness = Math.max(1, Math.pow(fish.weight || 1, 0.45));

      if (ctx.playerReeling) {
        speed =
          (FISH_STATE_SPEEDS.hooked.reelingSpeedMultiplier *
            fish.config.behavior.mobility) /
          sluggishness;
      } else {
        speed =
          (FISH_STATE_SPEEDS.hooked.freeSpeedMultiplier *
            fish.config.behavior.mobility) /
          sluggishness;
      }
    } else if (fish.state === FISH_STATES.Escaping && ctx.baitPosition) {
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
        fish.setState(FISH_STATES.Idle);
    } else if (fish.state === FISH_STATES.Biting) {
      forceX = wx * FISH_STATE_SPEEDS.biting.wanderForceX;
      forceY = wy * FISH_STATE_SPEEDS.biting.wanderForceY;
      speed =
        FISH_STATE_SPEEDS.biting.multiplier * fish.config.behavior.mobility;
    } else if (
      fish.state === FISH_STATES.Interested &&
      ctx.baitPosition &&
      !ctx.isAnyFishHooked
    ) {
      if (fish.migrationTarget) {
        MigrationRegistry.activeMigrations = Math.max(
          0,
          MigrationRegistry.activeMigrations - 1,
        );
        fish.migrationTarget = null;
      }

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

      if (!fish.isResting) {
        fish.restTimer -= dt;
        if (fish.restTimer <= 0 && fish.state === FISH_STATES.Idle) {
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

      if (!fish.isResting) {
        fish.migrationTimer -= dt;
        if (
          fish.migrationTimer <= 0 &&
          fish.state === FISH_STATES.Idle &&
          MigrationRegistry.activeMigrations < MigrationRegistry.maxMigrations
        ) {
          const normX = Math.random();
          const biasedX =
            normX < 0.5
              ? Math.pow(normX * 2, 2.6) / 2
              : 1 - Math.pow((1 - normX) * 2, 2.6) / 2;

          const normY = Math.random();
          const biasedY =
            normY < 0.5
              ? Math.pow(normY * 2, 2.2) / 2
              : 1 - Math.pow((1 - normY) * 2, 2.2) / 2;

          const tx = 50 + biasedX * (ctx.canvasWidth - 100);
          const ty = horizonY + biasedY * (ctx.canvasHeight - horizonY - 10);
          const nx = tx / ctx.canvasWidth;
          const ny = Math.max(0, Math.min(1, (ty - horizonY) / waterHeight));
          const d = ctx.getDepthAt(nx, ny);

          const nightTolerance =
            ctx.timeOfDay === 'night' ? 0.35 : FISH_AI.migrationDepthTolerance;

          if (
            d >= fish.preferredDepthRange.min - nightTolerance &&
            d <= fish.preferredDepthRange.max + nightTolerance
          ) {
            fish.migrationTarget = { x: tx, y: ty };
            MigrationRegistry.activeMigrations++;
            fish.migrationTimer = 5 + Math.random() * 25;
          } else {
            fish.migrationTimer = FISH_AI.migrationRetryInterval;
          }
        }
      }

      if (fish.migrationTarget) {
        const dx = fish.migrationTarget.x - fish.position.x;
        const dy = fish.migrationTarget.y - fish.position.y;
        const dist = vecLen(dx, dy);
        if (dist < FISH_AI.migrationArrivalDist * avgScale) {
          fish.migrationTarget = null;
          MigrationRegistry.activeMigrations = Math.max(
            0,
            MigrationRegistry.activeMigrations - 1,
          );
        }
      }

      const migrationBiasModifier = fish.migrationTarget ? 0.3 : 1.0;
      forceX += bx * FISH_AI.idleDepthBiasForce * migrationBiasModifier;
      forceY += by * FISH_AI.idleDepthBiasForce * migrationBiasModifier;

      if (ctx.activeGroundbait && ctx.baitPosition) {
        if (fish.migrationTarget) {
          const dx = ctx.baitPosition.x - fish.position.x;
          const dy = ctx.baitPosition.y - fish.position.y;
          const dist = vecLen(dx, dy);

          const speciesMult =
            ctx.activeGroundbait.fishedSpeciesMultiplier?.[fish.config.id] ||
            0.0;
          const gbRadius =
            ATTRACTION.baseAttractionRange *
            (ctx.activeGroundbait.attractionRadiusScale || 1.0);

          if (speciesMult > 0 && dist < gbRadius * 2.2) {
            MigrationRegistry.activeMigrations = Math.max(
              0,
              MigrationRegistry.activeMigrations - 1,
            );
            fish.migrationTarget = null;
          }
        }

        if (!fish.migrationTarget) {
          const [sax, say] = getAttractionForce(fish, ctx);

          forceX += sax * STRIKE_CHANCES.groundbaitDriftStrength;
          forceY += say * STRIKE_CHANCES.groundbaitDriftStrength;
        }
      }

      speed = FISH_STATE_SPEEDS.idle.multiplier * fish.config.behavior.mobility;
      if (fish.migrationTarget) {
        speed *= FISH_AI.migrationSpeedMultiplier;

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

    const checkBoundary =
      (fish.id.charCodeAt(0) + Math.floor(performance.now() / 16)) % 4 === 0;

    if (
      checkBoundary &&
      ctx.allowedCastArea &&
      (ctx.allowedCastArea.type === 'polygon' ||
        ctx.allowedCastArea.type === 'circle')
    ) {
      _tmpPt.x = fish.position.x / ctx.canvasWidth;
      _tmpPt.y = fish.position.y / ctx.canvasHeight;

      let isInside = false;
      if (
        ctx.allowedCastArea.type === 'polygon' &&
        ctx.allowedCastArea.points
      ) {
        isInside = pointInPolygon(_tmpPt, ctx.allowedCastArea.points);
      } else if (
        ctx.allowedCastArea.type === 'circle' &&
        ctx.allowedCastArea.center &&
        ctx.allowedCastArea.radius != null
      ) {
        const dx = _tmpPt.x - ctx.allowedCastArea.center.x;
        const dy = _tmpPt.y - ctx.allowedCastArea.center.y;
        isInside = dx * dx + dy * dy <= ctx.allowedCastArea.radius ** 2;
      } else {
        isInside = true;
      }

      if (!isInside) {
        const hashX =
          ((fish.id.charCodeAt(0) * 13 + fish.id.charCodeAt(5)) % 100) / 100;
        const hashY =
          ((fish.id.charCodeAt(1) * 17 + fish.id.charCodeAt(4)) % 100) / 100;

        const targetX = (0.3 + hashX * 0.4) * ctx.canvasWidth;
        const targetY = (0.65 + hashY * 0.25) * ctx.canvasHeight;

        const [dx, dy] = normalize(
          targetX - fish.position.x,
          targetY - fish.position.y,
        );

        forceX += dx * 2.5;
        forceY += dy * 2.5;
      }
    }

    if (
      fish.state === FISH_STATES.Hooked ||
      fish.state === FISH_STATES.Escaping
    ) {
      if (fish.migrationTarget) {
        MigrationRegistry.activeMigrations = Math.max(
          0,
          MigrationRegistry.activeMigrations - 1,
        );
      }
      fish.migrationTarget = null;
      fish.isResting = false;
    }

    let avx = 0,
      avy = 0;
    const [rvx, rvy] = getAvoidanceForce(fish, ctx);
    avx = rvx;
    avy = rvy;

    if (ctx.timeSinceCast < CAST_SPLASH.duration && ctx.baitPosition) {
      if (
        ctx.timeSinceCast < fish.lastSplashSeenTime ||
        fish.lastSplashSeenTime < 0
      ) {
        const isPredatory =
          fish.config.behavior.fear <= CAST_SPLASH.predatorFearThreshold;
        if (isPredatory) {
          fish.isSplashCurious =
            Math.random() < CAST_SPLASH.predatorInterestChance;
        } else {
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
          avx -= nx * (intensity * CAST_SPLASH.predatorAttractionForce);
          avy -= ny * (intensity * CAST_SPLASH.predatorAttractionForce);
          speed *= CAST_SPLASH.predatorSpeedBoost;
        } else {
          avx += nx * (intensity * CAST_SPLASH.preyRepulsionForce);
          avy += ny * (intensity * CAST_SPLASH.preyRepulsionForce);
          speed *= CAST_SPLASH.preySpeedBoost;
        }
      }
    } else {
      fish.lastSplashSeenTime = -1;
      fish.isSplashCurious = false;
    }

    forceX += avx * CAST_SPLASH.avoidanceWeight;
    forceY += avy * CAST_SPLASH.avoidanceWeight;

    if (
      fish.state !== FISH_STATES.Hooked &&
      fish.state !== FISH_STATES.Biting
    ) {
      forceX += fish.separationForce.x * FISH_AI.separation.forceMultiplier;
      forceY += fish.separationForce.y * FISH_AI.separation.forceMultiplier;
    }

    if (
      fish.state !== FISH_STATES.Hooked &&
      fish.state !== FISH_STATES.Escaping
    ) {
      const currentActivity =
        fish.config.activityByTimeOfDay[
          ctx.timeOfDay as keyof IActivityByTimeOfDay
        ] ?? 1.0;
      const timePenalty = 0.2 + 0.8 * currentActivity;
      speed *= timePenalty;

      if (ctx.weather === 'rain') {
        if (fish.config.isPredator) {
          speed *= 1.3;
        } else {
          speed *= 1.15;
        }
      } else if (ctx.weather === 'cloudy') {
        if (fish.config.isPredator) {
          speed *= 1.1;
        } else {
          speed *= 0.95;
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
      fish.state !== FISH_STATES.Hooked
    ) {
      fish.position.y = ctx.canvasHeight - 5 * scaleY;
      fish.velocity.y *= -0.5;
    }

    if (fish.state === FISH_STATES.Interested && ctx.baitDepth !== undefined) {
      const realNx = Math.max(
        0,
        Math.min(1, fish.position.x / ctx.canvasWidth),
      );
      const realNy = Math.max(
        0,
        Math.min(1, (fish.position.y - horizonY) / waterHeight),
      );
      const realDepthAtPos = ctx.getDepthAt(realNx, realNy);

      const depthLerpRate = 1.0 - Math.pow(0.88, dt * 60);
      fish.depth = Math.min(
        realDepthAtPos,
        fish.depth + (ctx.baitDepth - fish.depth) * depthLerpRate,
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
