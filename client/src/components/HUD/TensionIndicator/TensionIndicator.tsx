import { useEffect, useRef } from 'react';

import { store } from '@/store/store';

import { GameEvents } from '@/game/engine/GameEvents';

import styles from './TensionIndicator.module.css';

export function TensionIndicator({
  debugActive = false,
  isSpinning = false,
}: {
  debugActive?: boolean;
  isSpinning?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tensionBarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentTension = 0;
    let currentBite = 0;
    let currentEscapeProgress = 0;

    const currentState = store.getState();
    let currentPhase = currentState.game.phase;
    let localDebugActive = debugActive;

    let lastDrawnTension = -1;
    let lastDrawnBite = -1;
    let lastDrawnEscape = -1;
    let lastDrawnPhase = '';

    let isOverloaded = false;

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

        if (isOverloaded && currentPhase === 'reeling') {
          wrapRef.current.classList.add(styles['tension__wrap--overloaded']);
        } else {
          wrapRef.current.classList.remove(styles['tension__wrap--overloaded']);
        }
      }

      if (!tensionBarsRef.current) return;

      const hasSignificantTensionChange =
        Math.abs(currentTension - lastDrawnTension) > 0.002 ||
        (currentTension === 0 && lastDrawnTension > 0) ||
        (currentTension > 0 && lastDrawnTension === 0);

      const hasSignificantBiteChange =
        Math.abs(currentBite - lastDrawnBite) > 0.005;
      const hasSignificantEscapeChange =
        Math.abs(currentEscapeProgress - lastDrawnEscape) > 0.5;
      const hasPhaseChanged = currentPhase !== lastDrawnPhase;

      if (
        !hasSignificantTensionChange &&
        !hasSignificantBiteChange &&
        !hasSignificantEscapeChange &&
        !hasPhaseChanged
      ) {
        return;
      }

      lastDrawnTension = currentTension;
      lastDrawnBite = currentBite;
      lastDrawnEscape = currentEscapeProgress;
      lastDrawnPhase = currentPhase;

      const segments = tensionBarsRef.current.children;
      const isReelingOrBite =
        currentPhase === 'bite' || currentPhase === 'reeling';

      const useColorful = isReelingOrBite || currentTension > 0.01;

      if (useColorful) {
        tensionBarsRef.current.classList.add(
          styles['tension__triangle--colorful'],
        );
      } else {
        tensionBarsRef.current.classList.remove(
          styles['tension__triangle--colorful'],
        );
      }

      let fillValue = isReelingOrBite ? currentTension : 0;
      if (currentPhase === 'waiting') {
        if (localDebugActive) {
          fillValue = currentBite;
        }
      }

      for (let i = 0; i < 20; i++) {
        const threshold = i / 20;
        const isActive = threshold + 0.001 < fillValue;
        const el = segments[i] as HTMLDivElement;

        if (el) {
          if (isActive) {
            if (!el.classList.contains(styles['tension__segment--active'])) {
              el.classList.add(styles['tension__segment--active']);
            }
          } else {
            if (el.classList.contains(styles['tension__segment--active'])) {
              el.classList.remove(styles['tension__segment--active']);
            }
          }
        }
      }
    };

    const unsubTension = GameEvents.on('tension', (data) => {
      currentTension = data.value;
      isOverloaded = !!data.isOverloaded;
      currentEscapeProgress = data.escapeProgress || 0;
      updateUI();
    });
    const unsubBite = GameEvents.on('bite', (val) => {
      currentBite = val;
      updateUI();
    });
    const unsubDebug = GameEvents.on('debug', (val) => {
      localDebugActive = val;
      updateUI();
    });
    const unsubPhase = GameEvents.on('phase', (val) => {
      currentPhase = val;
      updateUI();
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
  }, [debugActive, isSpinning]);

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
