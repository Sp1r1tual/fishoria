export interface IQuestCondition {
  id: string;
  type: 'CATCH_METHOD' | 'CATCH_SPECIES' | string;
  value: string;
  target: number;
  label: string;
}

export interface IQuest {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  conditions: IQuestCondition[];
  xpReward: number;
  moneyReward: number;
  order: number;
}

export interface IPlayerQuest {
  id: string;
  profileId: string;
  questId: string;
  quest: IQuest;
  progress: Record<string, number>;
  isCompleted: boolean;
  isClaimed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOwnedGearItem {
  uid: string;
  id: string;
  itemId: string;
  itemType: string;
  condition?: number;
  meters?: number; // for lines
  isBroken?: boolean;
}

export interface IFishCatchMetadata {
  id: string;
  speciesId: string;
  speciesName: string;
  lakeId: string;
  lakeName: string;
  weight: number;
  length: number;
  baitUsed: string;
  method: string;
  isReleased: boolean;
  caughtAt: Date | string;
}

export interface ILakeStatMetadata {
  id: string;
  lakeId: string;
  totalCaught: number;
  totalWeight: number;
  records: Record<string, number>;
  minWeights: Record<string, number>;
  speciesCounts: Record<string, number>;
  speciesWeights: Record<string, number>;
}

export interface IPlayerProfile {
  id: string;
  user: {
    username: string | null;
    avatar: string | null;
    language: string;
  };
  money: number;
  level: number;
  xp: number;
  equippedRodUid: string | null;
  equippedReelUid: string | null;
  equippedLineUid: string | null;
  equippedHookUid: string | null;
  hasEchoSounder: boolean;
  activeBait: string;
  activeGroundbait: string;
  gearItems: IOwnedGearItem[];
  consumables: { itemId: string; itemType: string; quantity: number }[];
  fishCatches: IFishCatchMetadata[];
  lakeStats: ILakeStatMetadata[];
  playerQuests: IPlayerQuest[];
}
