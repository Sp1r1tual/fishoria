/**
 * Common thresholds for fish quality based on weight relative to species max.
 */
const FISH_QUALITY_THRESHOLDS = {
  GOOD: 0.4,
  TROPHY: 0.75,
} as const;

export function getFishQuality(weight: number, maxWeight: number) {
  const isTrophy = weight >= maxWeight * FISH_QUALITY_THRESHOLDS.TROPHY;
  const isGood = weight >= maxWeight * FISH_QUALITY_THRESHOLDS.GOOD;

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
