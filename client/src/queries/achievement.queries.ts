import { useQuery } from '@tanstack/react-query';

import { $mainApi } from '@/http/axios';

export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await $mainApi.get('/achievements');
      return data;
    },
  });
};
