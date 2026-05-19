import {
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { NewsService } from '../services/news.service';

export const NEWS_KEYS = {
  all: ['news'] as const,
  list: () => [...NEWS_KEYS.all, 'list'] as const,
  infinite: (lang: string, limit: number) =>
    [...NEWS_KEYS.all, 'infinite', lang, limit] as const,
};

export const useNewsQuery = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  return useQuery({
    queryKey: NEWS_KEYS.list(),
    queryFn: () => NewsService.getAll(language),
    placeholderData: keepPreviousData,
  });
};

export const useInfiniteNewsQuery = (limit = 3) => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  return useInfiniteQuery({
    queryKey: NEWS_KEYS.infinite(language, limit),
    queryFn: ({ pageParam = 1 }) =>
      NewsService.getAll(language, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
};
