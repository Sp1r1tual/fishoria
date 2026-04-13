import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '@/components/UI/ScreenContainer/ScreenContainer';
import { SkeletonImage } from '@/components/UI/skeletons/SkeletonImage/SkeletonImage';
import { AchievementsSkeleton } from './AchievementsSkeleton';

import { usePlayerQuery } from '@/queries/player.queries';
import { useAchievements } from '@/queries/achievement.queries';

import achievementsIcon from '@/assets/ui/achievements.webp';

import styles from './Achievements.module.css';

export function Achievements() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: allAchievements, isLoading: isAchLoading } = useAchievements();
  const { data: player, isLoading: isPlayerLoading } = usePlayerQuery();

  const isLoading = isAchLoading || isPlayerLoading;

  const playerAchIds = new Set(
    (player?.playerAchievements || []).map(
      (pa: { achievementId: string }) => pa.achievementId,
    ),
  );

  const achievements = allAchievements
    ? [...allAchievements].sort((a, b) => a.order - b.order)
    : [];

  return (
    <ScreenContainer
      title={t('achievements.title', 'Achievements')}
      titleIcon={achievementsIcon}
      onBack={() => navigate('/')}
      className={styles.achievements}
    >
      <section className={styles['achievements__content']}>
        {isLoading ? (
          <AchievementsSkeleton />
        ) : achievements && achievements.length > 0 ? (
          <div className={`${styles.achievement_list} fade-in`}>
            {achievements.map(
              (ach: {
                id: string;
                title: string;
                description: string;
                imageUrl: string;
                order: number;
              }) => {
                const isCompleted = playerAchIds.has(ach.id);

                return (
                  <article
                    key={ach.id}
                    className={`glass ${styles.achievement_card} ${
                      isCompleted ? styles['achievement_card--completed'] : ''
                    }`}
                  >
                    <div className={styles.achievement_card__header}>
                      {ach.imageUrl && (
                        <SkeletonImage
                          src={ach.imageUrl}
                          alt=""
                          wrapperClassName={styles.achievement_card__image}
                        />
                      )}
                      <div className={styles.achievement_card__info}>
                        <h3 className={styles.achievement_card__title}>
                          {ach.title}
                        </h3>
                        <p className={styles.achievement_card__desc}>
                          {ach.description}
                        </p>
                      </div>
                    </div>

                    <div className={styles.achievement_card__footer}>
                      {isCompleted ? (
                        <div className={styles.claimed_badge}>
                          <span>✓ {t('achievements.completed')}</span>
                        </div>
                      ) : (
                        <div className={styles.locked_badge}>
                          <span>{t('achievements.locked')}</span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <article className={`glass fade-in ${styles.empty_state}`}>
            <p>{t('achievements.empty')}</p>
          </article>
        )}
      </section>
    </ScreenContainer>
  );
}
