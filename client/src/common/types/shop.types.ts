import type { GearTypeType } from './gear.types';

export interface IBuyItemPayload {
  itemId: string;
  itemType: GearTypeType;
  quantity?: number;
}
