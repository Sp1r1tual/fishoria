import { IQuestCondition } from '../../quest/entities/quest.entity';

interface IRawAchievement {
  id: string;
  code: string;
  imageUrl: string | null;
  translations?: { language?: string; title: string; description: string }[];
}

interface IRawPlayerAchievement {
  achievement: IRawAchievement;
}

interface IRawQuest {
  translations: { language: string; title: string; description: string }[];
  conditions: unknown;
}

export const mapPlayerProfile = <
  T extends {
    playerAchievements?: unknown[];
    playerQuests?: unknown[];
    user?: { language?: string | null };
  },
>(
  profile: T | null,
  overrideLang?: string,
) => {
  if (!profile) return null;

  const userLang = overrideLang || profile.user?.language || 'en';

  return {
    ...profile,
    playerAchievements: (
      (profile.playerAchievements as IRawPlayerAchievement[]) || []
    ).map((pa) => {
      const achievement = pa.achievement || {};
      const translations = achievement.translations || [];
      const translation =
        translations.find((t) => t.language === userLang) ||
        translations.find((t) => t.language === 'en') ||
        translations[0];

      return {
        ...pa,
        achievement: {
          ...achievement,
          title: translation?.title || '',
          description: translation?.description || '',
        },
      };
    }),

    playerQuests: (
      (profile.playerQuests as {
        quest: IRawQuest;
      }[]) || []
    ).map((pq) => {
      const quest = pq.quest || ({} as IRawQuest);
      const translations = quest.translations || [];
      const translation =
        translations.find((t) => t.language === userLang) ||
        translations.find((t) => t.language === 'en') ||
        translations[0];

      const title = translation?.title || 'Quest';
      const language = translation?.language || 'en';

      const rawConditions = (quest.conditions as IQuestCondition[]) || [];
      const conditions = rawConditions.map((c) => {
        if (!c) return c;

        const labelObj =
          c.label && typeof c.label === 'object'
            ? (c.label as Record<string, string>)
            : null;

        const label = labelObj
          ? labelObj[language] || labelObj['en'] || ''
          : (c.label as string) || '';

        return { ...c, label };
      });

      return {
        ...pq,
        quest: {
          ...quest,
          title,
          description: translation?.description || '',
          conditions,
        },
      };
    }),
  };
};
