import type {
  IBiteDetectionParams,
  IBiteResult,
  LureTypeType,
} from '@/common/types';

import { FishState } from '../fish/FishState';
import type { Fish } from '../fish/Fish';

import {
  BITE_DETECTION,
  INTEREST_RATES,
  STRIKE_CHANCES,
  GLOBAL_CONSTANTS,
} from '@/common/configs/game';

export function detectBite(params: IBiteDetectionParams): IBiteResult {
  if (params.isAnyFishHooked) return { biter: null, progress: 1 };
  let maxInterest = 0;

  const scale = params.canvasHeight / GLOBAL_CONSTANTS.baseHeight;

  const interestedFish = (params.fish as Fish[]).find(
    (f) => f.state === FishState.Interested || f.state === FishState.Biting,
  );

  for (const fish of params.fish as Fish[]) {
    if (
      fish.state === FishState.Hooked ||
      (interestedFish && interestedFish !== fish)
    )
      continue;

    if (fish.state === FishState.Biting) continue;

    const dx = fish.position.x - params.hookPixelX;
    const dy = fish.position.y - params.hookPixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const isSpinning = params.rigType === 'spinning';
    let baitScore = isSpinning
      ? fish.config.isPredator
        ? BITE_DETECTION.baitScoreDefault
        : BITE_DETECTION.noBaitScore
      : fish.config.preferredBaits.includes(params.baitType)
        ? BITE_DETECTION.baitScoreDefault
        : BITE_DETECTION.noBaitScore;

    if (isSpinning && fish.config.isPredator && fish.config.lureMultipliers) {
      const lureType = params.baitType.replace('lure_', '') as LureTypeType;
      const lureMultiplier = fish.config.lureMultipliers[lureType] ?? 1.0;
      baitScore *= lureMultiplier;
    }

    let timeScore =
      fish.config.activityByTimeOfDay[params.timeOfDay] ??
      BITE_DETECTION.activityScoreDefault;

    // Predators become more active in rain or cloudy weather, effectively waking up even at "dead" hours.
    if (fish.config.isPredator && params.weather !== 'clear') {
      const weatherBoost = params.weather === 'rain' ? 0.35 : 0.15;
      timeScore = Math.min(1.0, timeScore + weatherBoost);
    }

    if (timeScore < BITE_DETECTION.minTimeScoreForInterest) {
      if (Math.random() < BITE_DETECTION.chanceOfBiteAtDeadHour) {
        fish.setState(FishState.Idle);
        fish.hasLostInterest = true;
        continue;
      }
    }

    const minD = fish.preferredDepthRange.min;
    const maxD = fish.preferredDepthRange.max;
    const depthScore =
      params.hookDepthM >= minD && params.hookDepthM <= maxD
        ? 1.0
        : Math.max(
            0,
            1 -
              Math.min(
                Math.abs(params.hookDepthM - minD),
                Math.abs(params.hookDepthM - maxD),
              ) *
                BITE_DETECTION.depthPenaltyFactor,
          );

    const verticalGap = Math.abs(fish.depth - params.hookDepthM);
    const verticalGapScore = Math.max(
      0,
      1 - verticalGap * BITE_DETECTION.verticalGapPenaltyFactor,
    );
    const movementScore =
      isSpinning && !params.isMoving
        ? BITE_DETECTION.stationarySpinningLurePenalty
        : 1.0;
    const visionRadius =
      (isSpinning && fish.config.isPredator
        ? BITE_DETECTION.spinningPredatorVisionPx
        : BITE_DETECTION.attractRadiusPx) * scale;

    if (
      dist < visionRadius &&
      fish.state === FishState.Idle &&
      baitScore > 0 &&
      timeScore > BITE_DETECTION.minTimeScoreForInterest &&
      depthScore > BITE_DETECTION.minDepthScoreForInterest &&
      verticalGapScore > BITE_DETECTION.minVerticalGapScore &&
      (movementScore > 0.5 ||
        (isSpinning &&
          fish.config.isPredator &&
          Math.random() <
            BITE_DETECTION.predatorCuriosityChance * params.deltaTime)) &&
      !fish.hasLostInterest &&
      !interestedFish // Triple check
    ) {
      // Predators are curious, but more within their visual range
      let attractChance = isSpinning
        ? fish.config.isPredator
          ? BITE_DETECTION.attractChanceSpinningPredator
          : BITE_DETECTION.attractChanceSpinningNonPredator
        : BITE_DETECTION.attractChanceFloat;

      if (isSpinning && fish.config.isPredator && fish.config.lureMultipliers) {
        const lureType = params.baitType.replace('lure_', '') as LureTypeType;
        const lureMultiplier = fish.config.lureMultipliers[lureType] ?? 1.0;
        attractChance *= lureMultiplier;
      }
      // 1. Spook Zone: if the bait lands directly on a fish's head, it always gets spooked
      const isSpookZone =
        params.timeSinceCast < BITE_DETECTION.splashZoneTime * 0.4 &&
        dist < BITE_DETECTION.splashZoneRadius * 0.7 * scale;

      // 2. Near splash attraction: instantly interested if it's a predator and it lands close enough
      const isAttractSplashZone =
        !isSpookZone &&
        params.timeSinceCast < BITE_DETECTION.splashZoneTime &&
        dist < BITE_DETECTION.splashZoneRadius * scale &&
        fish.config.isPredator;

      if (isSpookZone) {
        // Direct hit - spook the fish and it won't bite for 30-40s (state return handled by hasLostInterest)
        fish.setState(FishState.Idle);
        fish.interestLevel = 0;
        fish.hasLostInterest = true;
        return { biter: null, progress: 1 };
      }

      if (
        params.timeSinceCast >
          (isSpinning
            ? BITE_DETECTION.spinningGracePeriod
            : BITE_DETECTION.floatGracePeriod) ||
        isAttractSplashZone
      ) {
        // Predators are curious, but float/feeder splashes are often suspicious
        let attractSplashChance = 0;
        const isNewSplash =
          fish.lastSplashSeenTime === -1 ||
          params.timeSinceCast < fish.lastSplashSeenTime;

        if (isAttractSplashZone) {
          fish.lastSplashSeenTime = params.timeSinceCast;
          if (isNewSplash && !isSpinning) {
            // If it's a static bait splash, 60% chance it spooks the predator instead
            if (Math.random() < 0.6) {
              fish.hasLostInterest = true;
              return { biter: null, progress: 1 };
            }
            attractSplashChance = 0.4; // Only 40% chance of immediate interest even if not spooked
          } else if (isNewSplash && isSpinning) {
            attractSplashChance = 1.0;
          }
        }

        if (
          params.deltaTime > 0 &&
          (Math.random() < attractChance * params.deltaTime ||
            Math.random() < attractSplashChance)
        ) {
          // Chance for an instant strike without the interest-filling "games"
          // ONLY after required pulls for spinning lures, and NEVER for static baits in a splash zone
          const canInstantStrike =
            !isAttractSplashZone || (isSpinning && !params.isOnBottom);

          if (
            canInstantStrike &&
            (!isSpinning || params.isMoving) &&
            Math.random() <
              BITE_DETECTION.instantStrikeChance * params.deltaTime &&
            (!isSpinning ||
              (params.pullCount ?? 0) >=
                BITE_DETECTION.spinningMinPullsForInstantStrike)
          ) {
            fish.setState(FishState.Biting);
            return { biter: fish, progress: 0 };
          }

          fish.setState(FishState.Interested);
          fish.interestLevel = isSpinning
            ? BITE_DETECTION.initialInterestSpinning
            : BITE_DETECTION.initialInterestFloat;

          if (isAttractSplashZone) {
            fish.interestLevel += BITE_DETECTION.splashInterestBoost; // Extra boost from splash
          }
        }
      }
    }

    if (fish.state === FishState.Interested && !fish.hasLostInterest) {
      if (!fish.hasAttemptedAttack) {
        fish.hasAttemptedAttack = true;

        let attackChance =
          0.4 * baitScore * timeScore * fish.config.baseCatchChance;

        if (params.rigType === 'float' && params.isOnBottom) {
          attackChance *= STRIKE_CHANCES.floatOnBottomStrikePenalty;
        }

        const finalChance = Math.min(attackChance, 0.3);

        if (Math.random() < finalChance && (!isSpinning || params.isMoving)) {
          fish.setState(FishState.Biting);
          return { biter: fish, progress: 0 };
        }
      }

      const weatherScore =
        params.weather === 'rain'
          ? INTEREST_RATES.weather.rain
          : params.weather === 'cloudy'
            ? INTEREST_RATES.weather.cloudy
            : INTEREST_RATES.weather.clear;

      // Base fill rate (environmental and bait factors)
      let rate =
        baitScore *
        timeScore *
        params.visibility *
        weatherScore *
        fish.config.baseCatchChance *
        INTEREST_RATES.baseFillRate *
        params.deltaTime;

      if (params.rigType === 'float' || params.rigType === 'feeder') {
        // Float/Feeder rigs strongly depend on being at the right depth to grow interest
        rate *= depthScore * verticalGapScore;
        if (fish.config.isPredator) {
          rate *= 1.35;
        }
      }

      if (isSpinning) {
        // High distance falloff for interest
        // High distance falloff for interest: very slow growth at edge of vision
        const distRatio = dist / visionRadius;
        // Proximity penalty: slower growth/decay when far away, but NEVER flips the sign
        const proximityMultiplier = Math.max(
          0.05,
          1.1 - Math.pow(distRatio, 1.3),
        );

        // Passive focus
        const passiveFocus = params.isOnBottom
          ? INTEREST_RATES.spinning.passiveFocusOnBottom
          : INTEREST_RATES.spinning.passiveFocusInWater;

        // Active attraction
        const activeAttract = params.isMoving
          ? INTEREST_RATES.spinning.activeAttractMoving
          : INTEREST_RATES.spinning.activeAttractIdle;

        // Retrieval technique bonus (spinning only)
        let techniqueBonus = 1.0;
        if (
          params.retrieveType &&
          INTEREST_RATES.spinning.techniques[
            params.retrieveType as keyof typeof INTEREST_RATES.spinning.techniques
          ]
        ) {
          const tConfig =
            INTEREST_RATES.spinning.techniques[
              params.retrieveType as keyof typeof INTEREST_RATES.spinning.techniques
            ];
          const tTimeBonus =
            (tConfig.time as Record<string, number>)[params.timeOfDay] ?? 1.0;
          const tWeatherBonus =
            (tConfig.weather as Record<string, number>)[params.weather] ?? 1.0;
          techniqueBonus = tTimeBonus * tWeatherBonus;
        }

        let speedBonus = 1.0;
        if (
          params.retrieveSpeed &&
          INTEREST_RATES.spinning.speedBonuses[params.retrieveSpeed]
        ) {
          const sConfig =
            INTEREST_RATES.spinning.speedBonuses[params.retrieveSpeed];
          const sTimeBonus =
            (sConfig.time as Record<string, number>)[params.timeOfDay] ?? 1.0;
          const sWeatherBonus =
            (sConfig.weather as Record<string, number>)[params.weather] ?? 1.0;
          speedBonus = sTimeBonus * sWeatherBonus;
        }

        const focusSum = passiveFocus + activeAttract;
        const baseSpinningRate =
          rate * proximityMultiplier * techniqueBonus * speedBonus;

        if (focusSum > 0) {
          // Interest grows: strongly depends on correct depth, UNLESS already very interested
          const effectiveDepthScore =
            fish.interestLevel >= 0.2 ? 1.0 : depthScore;
          const effectiveVerticalGapScore =
            fish.interestLevel >= 0.2 ? 1.0 : verticalGapScore;
          rate =
            baseSpinningRate *
            focusSum *
            effectiveDepthScore *
            effectiveVerticalGapScore;
        } else {
          // Interest decays: happens even (or faster) if depth is wrong
          // If depth is wrong (score < 1), we slightly accelerate the decay
          const depthDecayMultiplier = 2.0 - depthScore * verticalGapScore;
          rate = baseSpinningRate * focusSum * depthDecayMultiplier;
        }
      } else {
        // Penalty for rigs on the bottom
        if (params.isOnBottom) {
          if (params.rigType === 'float') {
            rate *= INTEREST_RATES.floatOnBottomPenalty;

            if (fish.config.isPredator) {
              rate *= INTEREST_RATES.floatOnBottomPredatorPenalty;
            }
          }
        }

        // Ensure a minimum floor for stationary bait
        const isFloatOnBottom = params.rigType === 'float' && params.isOnBottom;
        const minStationaryRate =
          (isFloatOnBottom
            ? INTEREST_RATES.minStationaryRateFloatBottom
            : INTEREST_RATES.minStationaryRateNormal) *
          params.deltaTime *
          timeScore;
        rate = Math.max(minStationaryRate, rate);
      }

      // "Magnet" effect
      if (fish.interestLevel > INTEREST_RATES.magnetThreshold && rate > 0) {
        rate += INTEREST_RATES.magnetRate * params.deltaTime;
      }

      fish.interestLevel = Math.max(0, Math.min(1, fish.interestLevel + rate));

      // Immediate reset to Idle if interest hits 0 (for spinning)
      if (fish.interestLevel <= 0 && isSpinning) {
        fish.setState(FishState.Idle);
        continue;
      }

      if (fish.interestLevel > maxInterest) maxInterest = fish.interestLevel;

      // If the fish swims too far away while "interested", it should lose interest immediately
      const maxInterestDist =
        (isSpinning && fish.config.isPredator
          ? INTEREST_RATES.maxInterestDistSpinningPredator
          : INTEREST_RATES.maxInterestDistFloat) * scale;
      if (dist > maxInterestDist) {
        fish.setState(FishState.Idle);
        fish.interestLevel = 0;
        fish.hasLostInterest = true;
        continue;
      }

      // --- NIBBLING / CHOICE PHASE ---
      if (
        fish.interestLevel >= 1 &&
        dist < BITE_DETECTION.biteRadiusPx * scale
      ) {
        const aggressionBoost = isSpinning
          ? STRIKE_CHANCES.spinningAggressionBoost
          : 1.0;

        let strikeChance =
          STRIKE_CHANCES.baseStrikeChance * params.deltaTime * aggressionBoost;
        let fleeChance = STRIKE_CHANCES.baseFleeChance * params.deltaTime;
        let lossChance = 0.0;

        if (fish.biteStrategy === 'direct') {
          strikeChance =
            STRIKE_CHANCES.direct.strikeChance *
            params.deltaTime *
            aggressionBoost;
          fleeChance = STRIKE_CHANCES.direct.fleeChance * params.deltaTime;
        } else {
          strikeChance =
            STRIKE_CHANCES.playful.strikeChance *
            params.deltaTime *
            aggressionBoost;
          fleeChance = STRIKE_CHANCES.playful.fleeChance * params.deltaTime;
          lossChance = STRIKE_CHANCES.playful.lossChance * params.deltaTime;
        }

        if (params.rigType === 'float' && params.isOnBottom) {
          strikeChance *= STRIKE_CHANCES.floatOnBottomStrikePenalty;
        }

        if (Math.random() < strikeChance && (!isSpinning || params.isMoving)) {
          fish.setState(FishState.Biting);
          return { biter: fish, progress: 0 };
        }

        if (Math.random() < fleeChance) {
          fish.setState(FishState.Escaping);
          fish.interestLevel = 0;
          fish.hasLostInterest = true;
        }

        if (
          Math.random() < lossChance ||
          (params.rigType === 'float' &&
            params.isOnBottom &&
            Math.random() <
              STRIKE_CHANCES.floatOnBottomLossChance * params.deltaTime)
        ) {
          fish.setState(FishState.Idle);
          fish.interestLevel = 0;
          fish.hasLostInterest = true;
        }
      }

      if (fish.stateTimer > INTEREST_RATES.maxInterestDuration) {
        fish.setState(FishState.Idle);
        fish.interestLevel = 0;
        fish.hasLostInterest = true;
      }
    }
  }
  return { biter: null, progress: 1 - maxInterest };
}
