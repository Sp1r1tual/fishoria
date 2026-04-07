import { useQuery } from '@tanstack/react-query';

import { NewsService } from '../services/news.service';

const newsKeys = {
  all: ['news'] as const,
  list: (lang: string) => [...newsKeys.all, 'list', lang] as const,
};

export const useNewsQuery = (lang: string = 'en') => {
  return useQuery({
    queryKey: newsKeys.list(lang),
    queryFn: () => NewsService.getAll(lang),
    staleTime: 5 * 60 * 1000,
  });
};
