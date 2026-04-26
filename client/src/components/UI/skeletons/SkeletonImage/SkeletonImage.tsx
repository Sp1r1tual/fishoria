import { useState, useRef, useLayoutEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import styles from './SkeletonImage.module.css';

interface ISkeletonImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  skeletonHeight?: string | number;
  height?: string | number;
  width?: string | number;
  onClick?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  style?: React.CSSProperties;
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}

export const SkeletonImage = ({
  src,
  alt,
  className,
  wrapperClassName,
  skeletonHeight = '100%',
  height,
  width,
  onClick,
  objectFit = 'cover',
  style,
  imgProps,
}: ISkeletonImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      queueMicrotask(() => {
        setIsLoaded(true);
        setIsCached(true);
      });
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      className={`${styles.wrapper} ${wrapperClassName || ''}`}
      style={{ height, width }}
    >
      {!isLoaded && (
        <div className={styles.skeletonWrapper}>
          <Skeleton height={skeletonHeight} className={styles.skeleton} />
        </div>
      )}
      {!hasError ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`${className || ''} ${styles.image} ${isLoaded ? styles.imageVisible : styles.imageHidden}`}
          style={{
            ...style,
            objectFit,
            height: height || '100%',
            transition: isCached ? 'none' : undefined,
          }}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          {...imgProps}
        />
      ) : (
        <div className={styles.errorPlaceholder}>
          <span>Image</span>
        </div>
      )}
    </div>
  );
};
