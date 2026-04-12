import { useQuery } from '@tanstack/react-query';

import { $mainApi } from '@/http/axios';

export const ACHIEVEMENT_KEYS = {
  all: ['achievements'] as const,
};

export const AchievementService = {
  getAchievements: async () => {
    const { data } = await $mainApi.get('/achievements');
    return data;
  },
};

export const useAchievements = () => {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.all,
    queryFn: AchievementService.getAchievements,
  });
};
