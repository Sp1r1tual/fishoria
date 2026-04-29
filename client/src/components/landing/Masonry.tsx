import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { useScrollReveal } from '@/hooks/ui/useScrollReveal';

import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';

import styles from './Masonry.module.css';

const IMAGE_1 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_1.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV8xLndlYnAiLCJpYXQiOjE3Nzc0NTA5NDUsImV4cCI6NDg5OTUxNDk0NX0.M-3dvmkzWcUDSBIjz2TdR99NVxD6ABeYDQ9uGVx20Nk';
const IMAGE_2 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_2.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV8yLndlYnAiLCJpYXQiOjE3Nzc0NTI2OTUsImV4cCI6NDg5OTUxNjY5NX0.trD2XRCk-S8l94F4u8EdwyQzpQoFy-19gDzxqwpOQho';
const IMAGE_3 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_3.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV8zLndlYnAiLCJpYXQiOjE3Nzc0NTEwMDgsImV4cCI6NDg5OTUxNTAwOH0.ZauiZNip4SqeR1SF4jBiUFtU2Np3DKnSvT_W_NQEiX0';
const IMAGE_4 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_4.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV80LndlYnAiLCJpYXQiOjE3Nzc0NTEwMzMsImV4cCI6NDg5OTUxNTAzM30.Zcs6LZAZhYmb3mOmFpTd_juOVcQhlIPAXRB9reXBVzg';
const IMAGE_5 =
  'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/landing/grid_image_5.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2xhbmRpbmcvZ3JpZF9pbWFnZV81LndlYnAiLCJpYXQiOjE3Nzc0NTEwNjIsImV4cCI6NDg5OTUxNTA2Mn0.Ot6wolTj5TRhi4x1HeWrcXLARynjPDKdEHMKl-HN-8k';

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
