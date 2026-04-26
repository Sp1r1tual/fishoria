import { useEffect, useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { prepareWithSegments, measureLineStats } from '@chenglou/pretext';

import { useBottomInfoAnimation } from '@/hooks/ui/useBottomInfoAnimation';
import { useFishController } from '@/hooks/game/useFishController';
import { useScrollReveal } from '@/hooks/ui/useScrollReveal';

import styles from './BottomInfo.module.css';

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 18;
const MIN_WIDTH = 320;
const MAX_WIDTH = 1600;
const FISH_SIZE = 36;
const MAX_LINES = 100;

export const BottomInfo = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.05 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [layout, setLayout] = useState({
    winW: typeof window !== 'undefined' ? window.innerWidth : 1200,
    winH: typeof window !== 'undefined' ? window.innerHeight : 800,
    contW: 0,
  });
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let timer: number;
    let pendingContW = 0;

    const commit = () => {
      setLayout((prev) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (prev.winW === w && prev.winH === h && prev.contW === pendingContW) {
          return prev;
        }
        return { winW: w, winH: h, contW: pendingContW || prev.contW };
      });
    };

    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        pendingContW = entry.contentRect.width;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(commit, 300);
    });
    obs.observe(wrap);

    const handleResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(commit, 300);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      obs.disconnect();
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsLoaded(true));
  }, []);

  const fluidFactor = Math.max(
    0,
    Math.min(1, (layout.winW - MIN_WIDTH) / (MAX_WIDTH - MIN_WIDTH)),
  );

  const fontSize =
    MIN_FONT_SIZE + (MAX_FONT_SIZE - MIN_FONT_SIZE) * fluidFactor;
  const lineH = fontSize * (1.6 + 0.15 * fluidFactor);
  const isMobile = layout.winW < 640;
  const fontStr = `${fontSize}px Nunito, system-ui, sans-serif`;
  const textContent = t('bottomInfo.text');
  const horizontalPad = 6 + 6 * fluidFactor;
  const outerPad = 32 + 32 * fluidFactor;
  const padY = fontSize;

  const prepared = useMemo(() => {
    if (!fontsLoaded) return null;
    return prepareWithSegments(textContent, fontStr);
  }, [textContent, fontStr, fontsLoaded]);

  const availableWidth = Math.max(
    280,
    (layout.contW || layout.winW - outerPad) - horizontalPad * 2,
  );

  const totalHeight = useMemo(() => {
    if (!fontsLoaded || !prepared || !availableWidth) return 400;
    const stats = measureLineStats(prepared, availableWidth);
    const baseH = Math.max(1, stats.lineCount) * lineH;
    return baseH + lineH * 0.5 + padY;
  }, [fontsLoaded, prepared, availableWidth, lineH, padY]);

  const {
    onMouseMove: trackMouse,
    onMouseEnter: spawnFish,
    onMouseLeave: hideFish,
    update: updateFishLogic,
  } = useFishController();

  useBottomInfoAnimation({
    isVisible,
    prepared,
    fontsLoaded,
    canvasRef,
    wrapRef,
    updateFishLogic,
    containerWidth: layout.contW,
    horizontalPad,
    isMobile,
    baseFishSize:
      layout.winH <= 550 && layout.winW > layout.winH ? 22 : FISH_SIZE,
    fontStr,
    lineH,
    padY,
    fontSize,
    maxLines: MAX_LINES,
  });

  return (
    <section
      ref={elementRef}
      className={`${styles.bottomSection} ${isVisible ? styles.visible : ''}`}
      aria-label="Interactive fish animation"
    >
      <div
        ref={wrapRef}
        className={styles.wrap}
        style={
          {
            height: totalHeight,
            '--font-size': `${fontSize}px`,
            '--line-height': `${lineH}px`,
            '--horizontal-pad': `${horizontalPad}px`,
            '--pad-y': `${padY}px`,
          } as React.CSSProperties
        }
        onMouseMove={(e) => {
          const rect = wrapRef.current?.getBoundingClientRect();
          if (rect) trackMouse(e.clientX - rect.left, e.clientY - rect.top);
        }}
        onMouseEnter={(e) => {
          const rect = wrapRef.current?.getBoundingClientRect();
          if (rect) {
            spawnFish(
              e.clientX - rect.left,
              e.clientY - rect.top,
              rect.width,
              rect.height,
            );
          }
        }}
        onMouseLeave={hideFish}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />

        <p className={styles.selectableText}>{textContent}</p>
      </div>
    </section>
  );
};
