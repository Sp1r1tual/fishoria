import type { IPlayerProfile, IOwnedGearItem } from '../types';

export const preserveValidGearSelection = (
  localUid: string | null,
  serverUid: string | null,
  allGearItems: IOwnedGearItem[],
) => {
  if (!localUid) return serverUid;
  const item = allGearItems.find((gi: IOwnedGearItem) => gi.uid === localUid);

  if (
    item &&
    !item.isBroken &&
    (item.condition === undefined ||
      item.condition === null ||
      item.condition > 0)
  ) {
    return localUid;
  }

  return serverUid;
};

export const updateProfilePreservingGear = (
  old: IPlayerProfile | undefined,
  data: IPlayerProfile,
): IPlayerProfile => {
  if (!old) return data;

  return {
    ...data,
    activeBait: old.activeBait,
    activeGroundbait: old.activeGroundbait,
    equippedRodUid: preserveValidGearSelection(
      old.equippedRodUid,
      data.equippedRodUid,
      data.gearItems,
    ),
    equippedReelUid: preserveValidGearSelection(
      old.equippedReelUid,
      data.equippedReelUid,
      data.gearItems,
    ),
    equippedLineUid: preserveValidGearSelection(
      old.equippedLineUid,
      data.equippedLineUid,
      data.gearItems,
    ),
    equippedHookUid: preserveValidGearSelection(
      old.equippedHookUid,
      data.equippedHookUid,
      data.gearItems,
    ),
  };
};
