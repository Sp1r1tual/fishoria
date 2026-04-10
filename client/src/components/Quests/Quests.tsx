import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../UI/ScreenContainer/ScreenContainer';
import { QuestsSkeleton } from './QuestsSkeleton';
import { QuestItem } from './QuestsItem';

import { useQuests } from '@/queries/quest.queries';

import questsIcon from '@/assets/ui/quests.webp';

import styles from './Quests.module.css';

export function Quests() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: rawQuests, isLoading } = useQuests();

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
            {quests.map((pq) => (
              <QuestItem key={pq.id} pq={pq} />
            ))}
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
