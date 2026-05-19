import { useCallback, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';

import { useNewsQuery, useInfiniteNewsQuery } from '@/queries/news.queries';
import { markRead, markAllRead } from '@/store/slices/newsSlice';

export function useNewsState(options?: { isInfinite?: boolean }) {
  const isInfinite = options?.isInfinite ?? false;
  const dispatch = useAppDispatch();
  const { data: allNews = [], isLoading: isLoadingAll } = useNewsQuery();
  const {
    data: infiniteData,
    isLoading: isLoadingInfinite,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNewsQuery(3);

  const readIds = useAppSelector((state) => state.news.readIds);

  const news = useMemo(() => {
    if (isInfinite) {
      return infiniteData?.pages.flatMap((page) => page.data) ?? [];
    }
    return allNews;
  }, [isInfinite, allNews, infiniteData]);

  const isLoading = isInfinite ? isLoadingInfinite : isLoadingAll;

  const markAsRead = useCallback(
    (id: string) => {
      dispatch(markRead(id));
    },
    [dispatch],
  );

  const markAllAsRead = useCallback(() => {
    const ids = allNews.map((n) => n.id);
    dispatch(markAllRead(ids));
  }, [allNews, dispatch]);

  const unreadCount = useMemo(() => {
    const readSet = new Set(readIds);
    return allNews.filter((n) => !readSet.has(n.id)).length;
  }, [allNews, readIds]);

  return {
    news,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    readIds,
    markAsRead,
    markAllAsRead,
    unreadCount,
    hasUnread: unreadCount > 0,
  };
}
