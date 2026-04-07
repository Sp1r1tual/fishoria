import type { IFishSpeciesConfig, CatchResultType } from '@/common/types';

import { CATCH_RESULT } from '@/common/configs/game';

export function generateCatch(
  fish: IFishSpeciesConfig,
  weight: number,
  baitUsed: string,
  method: string,
  lakeId: string,
  lakeName: string,
  trashChance: number,
): CatchResultType {
  const isTrash = Math.random() < trashChance;

  if (isTrash) {
    const item =
      CATCH_RESULT.trashItems[
        Math.floor(Math.random() * CATCH_RESULT.trashItems.length)
      ];
    return {
      type: 'trash',
      name: item,
      description: item,
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
