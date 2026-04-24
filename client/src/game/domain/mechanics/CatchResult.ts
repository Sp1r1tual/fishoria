import type { IFishSpeciesConfig, CatchResultType } from '@/common/types';

import { CATCH_RESULT } from '@/common/configs/game';
import { getFishQuality } from '@/common/utils/fish.utils';

export function generateCatch(
  fish: IFishSpeciesConfig,
  weight: number,
  baitUsed: string,
  method: string,
  lakeId: string,
  lakeName: string,
  trashChance: number,
  isTrashOverride?: boolean,
): CatchResultType {
  const { isTrophy } = getFishQuality(weight, fish.weightRange.max);
  const isTrash = isTrashOverride ?? (!isTrophy && Math.random() < trashChance);

  if (isTrash) {
    const item =
      CATCH_RESULT.trashItems[
        Math.floor(Math.random() * CATCH_RESULT.trashItems.length)
      ];
    return {
      type: 'trash',
      name: item,
      description: item,
      weight: 0,
      length: 0,
      baitUsed,
      method,
      lakeId,
      lakeName,
    };
  }

  const length = Math.max(
    CATCH_RESULT.minLength,
    weight * CATCH_RESULT.lengthPerKg +
      Math.random() * CATCH_RESULT.lengthJitter,
  );

  return {
    type: 'fish',
    species: fish,
    weight,
    length,
    baitUsed,
    method,
    lakeId,
    lakeName,
  };
}
