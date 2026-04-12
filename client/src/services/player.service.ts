import type { IPlayerProfile } from '@/common/types/player.types';

import { $mainApi } from '@/http/axios';

export class PlayerService {
  static async getProfile(): Promise<IPlayerProfile> {
    const { data } = await $mainApi.get<IPlayerProfile>('/player/profile');
    return data;
  }

  static async updateProfile(payload: { username?: string; avatar?: string }) {
    const { data } = await $mainApi.post('/player/update', payload);
    return data;
  }

  static async addMoney(payload: { amount: number; targetUserId?: string }) {
    const { data } = await $mainApi.post('/player/add-money', payload);
    return data;
  }

  static async resetProfile() {
    const { data } = await $mainApi.post('/player/reset');
    return data;
  }

  static async updateLanguage(language: string) {
    const { data } = await $mainApi.post('/player/language', { language });
    return data;
  }
}
