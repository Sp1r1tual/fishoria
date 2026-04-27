import { useRef, useLayoutEffect } from 'react';

import styles from '@/components/LakeSelect/LakeSelect.module.css';

export function useLakeCardAnimations() {
  const descRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const expandedIdRef = useRef<string | null>(null);

  const collapseTimeouts = useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});
  const expandTimeouts = useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});

  const collapse = (id: string, isInstant = false) => {
    const p = descRefs.current[id];
    const preview = previewRefs.current[id];
    const card = cardRefs.current[id];

    if (!p || !preview || !card) return;

    if (isInstant) {
      const cTimeout = collapseTimeouts.current[id];
      if (cTimeout) clearTimeout(cTimeout);
      const eTimeout = expandTimeouts.current[id];
      if (eTimeout) clearTimeout(eTimeout);

      p.style.transition = 'none';
      preview.style.transition = 'none';

      p.style.maxHeight = '';
      p.style.overflowY = '';
      p.style.webkitLineClamp = '2';
      (p.style as CSSStyleDeclaration & { lineClamp: string }).lineClamp = '2';
      preview.style.height = '';
      card.style.height = '';
      card.classList.remove(styles['is-expanded']);

      void p.offsetHeight;
      p.style.transition = '';
      preview.style.transition = '';

      delete collapseTimeouts.current[id];
      return;
    }

    p.style.maxHeight = '40px';
    p.style.overflowY = 'hidden';
    preview.style.height = '';

    const cTimeout = collapseTimeouts.current[id];
    if (cTimeout) clearTimeout(cTimeout);
    const eTimeout = expandTimeouts.current[id];
    if (eTimeout) clearTimeout(eTimeout);

    collapseTimeouts.current[id] = setTimeout(() => {
      const currentP = descRefs.current[id];
      const currentCard = cardRefs.current[id];
      if (currentP) {
        currentP.style.maxHeight = '';
        currentP.style.webkitLineClamp = '2';
        (
          currentP.style as CSSStyleDeclaration & { lineClamp: string }
        ).lineClamp = '2';
      }
      if (currentCard) {
        currentCard.style.height = '';
        currentCard.classList.remove(styles['is-expanded']);
      }
      delete collapseTimeouts.current[id];
    }, 300);
  };

  const expand = (id: string) => {
    const card = cardRefs.current[id];
    const p = descRefs.current[id];
    const preview = previewRefs.current[id];

    if (!p || !card || !preview) return;

    const cTimeout = collapseTimeouts.current[id];
    if (cTimeout) {
      clearTimeout(cTimeout);
      delete collapseTimeouts.current[id];
    }

    card.style.height = `${card.offsetHeight}px`;
    card.classList.add(styles['is-expanded']);

    const startHeight = p.clientHeight;
    p.style.maxHeight = `${startHeight}px`;
    p.style.webkitLineClamp = 'unset';
    (p.style as CSSStyleDeclaration & { lineClamp: string }).lineClamp =
      'unset';

    const fullHeight = p.scrollHeight;
    void p.offsetHeight;

    const isSmallHeight = window.innerHeight < 500;
    const isSmallWidth = window.innerWidth < 600;

    const targetHeight = isSmallHeight
      ? '40px'
      : isSmallWidth
        ? '90px'
        : '70px';

    preview.style.height = targetHeight;
    p.style.maxHeight = `${fullHeight}px`;

    const eTimeout = expandTimeouts.current[id];
    if (eTimeout) clearTimeout(eTimeout);

    expandTimeouts.current[id] = setTimeout(() => {
      const currentP = descRefs.current[id];
      if (currentP) currentP.style.overflowY = 'auto';
      expandTimeouts.current[id] = null;
    }, 300);
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      if (expandedIdRef.current) {
        collapse(expandedIdRef.current, true);
        expandedIdRef.current = null;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleDescClick = (lakeId: string) => {
    if (expandedIdRef.current === lakeId) {
      collapse(lakeId);
      expandedIdRef.current = null;
    } else {
      if (expandedIdRef.current) {
        collapse(expandedIdRef.current);
      }
      expand(lakeId);
      expandedIdRef.current = lakeId;
    }
  };

  return {
    descRefs,
    previewRefs,
    cardRefs,
    handleDescClick,
  };
}
