import { $mainApi } from '@/http/axios';

export const GameService = {
  catchFish: async (payload: {
    speciesId: string;
    speciesName: string;
    weight: number;
    length: number;
    lakeId: string;
    lakeName: string;
    baitUsed: string;
    method: string;
    xpGain?: number;
    rodDamage?: number;
    reelDamage?: number;
    maxWeight?: number;
    sizeRank?: 'small' | 'good' | 'trophy';
    isReleased?: boolean;
  }) => {
    const { data } = await $mainApi.post('/game/catch', payload);
    return data;
  },
  breakGear: async (payload: {
    type: 'rod' | 'reel' | 'line' | 'hook' | 'bait';
    baitId?: string;
    lostMeters?: number;
    rodDamage?: number;
    reelDamage?: number;
  }) => {
    const { data } = await $mainApi.post('/game/break', payload);
    return data;
  },
};
