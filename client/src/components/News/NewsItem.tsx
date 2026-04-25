import ReactMarkdown from 'react-markdown';

import { useScrollReveal } from '@/hooks/ui/useScrollReveal';

import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';
import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';

import type { INews } from '@/services/news.service';

import styles from './News.module.css';

interface INewsItemProps {
  item: INews;
  isRead: boolean;
  index: number;
  markAsRead: (id: string) => void;
  t: (key: string) => string;
}

export function NewsItem({
  item,
  isRead,
  index,
  markAsRead,
  t,
}: INewsItemProps) {
  const { elementRef, isVisible } = useScrollReveal({
    threshold: 0.15,
    triggerOnce: true,
    rootMargin: '0px 0px 0px 0px',
  });

  const shouldAnimate = index > 0;
  const isActuallyVisible = isVisible || !shouldAnimate;

  return (
    <article
      ref={shouldAnimate ? (elementRef as React.RefObject<HTMLElement>) : null}
      className={`${styles.newsItem} ${isRead ? styles['newsItem--read'] : styles['newsItem--unread']} ${!item.imageUrl ? styles['newsItem--no-image'] : ''} ${isActuallyVisible ? styles['newsItem--visible'] : styles['newsItem--hidden']} ${!shouldAnimate ? styles['newsItem--no-animate'] : ''}`}
      style={{
        transitionDelay:
          isActuallyVisible && shouldAnimate ? `${(index % 4) * 0.07}s` : '0s',
      }}
    >
      {!isRead && (
        <div className={styles.newsItem__unreadBadge}>{t('news.newBadge')}</div>
      )}
      {item.imageUrl && (
        <div className={styles.newsItem__imageWrap}>
          <SkeletonImage
            src={item.imageUrl}
            alt={item.title}
            width="100%"
            height="var(--news-image-height)"
            skeletonHeight="var(--news-image-height)"
            className={styles.newsItem__image}
            onClick={() => window.open(item.imageUrl, '_blank')}
            objectFit="fill"
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
                  objectFit="contain"
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
              label={t('news.markRead')}
            />
          )}
        </div>
      </div>
    </article>
  );
}
