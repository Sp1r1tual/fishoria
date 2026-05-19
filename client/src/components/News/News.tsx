import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useNewsState } from '@/hooks/game/useNewsState';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { NewsSkeleton } from './NewsSkeleton';
import { NewsItem } from './NewsItem';
import { Spinner } from '../UI/Spinner/Spinner';

import type { INews } from '@/services/news.service';

import newsIcon from '@/assets/ui/news.webp';

import styles from './News.module.css';

export function News() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    news,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    readIds,
    markAsRead,
    markAllAsRead,
    hasUnread,
  } = useNewsState({ isInfinite: true });

  const observerRef = useRef<HTMLDivElement | null>(null);
  const [minLoading, setMinLoading] = useState(false);

  useEffect(() => {
    if (isLoading || isFetchingNextPage) {
      const timer = setTimeout(() => {
        setMinLoading(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setMinLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetchingNextPage]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const showTopLoader = isLoading || isFetchingNextPage || minLoading;

  return (
    <ScreenContainer
      title={t('news.title', 'News')}
      titleIcon={newsIcon}
      onBack={() => navigate('/')}
      className={styles.news}
      headerExtra={
        hasUnread ? (
          <WoodyButton
            variant="green"
            size="sm"
            onClick={markAllAsRead}
            label={t('news.markAllRead')}
          />
        ) : undefined
      }
    >
      {createPortal(
        <div
          className={`${styles.news__topLoader} ${
            showTopLoader ? styles['news__topLoader--visible'] : ''
          }`}
        >
          <Spinner visible={showTopLoader} size="sm" />
        </div>,
        document.body,
      )}

      <div className={styles.news__content}>
        {isLoading ? (
          <NewsSkeleton />
        ) : news.length > 0 ? (
          <div className={styles.news__list}>
            {news.map((item: INews, index: number) => (
              <NewsItem
                key={item.id}
                item={item}
                isRead={readIds.includes(item.id)}
                index={index}
                markAsRead={markAsRead}
                t={t}
              />
            ))}
            {isFetchingNextPage && <NewsSkeleton count={1} />}
            <div ref={observerRef} style={{ height: '10px' }} />
          </div>
        ) : (
          <div className={`${styles.news__emptyState} fade-in`}>
            <div className={styles.news__emptyIcon}>📰</div>
            <p className={styles.news__emptyMessage}>{t('news.noNews')}</p>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
