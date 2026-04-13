import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { useDingSound } from '@/hooks/audio/useSoundEffect';
import type {
  IPlayerProfile,
  IPlayerQuest,
  IPlayerAchievement,
} from '@/common/types/player.types';

import type { IToast } from '@/common/types';

import { removeToast, addToast } from '@/store/slices/uiSlice';
import { usePlayerQuery } from '@/queries/player.queries';

import styles from './Toast.module.css';

export function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const { data: player } = usePlayerQuery();
  const prevAchievements = useRef<
    IPlayerProfile['playerAchievements'] | undefined
  >(undefined);
  const prevQuests = useRef<IPlayerQuest[] | undefined>(undefined);

  useEffect(() => {
    if (player?.playerAchievements) {
      if (prevAchievements.current) {
        const currentIds =
          player?.playerAchievements?.map((a: IPlayerAchievement) => a.id) ||
          [];

        const prevIds =
          prevAchievements.current?.map((a: IPlayerAchievement) => a.id) || [];
        const newIds = currentIds.filter((id: string) => !prevIds.includes(id));

        newIds.forEach((id: string) => {
          const newAch = player?.playerAchievements?.find(
            (a: IPlayerAchievement) => a.id === id,
          );
          if (newAch) {
            const titleObj = newAch.achievement.title;
            const lang = i18n.language.split('-')[0];
            const translatedTitle =
              titleObj?.[lang] ||
              titleObj?.[i18n.language] ||
              titleObj?.uk ||
              titleObj?.en ||
              newAch.achievement.code;

            dispatch(
              addToast({
                message: `${t('achievements.notification', 'Achievement unlocked!')} ${translatedTitle}`,
                type: 'achievement',
                duration: 5000,
                imageUrl: newAch.achievement.imageUrl || undefined,
              }),
            );
          }
        });
      }
      prevAchievements.current = player.playerAchievements;
    }
  }, [player?.playerAchievements, dispatch, t, i18n.language]);

  useEffect(() => {
    if (player?.playerQuests) {
      if (prevQuests.current) {
        const currentCompleted = player.playerQuests.filter(
          (q: IPlayerQuest) => q.isCompleted,
        );
        const prevCompletedIds = prevQuests.current
          .filter((q: IPlayerQuest) => q.isCompleted)
          .map((q: IPlayerQuest) => q.id);

        const newCompleted = currentCompleted.filter(
          (q: IPlayerQuest) => !prevCompletedIds.includes(q.id),
        );

        newCompleted.forEach((pq: IPlayerQuest) => {
          dispatch(
            addToast({
              message: `${t('quests.notification', 'Quest completed!')} ${pq.quest.title}`,
              type: 'quest',
              duration: 5000,
              imageUrl: pq.quest.imageUrl || undefined,
            }),
          );
        });
      }
      prevQuests.current = player.playerQuests;
    }
  }, [player?.playerQuests, dispatch, t]);

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}

import { useAchievementSound } from '@/hooks/audio/useSoundEffect';

function ToastItem({ id, message, type, duration = 3000, imageUrl }: IToast) {
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
