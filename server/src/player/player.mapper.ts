interface AchievementTranslation {
  language: string;
  title: string;
  description: string;
}

interface RawAchievement {
  id: string;
  code: string;
  imageUrl: string | null;
  translations?: AchievementTranslation[];
}

interface RawPlayerAchievement {
  achievement: RawAchievement;
}

interface RawProfile {
  id: string;
  playerAchievements: RawPlayerAchievement[];
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
      const { translations, ...achievement } = pa.achievement || {};

      const title: Record<string, string> = {};
      const description: Record<string, string> = {};

      if (translations) {
        translations.forEach((t: AchievementTranslation) => {
          title[t.language] = t.title;
          description[t.language] = t.description;
        });
      }

      return {
        ...pa,
        achievement: {
          ...achievement,
          title,
          description,
        },
      };
    }),
    playerQuests: (
      (profile.playerQuests as {
        quest: { translations: { language: string; title: string }[] };
      }[]) || []
    ).map((pq) => {
      const quest = pq.quest || {};
      const translation = quest.translations?.[0]; // Server now filters this for us
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
