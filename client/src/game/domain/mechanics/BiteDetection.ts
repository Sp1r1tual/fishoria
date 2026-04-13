import type {
  IBiteDetectionParams,
  IBiteResult,
  LureTypeType,
} from '@/common/types';

import { FISH_STATES } from '../fish/constants/FishState';
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
    (f) => f.state === FISH_STATES.Interested || f.state === FISH_STATES.Biting,
  );

  for (const fish of params.fish as Fish[]) {
    if (
      fish.state === FISH_STATES.Hooked ||
      (interestedFish && interestedFish !== fish)
    )
      continue;

    if (fish.state === FISH_STATES.Biting) continue;

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

    if (fish.config.isPredator && params.weather !== 'clear') {
      const weatherBoost = params.weather === 'rain' ? 0.35 : 0.15;
      timeScore = Math.min(1.0, timeScore + weatherBoost);
    }

    if (timeScore < BITE_DETECTION.minTimeScoreForInterest) {
      if (Math.random() < BITE_DETECTION.chanceOfBiteAtDeadHour) {
        fish.setState(FISH_STATES.Idle);
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
      fish.state === FISH_STATES.Idle &&
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
      !interestedFish
    ) {
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

      const isSpookZone =
        params.timeSinceCast < BITE_DETECTION.splashZoneTime * 0.4 &&
        dist < BITE_DETECTION.splashZoneRadius * 0.7 * scale;

      const isAttractSplashZone =
        !isSpookZone &&
        params.timeSinceCast < BITE_DETECTION.splashZoneTime &&
        dist < BITE_DETECTION.splashZoneRadius * scale &&
        fish.config.isPredator;

      if (isSpookZone) {
        fish.setState(FISH_STATES.Idle);
        fish.interestLevel = 0;
        fish.hasLostInterest = true;
        continue;
      }

      if (
        params.timeSinceCast >
          (isSpinning
            ? BITE_DETECTION.spinningGracePeriod
            : BITE_DETECTION.floatGracePeriod) ||
        isAttractSplashZone
      ) {
        let attractSplashChance = 0;
        const isNewSplash =
          fish.lastSplashSeenTime === -1 ||
          params.timeSinceCast < fish.lastSplashSeenTime;

        if (isAttractSplashZone) {
          fish.lastSplashSeenTime = params.timeSinceCast;
          if (isNewSplash && !isSpinning) {
            if (Math.random() < BITE_DETECTION.splashSpookChance) {
              fish.hasLostInterest = true;
              continue;
            }
            attractSplashChance = BITE_DETECTION.splashInterestChanceStatic;
          } else if (isNewSplash && isSpinning) {
            attractSplashChance = BITE_DETECTION.splashInterestChanceSpinning;
          }
        }

        if (
          params.deltaTime > 0 &&
          (Math.random() < attractChance * params.deltaTime ||
            Math.random() < attractSplashChance)
        ) {
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
            fish.setState(FISH_STATES.Biting);
            return { biter: fish, progress: 0 };
          }

          fish.setState(FISH_STATES.Interested);
          fish.interestLevel = isSpinning
            ? BITE_DETECTION.initialInterestSpinning
            : BITE_DETECTION.initialInterestFloat;

          if (isAttractSplashZone) {
            fish.interestLevel += BITE_DETECTION.splashInterestBoost;
          }
        }
      }
    }

    if (fish.state === FISH_STATES.Interested && !fish.hasLostInterest) {
      if (!fish.hasAttemptedAttack) {
        fish.hasAttemptedAttack = true;

        let attackChance =
          STRIKE_CHANCES.immediateAttackChanceMultiplier *
          baitScore *
          timeScore *
          fish.config.baseCatchChance;

        if (params.rigType === 'float' && params.isOnBottom) {
          attackChance *= STRIKE_CHANCES.floatOnBottomStrikePenalty;
        }

        const finalChance = Math.min(
          attackChance,
          STRIKE_CHANCES.immediateAttackChanceCap,
        );

        if (Math.random() < finalChance && (!isSpinning || params.isMoving)) {
          fish.setState(FISH_STATES.Biting);
          return { biter: fish, progress: 0 };
        }
      }

      const weatherScore =
        params.weather === 'rain'
          ? INTEREST_RATES.weather.rain
          : params.weather === 'cloudy'
            ? INTEREST_RATES.weather.cloudy
            : INTEREST_RATES.weather.clear;

      let rate =
        baitScore *
        timeScore *
        params.visibility *
        weatherScore *
        fish.config.baseCatchChance *
        INTEREST_RATES.baseFillRate *
        params.deltaTime;

      if (params.rigType === 'float' || params.rigType === 'feeder') {
        rate *= depthScore * verticalGapScore;
        if (fish.config.isPredator) {
          rate *= INTEREST_RATES.predatorInterestBonusStatic;
        }
      }

      if (isSpinning) {
        const distRatio = dist / visionRadius;

        const proximityMultiplier = Math.max(
          0.05,
          1.1 - Math.pow(distRatio, 1.3),
        );

        const passiveFocus = params.isOnBottom
          ? INTEREST_RATES.spinning.passiveFocusOnBottom
          : INTEREST_RATES.spinning.passiveFocusInWater;

        const activeAttract = params.isMoving
          ? INTEREST_RATES.spinning.activeAttractMoving
          : INTEREST_RATES.spinning.activeAttractIdle;

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
          const depthDecayMultiplier = 2.0 - depthScore * verticalGapScore;
          rate = baseSpinningRate * focusSum * depthDecayMultiplier;
        }
      } else {
        if (params.isOnBottom) {
          if (params.rigType === 'float') {
            rate *= INTEREST_RATES.floatOnBottomPenalty;

            if (fish.config.isPredator) {
              rate *= INTEREST_RATES.floatOnBottomPredatorPenalty;
            }
          }
        }

        const isFloatOnBottom = params.rigType === 'float' && params.isOnBottom;
        const minStationaryRate =
          (isFloatOnBottom
            ? INTEREST_RATES.minStationaryRateFloatBottom
            : INTEREST_RATES.minStationaryRateNormal) *
          params.deltaTime *
          timeScore;
        rate = Math.max(minStationaryRate, rate);
      }

      if (fish.interestLevel > INTEREST_RATES.magnetThreshold && rate > 0) {
        rate += INTEREST_RATES.magnetRate * params.deltaTime;
      }

      fish.interestLevel = Math.max(0, Math.min(1, fish.interestLevel + rate));

      if (fish.interestLevel <= 0 && isSpinning) {
        fish.setState(FISH_STATES.Idle);
        continue;
      }

      if (fish.interestLevel > maxInterest) maxInterest = fish.interestLevel;

      const maxInterestDist =
        (isSpinning && fish.config.isPredator
          ? INTEREST_RATES.maxInterestDistSpinningPredator
          : INTEREST_RATES.maxInterestDistFloat) * scale;
      if (dist > maxInterestDist) {
        fish.setState(FISH_STATES.Idle);
        fish.interestLevel = 0;
        fish.hasLostInterest = true;
        continue;
      }

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
          fish.setState(FISH_STATES.Biting);
          return { biter: fish, progress: 0 };
        }

        if (Math.random() < fleeChance) {
          fish.setState(FISH_STATES.Escaping);
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
          fish.setState(FISH_STATES.Idle);
          fish.interestLevel = 0;
          fish.hasLostInterest = true;
        }
      }

      if (fish.stateTimer > INTEREST_RATES.maxInterestDuration) {
        fish.setState(FISH_STATES.Idle);
        fish.interestLevel = 0;
        fish.hasLostInterest = true;
      }
    }
  }
  return { biter: null, progress: 1 - maxInterest };
}
