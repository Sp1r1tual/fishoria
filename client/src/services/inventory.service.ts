import type {
  IPlayerProfile,
  IEquipPayload,
  IRepairPayload,
  IDeleteGearPayload,
  IConsumeConsumablePayload,
} from '@/common/types';

import { $mainApi } from '@/http/axios';

export class InventoryService {
  static async equip(payload: IEquipPayload): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post<IPlayerProfile>(
      '/inventory/equip',
      payload,
    );
    return data;
  }

  static async repair(payload: IRepairPayload): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post<IPlayerProfile>(
      '/inventory/repair',
      payload,
    );
    return data;
  }

  static async deleteGear(
    payload: IDeleteGearPayload,
  ): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post<IPlayerProfile>(
      '/inventory/delete',
      payload,
    );
    return data;
  }

  static async consumeConsumable(
    payload: IConsumeConsumablePayload,
  ): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post<IPlayerProfile>(
      '/inventory/consume',
      payload,
    );
    return data;
  }
}
