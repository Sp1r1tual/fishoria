import { useEffect, useRef } from 'react';

import { store } from '@/store';

import styles from './TensionIndicator.module.css';

export function TensionIndicator({
  debugActive = false,
}: {
  debugActive?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tensionBarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentTension = 0;
    let currentBite = 0;

    const currentState = store.getState();
    let currentPhase = currentState.game.phase;
    let localDebugActive = debugActive;

    let lastDrawnTension = -1;
    let lastDrawnBite = -1;
    let lastDrawnPhase = '';

    const updateUI = () => {
      if (wrapRef.current) {
        if (
          currentPhase === 'waiting' ||
          currentPhase === 'bite' ||
          currentPhase === 'reeling'
        ) {
          wrapRef.current.classList.add(styles['tension__wrap--visible']);
        } else {
          wrapRef.current.classList.remove(styles['tension__wrap--visible']);
        }
      }

      if (!tensionBarsRef.current) return;

      if (
        Math.abs(currentTension - lastDrawnTension) < 0.005 &&
        Math.abs(currentBite - lastDrawnBite) < 0.005 &&
        currentPhase === lastDrawnPhase
      ) {
        return;
      }

      lastDrawnTension = currentTension;
      lastDrawnBite = currentBite;
      lastDrawnPhase = currentPhase;

      const segments = tensionBarsRef.current.children;
      const isReelingOrBite =
        currentPhase === 'bite' || currentPhase === 'reeling';

      // Always show colorful scale if tension is > 0 OR if we are in bite/reeling phases
      const useColorful = isReelingOrBite || currentTension > 0.01;

      let fillValue = isReelingOrBite ? currentTension : 0;
      if (currentPhase === 'waiting' && localDebugActive) {
        fillValue = currentBite;
      }

      for (let i = 0; i < 20; i++) {
        const threshold = i / 20;
        const isActive = threshold < fillValue;
        const el = segments[i] as HTMLDivElement;

        if (el) {
          if (isActive) {
            el.classList.add(styles['tension__segment--active']);
          } else {
            el.classList.remove(styles['tension__segment--active']);
          }

          const bgColor = !useColorful
            ? '#60a5fa'
            : i < 8
              ? '#4ade80'
              : i < 14
                ? '#fbbf24'
                : '#ef4444';

          el.style.backgroundColor = bgColor;
          // Sync color with background-color to fix currentColor issues in CSS
          el.style.color = bgColor;
        }
      }
    };

    let unsubTension: () => void;
    let unsubBite: () => void;
    let unsubDebug: () => void;
    let unsubPhase: () => void;

    import('@/game/engine/GameEvents').then(({ GameEvents }) => {
      unsubTension = GameEvents.on('tension', (val) => {
        currentTension = val;
        updateUI();
      });
      unsubBite = GameEvents.on('bite', (val) => {
        currentBite = val;
        updateUI();
      });
      unsubDebug = GameEvents.on('debug', (val) => {
        localDebugActive = val;
        updateUI();
      });
      unsubPhase = GameEvents.on('phase', (val) => {
        currentPhase = val;
        updateUI();
      });
    });

    const unsubStore = store.subscribe(() => {
      const newState = store.getState();
      if (newState.game.phase !== currentPhase) {
        currentPhase = newState.game.phase;
        updateUI();
      }
    });

    updateUI();

    return () => {
      if (unsubTension) unsubTension();
      if (unsubBite) unsubBite();
      if (unsubDebug) unsubDebug();
      if (unsubPhase) unsubPhase();
      unsubStore();
    };
  }, [debugActive]);

  return (
    <div className={styles['tension__wrap']} ref={wrapRef}>
      <div className={styles['tension__triangle']} ref={tensionBarsRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles['tension__segment']}
            style={{
              height: `${(i + 1) * 5}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
