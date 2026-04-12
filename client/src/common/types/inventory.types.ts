import type { IGearAction } from './gear.types';

export type IEquipPayload = IGearAction | { equips: IGearAction[] };

export interface IRepairPayload {
  kitUid: string;
  targetUid: string;
  targetType: 'rod' | 'reel';
}

export interface IDeleteGearPayload {
  uid: string;
}

export interface IConsumeConsumablePayload {
  itemId: string;
  itemType: string;
  quantity?: number;
}
