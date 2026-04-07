import { $mainApi } from '@/http/axios';

export const InventoryService = {
  equip: async (
    payload:
      | {
          targetType: 'rod' | 'reel' | 'line' | 'hook' | 'bait' | 'groundbait';
          uid?: string | null;
          targetId?: string | null;
        }
      | {
          equips: {
            targetType:
              | 'rod'
              | 'reel'
              | 'line'
              | 'hook'
              | 'bait'
              | 'groundbait';
            uid?: string | null;
            targetId?: string | null;
          }[];
        },
  ) => {
    const { data } = await $mainApi.post('/inventory/equip', payload);
    return data;
  },
  repair: async (payload: {
    kitUid: string;
    targetUid: string;
    targetType: 'rod' | 'reel';
  }) => {
    const { data } = await $mainApi.post('/inventory/repair', payload);
    return data;
  },
  deleteGear: async (payload: { uid: string }) => {
    const { data } = await $mainApi.post('/inventory/delete', payload);
    return data;
  },
  consumeConsumable: async (payload: {
    itemId: string;
    itemType: string;
    quantity?: number;
  }) => {
    const { data } = await $mainApi.post('/inventory/consume', payload);
    return data;
  },
};
