import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { NewsService } from '../services/news.service';

export const NEWS_KEYS = {
  all: ['news'] as const,
  list: () => [...NEWS_KEYS.all, 'list'] as const,
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
