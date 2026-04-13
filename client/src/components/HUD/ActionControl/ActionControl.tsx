import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/hooks/core/useAppStore';

import type { LakeScene } from '@/game/engine/scenes/LakeScene';
import { GameEvents } from '@/game/engine/GameEvents';

import reelIcon from '@/assets/ui/reel.webp';
import extractIcon from '@/assets/ui/extract.webp';

import styles from './ActionControl.module.css';

interface IActionControlProps {
  sceneRef: React.RefObject<LakeScene | null>;
  isSpinningRod: boolean;
  localDebugActive: boolean;
}

export const ActionControl = React.memo(function ActionControl({
  sceneRef,
  isSpinningRod,
  localDebugActive,
}: IActionControlProps) {
  const { t } = useTranslation();
  const reelBtnRef = useRef<HTMLDivElement>(null);
  const phase = useAppSelector((s) => s.game.phase);

  useEffect(() => {
    let currentTension = 0;
    let currentBite = 0;

    let lastDrawnTension = -1;
    let lastDrawnBite = -1;

    const updateReelBtn = (tensionValue: number, biteValue: number) => {
      const isSpecialPhase = phase !== 'waiting' && phase !== 'reeling';

      if (
        !isSpecialPhase &&
        Math.abs(tensionValue - lastDrawnTension) < 0.02 &&
        Math.abs(biteValue - lastDrawnBite) < 0.02
      ) {
        return;
      }

      lastDrawnTension = tensionValue;
      lastDrawnBite = biteValue;

      if (!reelBtnRef.current) return;
      let bg = 'white';
      let border = '#6b4d32';
      let glow = 'none';

      if (phase === 'waiting') {
        if (localDebugActive)
          bg = `rgb(${255 - biteValue * 95}, ${255 - biteValue * 90}, 255)`;

        if (isSpinningRod) {
          if (biteValue > 0.05) {
            reelBtnRef.current.classList.add(
              styles['action__reel-btn--interest-pulse'],
            );
            border = '#fbbf24';
            glow = `0 0 ${8 + biteValue * 12}px rgba(251, 191, 36, ${0.3 + biteValue * 0.4})`;
          } else {
            reelBtnRef.current.classList.remove(
              styles['action__reel-btn--interest-pulse'],
            );
          }
        }
      } else if (phase === 'reeling') {
        const color =
          tensionValue < 0.4
            ? '#4ade80'
            : tensionValue < 0.7
              ? '#fbbf24'
              : '#ef4444';

        bg = color;
        border = color;
        glow = `0 0 ${10 + tensionValue * 10}px ${color}`;

        reelBtnRef.current.classList.remove(
          styles['action__reel-btn--interest-pulse'],
        );
      } else if (phase === 'bite') {
        bg = '#ef4444';
        border = '#450a0a';
        glow = '0 0 15px #ef4444';
      } else {
        bg = 'white';
        border = '#6b4d32';
        glow = 'none';
        reelBtnRef.current.classList.remove(
          styles['action__reel-btn--interest-pulse'],
        );
      }

      if (reelBtnRef.current) {
        reelBtnRef.current.style.backgroundColor = bg;
        reelBtnRef.current.style.borderColor = border;
        reelBtnRef.current.style.boxShadow = glow;
        reelBtnRef.current.style.setProperty(
          '--pulse-speed',
          `${2.0 - biteValue * 1.65}s`,
        );
      }
    };

    updateReelBtn(0, 0);

    const unsubTension = GameEvents.on('tension', (val: number) => {
      currentTension = val;
      updateReelBtn(currentTension, currentBite);
    });

    const unsubBite = GameEvents.on('bite', (val: number) => {
      currentBite = val;
      updateReelBtn(currentTension, currentBite);
    });

    const unsubDebug = GameEvents.on('debug', () => {
      // Re-trigger update if debug changes within same mount
      updateReelBtn(currentTension, currentBite);
    });

    return () => {
      if (unsubTension) unsubTension();
      if (unsubBite) unsubBite();
      if (unsubDebug) unsubDebug();
    };
  }, [phase, localDebugActive, isSpinningRod]);

  const handleHookFish = () => sceneRef.current?.hookFishExternal();
  const handleReel = (on: boolean) => sceneRef.current?.setPlayerReeling(on);
  const handleCancelCast = () => sceneRef.current?.resetCast();

  return (
    <>
      <div className={styles['action__slot']}>
        <div
          ref={reelBtnRef}
          role="button"
          className={[
            styles['action__slot-circle'],
            styles['action__reel-btn'],
            phase === 'reeling' ? styles['action__reel-btn--active'] : '',
            phase === 'bite' ? styles['action__reel-btn--pulse'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ '--pulse-speed': '2s' } as React.CSSProperties}
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (phase === 'reeling') handleReel(true);
            else if (phase === 'bite') {
              handleHookFish();
              handleReel(true);
            } else if (phase === 'waiting') {
              if (isSpinningRod) handleReel(true);
              else handleHookFish();
            }
          }}
          onPointerUp={() => handleReel(false)}
          onPointerLeave={() => handleReel(false)}
          onPointerCancel={() => handleReel(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <img
            src={reelIcon}
            alt="reel"
            className={[
              styles['action__reel-icon'],
              styles['action__slot-icon'],
            ].join(' ')}
          />
        </div>
      </div>

      <div
        className={[
          styles['action__extract-container'],
          phase === 'waiting' || phase === 'bite' || phase === 'reeling'
            ? styles['action__extract-container--visible']
            : '',
        ].join(' ')}
      >
        <div className={styles['action__slot']}>
          <div
            className={styles['action__slot-circle']}
            role="button"
            onClick={handleCancelCast}
            title={t('hud.extract')}
          >
            <img
              src={extractIcon}
              alt="extract"
              className={styles['action__slot-icon']}
            />
          </div>
        </div>
      </div>
    </>
  );
});
