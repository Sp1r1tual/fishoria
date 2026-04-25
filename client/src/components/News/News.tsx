import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useNewsState } from '@/hooks/game/useNewsState';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { NewsSkeleton } from './NewsSkeleton';
import { NewsItem } from './NewsItem';

import type { INews } from '@/services/news.service';

import newsIcon from '@/assets/ui/news.webp';

import styles from './News.module.css';

export function News() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { news, isLoading, readIds, markAsRead, markAllAsRead, hasUnread } =
    useNewsState();

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
