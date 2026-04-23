import { useEffect, useRef, useState } from 'react';

import { store } from '@/store/store';

import { GameEvents } from '@/game/engine/GameEvents';

import styles from './LureDepthIndicator.module.css';

export function LureDepthIndicator({ shifted = false }: { shifted?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<'left' | 'right'>('right');

  const [isVisible, setIsVisible] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');

  const stateRef = useRef({
    currentDepth: 0,
    targetDepth: 0,
    currentGroundDepth: 0,
    targetGroundDepth: 0,
    currentPhase: store.getState().game.phase,
    isVisible: false,
    isInitialized: false,
  });

  useEffect(() => {
    const updateUI = () => {
      const s = stateRef.current;
      const activePhases = ['waiting', 'bite', 'reeling'];
      const shouldBeVisible =
        activePhases.includes(s.currentPhase) && s.targetGroundDepth > 0;

      if (s.isVisible !== shouldBeVisible) {
        s.isVisible = shouldBeVisible;
        setIsVisible(shouldBeVisible);
      }

      if (!shouldBeVisible) return;

      const lerpFactor = 0.25;
      s.currentDepth += (s.targetDepth - s.currentDepth) * lerpFactor;
      s.currentGroundDepth +=
        (s.targetGroundDepth - s.currentGroundDepth) * lerpFactor;

      if (arrowRef.current && s.currentGroundDepth > 0.01) {
        let percentage = (s.currentDepth / s.currentGroundDepth) * 100;

        if (percentage > 99.8) percentage = 100;
        percentage = Math.min(100, Math.max(0, percentage));

        arrowRef.current.style.bottom = `${100 - percentage}%`;
      }
    };

    const unsubLureDepth = GameEvents.on('lureDepth', (data) => {
      const s = stateRef.current;

      if (!s.isInitialized && data.groundDepth > 0) {
        s.currentDepth = data.depth;
        s.currentGroundDepth = data.groundDepth;
        s.isInitialized = true;
      }

      s.targetDepth = data.depth;
      s.targetGroundDepth = data.groundDepth;

      if (data.x !== undefined && data.canvasWidth !== undefined) {
        const x = data.x;
        const W = data.canvasWidth;
        const margin = 80;

        if (sideRef.current === 'right') {
          const indicatorRightEdge = shifted ? 140 : 65;
          if (x > W - indicatorRightEdge - margin) {
            sideRef.current = 'left';
            setSide('left');
          }
        } else {
          const indicatorRightEdge = shifted ? 140 : 65;
          if (x < W - indicatorRightEdge - margin - 50) {
            sideRef.current = 'right';
            setSide('right');
          }
        }
      }
    });

    const unsubPhase = GameEvents.on('phase', (val) => {
      stateRef.current.currentPhase = val;
    });

    const unsubStore = store.subscribe(() => {
      stateRef.current.currentPhase = store.getState().game.phase;
    });

    let rafId: number;
    const tick = () => {
      updateUI();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      unsubLureDepth();
      unsubPhase();
      unsubStore();
      cancelAnimationFrame(rafId);
    };
  }, [shifted]);

  if (!isVisible) return null;

  const combinedClass = [
    styles['depth-indicator'],
    styles[`depth-indicator--${side}`],
    side === 'right' && shifted ? styles['depth-indicator--shifted'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={combinedClass} ref={wrapRef}>
      <div className={styles['depth-indicator__scale']}>
        <div className={styles['depth-indicator__track']}>
          <div className={styles['depth-indicator__line']} ref={arrowRef} />
        </div>
      </div>
    </div>
  );
}
