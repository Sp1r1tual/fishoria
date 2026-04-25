import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useClickSound } from '@/hooks/audio/useSoundEffect';

import { UniversalModal } from '../modals/UniversalModal/UniversalModal';
import { WoodyButton } from '../buttons/WoodyButton/WoodyButton';

import gearFail from '@/assets/ui/gear_fail.webp';
import gearSuccess from '@/assets/ui/gear_success.webp';

import styles from './SnagMinigame.module.css';

interface Props {
  onComplete: (success: boolean) => void;
}

export function SnagMinigame({ onComplete }: Props) {
  const { t } = useTranslation();
  const [hits, setHits] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const targetWidth = 0.3;
  const [targetPos, setTargetPos] = useState(0.5);

  const requestRef = useRef<number>(0);
  const speedRef = useRef(0.6);
  const markerPosRef = useRef(0);
  const markerDomRef = useRef<HTMLDivElement>(null);

  const hitsRef = useRef(hits);
  const targetPosRef = useRef(targetPos);
  const isGameOverRef = useRef(isGameOver);

  useEffect(() => {
    hitsRef.current = hits;
    targetPosRef.current = targetPos;
    isGameOverRef.current = isGameOver;
  }, [hits, targetPos, isGameOver]);

  const playClick = useClickSound();

  useEffect(() => {
    let lastTime = 0;
    const update = (time: number) => {
      if (lastTime !== 0) {
        const deltaTime = (time - lastTime) / 1000;
        let next = markerPosRef.current + speedRef.current * deltaTime;
        if (next > 1) {
          next = 1;
          speedRef.current *= -1;
        } else if (next < 0) {
          next = 0;
          speedRef.current *= -1;
        }
        markerPosRef.current = next;
        if (markerDomRef.current) {
          markerDomRef.current.style.left = `${next * 100}%`;
        }
      }
      lastTime = time;
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleAction = useCallback(() => {
    if (isGameOverRef.current) return;
    playClick();

    const isInTarget =
      Math.abs(markerPosRef.current - targetPosRef.current) < targetWidth / 2;

    if (isInTarget) {
      const nextHits = hitsRef.current + 1;
      setHits(nextHits);
      setTargetPos(0.2 + Math.random() * 0.6);

      if (nextHits >= 2) {
        setIsWon(true);
        setIsGameOver(true);
        setTimeout(() => onComplete(true), 1200);
      }
    } else {
      setIsWon(false);
      setIsGameOver(true);
      setTimeout(() => onComplete(false), 1200);
    }
  }, [onComplete, playClick]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  return (
    <UniversalModal
      isOpen={true}
      type="warning"
      title={t('snag.title')}
      description={t('snag.description')}
      actions={
        <WoodyButton
          variant={isGameOver ? 'brown' : 'green'}
          size="md"
          className={styles.actionBtn}
          onClick={handleAction}
          disabled={isGameOver}
          label={
            isGameOver
              ? isWon
                ? t('snag.success')
                : t('snag.fail')
              : t('snag.pullBtn')
          }
        />
      }
    >
      <div
        className={`${styles.minigame} ${isGameOver ? (isWon ? styles.win : styles.lose) : ''}`}
      >
        {!isGameOver && (
          <div className={styles.hits}>
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`${styles.hitDot} ${hits > i ? styles.hitActive : ''}`}
              />
            ))}
          </div>
        )}

        {!isGameOver && (
          <div className={styles.bar}>
            <div
              className={styles.target}
              style={{
                left: `${(targetPos - targetWidth / 2) * 100}%`,
                width: `${targetWidth * 100}%`,
              }}
            />
            <div
              ref={markerDomRef}
              className={styles.marker}
              style={{ left: '0%' }}
            />
          </div>
        )}

        {isGameOver && (
          <div
            className={`${styles.resultMessage} ${isWon ? styles.resWin : styles.resLose}`}
          >
            <img
              src={isWon ? gearSuccess : gearFail}
              alt={isWon ? 'success' : 'fail'}
              className={styles.resultImage}
            />
          </div>
        )}
      </div>
    </UniversalModal>
  );
}
