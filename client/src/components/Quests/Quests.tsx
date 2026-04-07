import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useQuests, useClaimQuestReward } from '@/queries/quest.queries';
import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';
import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';
import { QuestsSkeleton } from './QuestsSkeleton';

import questsIcon from '@/assets/ui/quests.webp';
import coinIcon from '@/assets/ui/coin.webp';

import styles from './Quests.module.css';

export function Quests() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: rawQuests, isLoading } = useQuests();
  const claimMutation = useClaimQuestReward();

  const quests = rawQuests
    ? [...rawQuests].sort((a, b) => a.quest.order - b.quest.order)
    : [];

  return (
    <ScreenContainer
      title={t('quests.title')}
      titleIcon={questsIcon}
      onBack={() => navigate('/')}
      className={styles.quests}
    >
      <section className={styles['quests__content']}>
        {isLoading || !quests ? (
          <QuestsSkeleton />
        ) : quests.length > 0 ? (
          <div className={`${styles.quest_list} fade-in`}>
            {quests.map((pq) => {
              const quest = pq.quest;
              const isClaimed = pq.isClaimed;
              const isCompleted = pq.isCompleted;

              return (
                <article
                  key={pq.id}
                  className={`glass ${styles.quest_card} ${
                    isCompleted && !isClaimed
                      ? styles['quest_card--completed']
                      : ''
                  }`}
                >
                  <div className={styles.quest_card__header}>
                    {quest.imageUrl && (
                      <SkeletonImage
                        src={quest.imageUrl}
                        alt=""
                        wrapperClassName={styles.quest_card__image}
                      />
                    )}
                    <div className={styles.quest_card__info}>
                      <h3 className={styles.quest_card__title}>
                        {quest.title}
                      </h3>
                      <p className={styles.quest_card__desc}>
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  <div className={styles.quest_card__conditions}>
                    {(quest.conditions || []).map((cond) => {
                      const current = pq.progress[cond.id] || 0;
                      const target = cond.target;
                      const percent = Math.min(100, (current / target) * 100);

                      return (
                        <div key={cond.id} className={styles.quest_condition}>
                          <div className={styles.quest_condition__label}>
                            <span>{cond.label}</span>
                            <span className={styles.quest_condition__target}>
                              {current} / {target}
                            </span>
                          </div>
                          <div className={styles.progress_bar}>
                            <div
                              className={`${styles.progress_fill} ${
                                current >= target
                                  ? styles['progress_fill--completed']
                                  : ''
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.quest_card__footer}>
                    <div className={styles.quest_card__rewards}>
                      {quest.moneyReward > 0 && (
                        <div
                          className={`${styles.reward_item} ${styles.money}`}
                        >
                          <img
                            src={coinIcon}
                            alt=""
                            className={styles.reward_icon}
                          />
                          <span>{quest.moneyReward}</span>
                        </div>
                      )}
                      {quest.xpReward > 0 && (
                        <div className={`${styles.reward_item} ${styles.xp}`}>
                          <span>+{quest.xpReward} XP</span>
                        </div>
                      )}
                    </div>

                    {isClaimed ? (
                      <div className={styles.claimed_badge}>
                        <span>✓ {t('quests.claimed')}</span>
                      </div>
                    ) : (
                      <WoodyButton
                        variant="green"
                        size="sm"
                        disabled={!isCompleted || claimMutation.isPending}
                        onClick={() => claimMutation.mutate(pq.id)}
                        label={
                          claimMutation.isPending
                            ? t('common.processing')
                            : isCompleted
                              ? t('quests.claim')
                              : t('quests.inProgress')
                        }
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <article className={`glass ${styles['quests__card']} fade-in`}>
            <p>{t('quests.noAvailable')}</p>
          </article>
        )}
      </section>
    </ScreenContainer>
  );
}
