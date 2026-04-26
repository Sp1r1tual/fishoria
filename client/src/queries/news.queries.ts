import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { NewsService } from '../services/news.service';

export const NEWS_KEYS = {
  all: ['news'] as const,
  list: (lang: string) => [...NEWS_KEYS.all, 'list', lang] as const,
};

export const useNewsQuery = (lang: string = 'en') => {
  return useQuery({
    queryKey: NEWS_KEYS.list(lang),
    queryFn: () => NewsService.getAll(lang),
    placeholderData: keepPreviousData,
  });
};
