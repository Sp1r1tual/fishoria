import { CATCH_RESULT } from '@/common/configs/game/system.config';

export function getFishQuality(weight: number, maxWeight: number) {
  const isTrophy = weight >= maxWeight * CATCH_RESULT.qualityThresholds.trophy;
  const isGood = weight >= maxWeight * CATCH_RESULT.qualityThresholds.good;

  return {
    isTrophy,
    isGood,
    isNormal: !isGood && !isTrophy,
  };
}

export function getFishQualityLabel(
  weight: number,
  maxWeight: number,
): 'trophy' | 'good' | 'small' {
  const { isTrophy, isGood } = getFishQuality(weight, maxWeight);
  if (isTrophy) return 'trophy';
  if (isGood) return 'good';
  return 'small';
}
