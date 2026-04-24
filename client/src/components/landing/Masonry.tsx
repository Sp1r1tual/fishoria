import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { useScrollReveal } from '@/hooks/ui/useScrollReveal';

import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';

import styles from './Masonry.module.css';

const IMAGE_1 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV8xLnBuZyIsImlhdCI6MTc3NTMzODAzNiwiZXhwIjo0ODk3NDAyMDM2fQ.zNb9uZ4wudwiOHb--LQ57BF9UDJENXPd61WONC4-dTs';
const IMAGE_2 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV8yLnBuZyIsImlhdCI6MTc3NTM0MzU5NiwiZXhwIjo0ODk3NDA3NTk2fQ.9ZRMKOxn_3SYoqI20xyaUSunpXQrJYjwFsjlbOQHk04';
const IMAGE_3 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_3.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV8zLnBuZyIsImlhdCI6MTc3NTMzODEzNCwiZXhwIjo0ODk3NDAyMTM0fQ.roj7iXXfQrcjXMAyOkOZ0Ex0XMrj3TOxUMNYMOC_U4s';
const IMAGE_4 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV80LnBuZyIsImlhdCI6MTc3NTMzODE1NCwiZXhwIjo0ODk3NDAyMTU0fQ.HGQUvGDJm5dQsfv2irhzSNKo9SWGPRYndQ7QyZ9nqWU';
const IMAGE_5 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_5.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV81LnBuZyIsImlhdCI6MTc3NTMzODE3NiwiZXhwIjo0ODk3NDAyMTc2fQ.x9YIiYQ0GgH2yQEZVbp7lF_LToo8_gXEOf2LuBeMFHU';

interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  className: string;
}

export const Masonry = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, style, ...rest }, ref) => {
    const { t } = useTranslation();
    const { elementRef, isVisible } = useScrollReveal<HTMLDivElement>();

    const items: GalleryItem[] = [
      {
        src: IMAGE_1,
        alt: t(
          'landing.gallery.image1',
          'Fishoria gameplay – lake fishing scene',
        ),
        caption: t('landing.gallery.caption1', 'Lake fishing'),
        className: styles.item1,
      },
      {
        src: IMAGE_2,
        alt: t(
          'landing.gallery.image2',
          'Fishoria gameplay – fishing rod action',
        ),
        caption: t('landing.gallery.caption2', 'Fishing action'),
        className: styles.item2,
      },
      {
        src: IMAGE_3,
        alt: t('landing.gallery.image3', 'Fishoria gameplay – rare fish catch'),
        caption: t('landing.gallery.caption3', 'Rare catch'),
        className: styles.item3,
      },
      {
        src: IMAGE_4,
        alt: t(
          'landing.gallery.image4',
          'Fishoria gameplay – equipment screen',
        ),
        caption: t('landing.gallery.caption4', 'Equipment'),
        className: styles.item4,
      },
      {
        src: IMAGE_5,
        alt: t(
          'landing.gallery.image5',
          'Fishoria gameplay – inventory overview',
        ),
        caption: t('landing.gallery.caption5', 'Inventory'),
        className: styles.item5,
      },
    ];

    return (
      <section
        ref={ref as React.Ref<HTMLElement>}
        className={`${styles.rightColumn} ${isVisible ? styles.visible : ''} ${className ?? ''}`}
        style={style}
        aria-label={t('landing.gallery.ariaLabel', 'Game screenshots gallery')}
        {...rest}
      >
        <div ref={elementRef} className={styles.masonry} role="list">
          {items.map((item) => (
            <figure
              key={item.src}
              className={`${styles.masonryItem} ${item.className}`}
              role="listitem"
            >
              <button
                type="button"
                className={styles.masonryImageBtn}
                onClick={() => window.open(item.src, '_blank')}
                aria-label={t(
                  'landing.gallery.openAriaLabel',
                  'Open {{caption}} screenshot in full size',
                  { caption: item.caption },
                )}
              >
                <SkeletonImage
                  src={item.src}
                  alt={item.alt}
                  className={styles.masonryImage}
                  wrapperClassName={styles.masonryImageWrapper}
                  objectFit="cover"
                />
              </button>
              <figcaption className={styles.masonryCaption}>
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  },
);

Masonry.displayName = 'Masonry';
