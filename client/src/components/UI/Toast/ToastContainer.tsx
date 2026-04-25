import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import type {
  IPlayerProfile,
  IPlayerQuest,
  IPlayerAchievement,
} from '@/common/types';

import { ToastItem } from './ToastItem';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { addToast } from '@/store/slices/uiSlice';
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
            const translatedTitle = titleObj || newAch.achievement.code;

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

  const portalRoot = document.getElementById('portal-root');

  const content = (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );

  if (!portalRoot) return content;

  return createPortal(content, portalRoot);
}
