import { $mainApi } from '@/http/axios';

export const PlayerService = {
  getProfile: async () => {
    const { data } = await $mainApi.get('/player/profile');
    return data;
  },
  addMoney: async (amount: number) => {
    const { data } = await $mainApi.post('/player/add-money', { amount });
    return data;
  },
  resetProfile: async () => {
    const { data } = await $mainApi.post('/player/reset');
    return data;
  },
  updateLanguage: async (language: string) => {
    const { data } = await $mainApi.post('/player/language', { language });
    return data;
  },
  updateProfile: async (payload: { username?: string; avatar?: string }) => {
    const { data } = await $mainApi.post('/player/update', payload);
    return data;
  },
};
