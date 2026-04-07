import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import { useNewsQuery } from '@/queries/news.queries';
import { markRead, markAllRead } from '@/store/slices/newsSlice';

export function useNewsState() {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const { data: news = [], isLoading } = useNewsQuery(i18n.language);
  const readIds = useAppSelector((state) => state.news.readIds);

  const markAsRead = useCallback(
    (id: string) => {
      dispatch(markRead(id));
    },
    [dispatch],
  );

  const markAllAsRead = useCallback(() => {
    const ids = news.map((n) => n.id);
    dispatch(markAllRead(ids));
  }, [news, dispatch]);

  const unreadCount = useMemo(() => {
    return news.filter((n) => !readIds.includes(n.id)).length;
  }, [news, readIds]);

  return {
    news,
    isLoading,
    readIds,
    markAsRead,
    markAllAsRead,
    unreadCount,
    hasUnread: unreadCount > 0,
  };
}
