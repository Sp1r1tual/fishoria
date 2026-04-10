import { $mainApi } from '@/http/axios';
import type { IPlayerProfile } from '@/common/types';

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
  }): Promise<IPlayerProfile> => {
    const { data } = await $mainApi.post<IPlayerProfile>(
      '/game/catch',
      payload,
    );
    return data;
  },
  breakGear: async (payload: {
    type: 'rod' | 'reel' | 'line' | 'hook' | 'bait';
    baitId?: string;
    lostMeters?: number;
    rodDamage?: number;
    reelDamage?: number;
  }): Promise<IPlayerProfile> => {
    const { data } = await $mainApi.post<IPlayerProfile>(
      '/game/break',
      payload,
    );
    return data;
  },
};
