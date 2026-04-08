interface RawAchievement {
  id: string;
  code: string;
  imageUrl: string | null;
  translations?: { title: string; description: string }[];
}

interface RawPlayerAchievement {
  achievement: RawAchievement;
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
        quest: { translations: { language: string; title: string }[] };
      }[]) || []
    ).map((pq) => {
      const quest = pq.quest || {};
      const translation = quest.translations?.[0];
      const title = translation?.title || 'Quest';

      return {
        ...pq,
        quest: {
          ...quest,
          title,
        },
      };
    }),
  };
};
