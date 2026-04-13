import { useState, useEffect, useRef } from 'react';

interface IScrollRevealOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollReveal = <T extends HTMLElement = HTMLElement>(
  options: IScrollRevealOptions = {},
) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (isVisible && options.triggerOnce !== false) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.triggerOnce !== false) {
            observer.unobserve(entry.target);
          }
        } else if (options.triggerOnce === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold ?? 0.25,
        rootMargin: options.rootMargin ?? '0px 0px -80px 0px',
      },
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.triggerOnce, isVisible]);

  return { elementRef, isVisible };
};
