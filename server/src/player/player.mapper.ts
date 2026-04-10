interface RawAchievement {
  id: string;
  code: string;
  imageUrl: string | null;
  translations?: { title: string; description: string }[];
}

interface RawPlayerAchievement {
  achievement: RawAchievement;
}

interface QuestCondition {
  id: string;
  type: string;
  value: string;
  target: number;
  label: string | Record<string, string>;
  lakeId?: string;
}

interface RawQuest {
  translations: { language: string; title: string; description: string }[];
  conditions: unknown;
}

export const mapPlayerProfile = <
  T extends { playerAchievements?: unknown[]; playerQuests?: unknown[] },
>(
  profile: T | null,
) => {
  if (!profile) return null;

  return {
    ...profile,
    playerAchievements: (
      (profile.playerAchievements as RawPlayerAchievement[]) || []
    ).map((pa) => {
      const achievement = pa.achievement || {};
      const translation = achievement.translations?.[0];

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
        quest: RawQuest;
      }[]) || []
    ).map((pq) => {
      const quest = pq.quest || ({} as RawQuest);
      const translation = quest.translations?.[0];
      const title = translation?.title || 'Quest';
      const language = translation?.language || 'en';

      const rawConditions = (quest.conditions as QuestCondition[]) || [];
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
