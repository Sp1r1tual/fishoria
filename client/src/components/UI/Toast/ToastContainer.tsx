import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { useDingSound } from '@/hooks/audio/useDingSound';
import type { IPlayerQuest } from '@/common/types/player.types';

import type { IToast } from '@/common/types';

import { removeToast, addToast } from '@/store/slices/uiSlice';
import { usePlayerQuery } from '@/queries/player.queries';

import styles from './Toast.module.css';

export function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const { data: player } = usePlayerQuery();
  const prevAchievements = useRef<typeof player.playerAchievements | undefined>(
    undefined,
  );
  const prevQuests = useRef<typeof player.playerQuests | undefined>(undefined);

  useEffect(() => {
    if (player?.playerAchievements) {
      if (prevAchievements.current) {
        type AchRecord = {
          id: string;
          achievement: {
            title: unknown;
            code: string;
            imageUrl?: string | null;
          };
        };
        const currentIds = player.playerAchievements.map(
          (a: AchRecord) => a.id,
        );

        const prevIds = prevAchievements.current.map((a: AchRecord) => a.id);
        const newIds = currentIds.filter((id: string) => !prevIds.includes(id));

        newIds.forEach((id: string) => {
          const newAch = player.playerAchievements.find(
            (a: AchRecord) => a.id === id,
          );
          if (newAch) {
            const titleObj = newAch.achievement.title as Record<string, string>;
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

import achievementSound from '@/assets/music/achievements.mp3';

function ToastItem({ id, message, type, duration = 3000, imageUrl }: IToast) {
  const dispatch = useAppDispatch();
  const playDing = useDingSound();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      if (type === 'achievement' || type === 'quest') {
        const audio = new Audio(achievementSound);
        audio.play().catch((err) => console.log('Audio playback failed:', err));
      } else {
        playDing();
      }
      isFirstMount.current = false;
    }
  }, [playDing, type]);

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  const typeClass = styles[`toast--${type}`] || styles['toast--info'];

  return (
    <div className={`${styles.toast} ${typeClass} slide-in-top`}>
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
        onClick={() => dispatch(removeToast(id))}
      >
        ×
      </button>
    </div>
  );
}
