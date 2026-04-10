import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  IPlayerQuest,
  IQuestCondition,
} from '@/common/types/player.types';

import { ExpandButton } from '../UI/ExpandButton/ExpandButton';
import { SkeletonImage } from '../UI/skeletons/SkeletonImage/SkeletonImage';
import { WoodyButton } from '../UI/buttons/WoodyButton/WoodyButton';

import { useClaimQuestReward } from '@/queries/quest.queries';

import coinIcon from '@/assets/ui/coin.webp';

import styles from './Quests.module.css';

export function QuestItem({ pq }: { pq: IPlayerQuest }) {
  const { t } = useTranslation();
  const claimMutation = useClaimQuestReward();
  const [isExpanded, setIsExpanded] = useState(false);

  const quest = pq.quest;
  const isClaimed = pq.isClaimed;
  const isCompleted = pq.isCompleted;

  const conditions = quest.conditions || [];
  const multipleConditions = conditions.length > 1;
  const completedConditionsCount = conditions.filter(
    (cond: IQuestCondition) => (pq.progress[cond.id] || 0) >= cond.target,
  ).length;
  const overallPercent =
    conditions.length > 0
      ? (completedConditionsCount / conditions.length) * 100
      : 0;

  return (
    <article
      className={`glass ${styles.quest_card} ${
        isCompleted && !isClaimed ? styles['quest_card--completed'] : ''
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
          <h3 className={styles.quest_card__title}>{quest.title}</h3>
          <p className={styles.quest_card__desc}>{quest.description}</p>
        </div>
      </div>

      <div className={styles.quest_card__conditions}>
        {multipleConditions ? (
          <>
            <div
              className={`${styles.quest_condition} ${styles['quest_condition--toggle']}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className={styles.quest_condition__label}>
                <span>{t('quests.progress', 'Progress')}</span>
                <span className={styles.quest_condition__target}>
                  {completedConditionsCount} / {conditions.length}
                  <ExpandButton isExpanded={isExpanded} />
                </span>
              </div>
              <div className={styles.progress_bar}>
                <div
                  className={`${styles.progress_fill} ${
                    completedConditionsCount >= conditions.length
                      ? styles['progress_fill--completed']
                      : ''
                  }`}
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>
            <div
              className={`${styles.quest_card__subconditions} ${isExpanded ? styles['quest_card__subconditions--open'] : ''}`}
            >
              {conditions.map((cond: IQuestCondition) => {
                const current = pq.progress[cond.id] || 0;
                const target = cond.target;
                const percent = Math.min(100, (current / target) * 100);

                return (
                  <div key={cond.id} className={styles.quest_subcondition}>
                    <div className={styles.quest_condition__label}>
                      <span>{cond.label}</span>
                      <span className={styles.quest_condition__target}>
                        {current} / {target}
                      </span>
                    </div>
                    <div className={styles.progress_bar_sm}>
                      <div
                        className={`${styles.progress_fill_sm} ${
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
          </>
        ) : (
          conditions.map((cond: IQuestCondition) => {
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
          })
        )}
      </div>

      <div className={styles.quest_card__footer}>
        <div className={styles.quest_card__rewards}>
          {quest.moneyReward > 0 && (
            <div className={`${styles.reward_item} ${styles.money}`}>
              <img src={coinIcon} alt="" className={styles.reward_icon} />
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
}
