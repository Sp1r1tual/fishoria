import { useEffect, useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { prepareWithSegments, layout } from '@chenglou/pretext';

import { useBottomInfoAnimation } from './useBottomInfoAnimation';
import { useFishController } from '@/hooks/game/useFishController';
import { useScrollReveal } from '@/hooks/ui/useScrollReveal';

import { FishSVG } from './FishSVG';

import styles from './BottomInfo.module.css';

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 18;
const MIN_WIDTH = 320;
const MAX_WIDTH = 1600;
const FISH_SIZE = 36;
const MIN_SLOT = 50;
const MAX_LINES = 100;

export const BottomInfo = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useScrollReveal({ threshold: 0.05 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fishRef = useRef<SVGSVGElement>(null);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    obs.observe(wrap);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      obs.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsLoaded(true));
  }, []);

  const fluidFactor = Math.max(
    0,
    Math.min(1, (windowWidth - MIN_WIDTH) / (MAX_WIDTH - MIN_WIDTH)),
  );

  const fontSize =
    MIN_FONT_SIZE + (MAX_FONT_SIZE - MIN_FONT_SIZE) * fluidFactor;
  const lineH = fontSize * (1.6 + 0.15 * fluidFactor);
  const isMobile = windowWidth < 640;
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
    (containerWidth || windowWidth - outerPad) - horizontalPad * 2 - 16,
  );

  const totalHeight = useMemo(() => {
    if (!fontsLoaded || !prepared || !availableWidth) return 400;
    const baseH = layout(prepared, availableWidth, lineH).height;
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
    fishRef,
    updateFishLogic,
    containerWidth,
    horizontalPad,
    isMobile,
    baseFishSize: FISH_SIZE,
    fontStr,
    lineH,
    padY,
    fontSize,
    maxLines: MAX_LINES,
    minSlot: MIN_SLOT,
  });

  return (
    <section
      ref={elementRef}
      className={`${styles.bottomSection} ${isVisible ? styles.visible : ''}`}
      style={{ padding: `${outerPad / 2}px` }}
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
        <FishSVG ref={fishRef} idPrefix="bottom_" aria-hidden="true" />
      </div>
    </section>
  );
};
