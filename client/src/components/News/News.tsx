import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import 'react-loading-skeleton/dist/skeleton.css';

import type { INews } from '@/services/news.service';

import { useNewsState } from '@/hooks/game/useNewsState';

import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';
import { NewsSkeleton } from './NewsSkeleton';

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
            label={t('news.markAllRead', 'Mark all as read')}
          />
        ) : undefined
      }
    >
      <div className={styles.news__content}>
        {isLoading ? (
          <NewsSkeleton />
        ) : news.length > 0 ? (
          <div className={`${styles.news__list} fade-in`}>
            {news.map((item: INews) => {
              const isRead = readIds.includes(item.id);
              return (
                <article
                  key={item.id}
                  className={`${styles.newsItem} ${isRead ? styles['newsItem--read'] : styles['newsItem--unread']} ${!item.imageUrl ? styles['newsItem--no-image'] : ''}`}
                >
                  {!isRead && (
                    <div className={styles.newsItem__unreadBadge}>
                      {t('news.newBadge', 'NEW')}
                    </div>
                  )}
                  {item.imageUrl && (
                    <div className={styles.newsItem__imageWrap}>
                      <SkeletonImage
                        src={item.imageUrl}
                        alt={item.title}
                        width="100%"
                        height="100%"
                        className={styles.newsItem__image}
                        onClick={() => window.open(item.imageUrl, '_blank')}
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <div className={styles.newsItem__body}>
                    <h3 className={styles.newsItem__title}>{item.title}</h3>
                    <div className={styles.newsItem__markdown}>
                      <ReactMarkdown
                        components={{
                          img: ({ src, alt }) => (
                            <SkeletonImage
                              src={src || ''}
                              alt={alt || ''}
                              onClick={() => window.open(src, '_blank')}
                              height="auto"
                              width="100%"
                              objectFit="cover"
                              wrapperClassName={styles.newsItem__markdownImage}
                            />
                          ),
                        }}
                      >
                        {item.content}
                      </ReactMarkdown>
                    </div>
                    <div className={styles.newsItem__footer}>
                      <span className={styles.newsItem__date}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {!isRead && (
                        <WoodyButton
                          variant="brown"
                          size="sm"
                          onClick={() => markAsRead(item.id)}
                          label={t('news.markRead', 'Mark as read')}
                        />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={`${styles.news__emptyState} fade-in`}>
            <div className={styles.news__emptyIcon}>📰</div>
            <p className={styles.news__emptyMessage}>
              {t('news.noNews', 'No news for now')}
            </p>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
