import { useEffect, useRef, useState } from 'react';

import {
  useDingSound,
  useAchievementSound,
} from '@/hooks/audio/useSoundEffect';

import type { IToast } from '@/common/types';

import { useAppDispatch } from '@/hooks/core/useAppStore';
import { removeToast } from '@/store/slices/uiSlice';

import styles from './Toast.module.css';

export function ToastItem({
  id,
  message,
  type,
  duration = 3000,
  imageUrl,
}: IToast) {
  const dispatch = useAppDispatch();
  const playDing = useDingSound();
  const playAchievement = useAchievementSound();
  const isFirstMount = useRef(true);

  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isFirstMount.current) {
      if (type === 'achievement' || type === 'quest') {
        playAchievement();
      } else {
        playDing();
      }
      isFirstMount.current = false;
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [playAchievement, playDing, type]);

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleTransitionEnd = () => {
    if (isExiting) {
      dispatch(removeToast(id));
    }
  };

  const typeClass = styles[`toast--${type}`] || styles['toast--info'];
  let stateClass = '';
  if (isExiting) stateClass = styles.toastExiting;
  else if (isVisible) stateClass = styles.toastVisible;

  return (
    <div
      className={`${styles.toast} ${typeClass} ${stateClass}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={styles.toast__icon}>
        {type === 'success' && '✓'}
        {type === 'error' && '⚠️'}
        {type === 'warning' && '⚡'}
        {type === 'info' && 'ⓘ'}
        {type === 'achievement' && imageUrl && (
          <img src={imageUrl} alt="" className={styles.toast__achievementImg} />
        )}
        {type === 'achievement' && !imageUrl && '🏆'}
        {type === 'quest' && imageUrl && (
          <img src={imageUrl} alt="" className={styles.toast__achievementImg} />
        )}
        {type === 'quest' && !imageUrl && '📋'}
      </div>
      <div className={styles.toast__message}>{message}</div>
      <button
        className={styles.toast__close}
        onClick={() => setIsExiting(true)}
      >
        ×
      </button>
    </div>
  );
}
