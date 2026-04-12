import { EXPERIENCE } from '@/common/configs/game/system.config';
import { FISH_SPECIES } from '@/common/configs/game/fish.config';

export const getXpNeededForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export const calculateOptimisticLevel = (
  currentLevel: number,
  currentXp: number,
  weight: number,
  speciesId: string,
): { newLevel: number; newXp: number } => {
  const species = FISH_SPECIES[speciesId];
  const multiplier = species?.priceMultiplier || 1.0;
  const xpGain = Math.ceil((weight || 0) * EXPERIENCE.baseXpPerKg * multiplier);

  let newXp = currentXp + xpGain;
  let newLevel = currentLevel;

  let xpNeeded = getXpNeededForLevel(newLevel);

  while (newXp >= xpNeeded) {
    newXp -= xpNeeded;
    newLevel += 1;
    xpNeeded = getXpNeededForLevel(newLevel);
  }

  return { newLevel, newXp };
};
