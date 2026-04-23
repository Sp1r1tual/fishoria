import { useEffect, useState, useRef } from 'react';

import { GameEvents } from '@/game/engine/GameEvents';

import styles from './OverloadOverlay.module.css';

export function OverloadOverlay() {
  const [isCurrentlyVisible, setIsCurrentlyVisible] = useState(false);

  const isOverloadedRef = useRef(false);
  const isPlayerReelingRef = useRef(false);
  const phaseRef = useRef('idle');
  const hasShownThisBattleRef = useRef(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const updateVisibility = () => {
      const conditionsMet =
        isOverloadedRef.current &&
        phaseRef.current === 'reeling' &&
        !isPlayerReelingRef.current;

      if (conditionsMet && !hasShownThisBattleRef.current) {
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          setIsCurrentlyVisible(true);
        }
      } else if (!conditionsMet && isVisibleRef.current) {
        isVisibleRef.current = false;
        hasShownThisBattleRef.current = true;
        setIsCurrentlyVisible(false);
      }
    };

    const unsubTension = GameEvents.on('tension', (data) => {
      isOverloadedRef.current =
        typeof data !== 'number' ? !!data.isOverloaded : false;
      updateVisibility();
    });

    const unsubPhase = GameEvents.on('phase', (p) => {
      phaseRef.current = p;
      if (p !== 'reeling') {
        isOverloadedRef.current = false;
        hasShownThisBattleRef.current = false;
        isVisibleRef.current = false;
        setIsCurrentlyVisible(false);
      } else {
        updateVisibility();
      }
    });

    const unsubReeling = GameEvents.on('playerReeling', (v) => {
      isPlayerReelingRef.current = v;
      updateVisibility();
    });

    return () => {
      unsubTension();
      unsubPhase();
      unsubReeling();
    };
  }, []);

  if (!isCurrentlyVisible) return null;

  return <div className={styles.overlay} />;
}
