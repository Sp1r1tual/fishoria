import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { $mainApi } from '@/http/axios';

export const ACHIEVEMENT_KEYS = {
  all: ['achievements'] as const,
};

export const AchievementService = {
  getAchievements: async (lang?: string) => {
    const { data } = await $mainApi.get('/achievements', {
      params: lang ? { lang } : {},
    });
    return data;
  },
};

export const useAchievements = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  return useQuery({
    queryKey: [...ACHIEVEMENT_KEYS.all, language],
    queryFn: () => AchievementService.getAchievements(language),
  });
};
