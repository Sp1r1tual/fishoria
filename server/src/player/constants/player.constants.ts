export const FULL_PROFILE_INCLUDE = {
  gearItems: true,
  consumables: true,
  fishCatches: true,
  lakeStats: true,
  playerQuests: {
    include: {
      quest: {
        include: {
          translations: true,
        },
      },
    },
  },
  playerAchievements: {
    include: {
      achievement: {
        include: {
          translations: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      role: true,
      isActivated: true,
      language: true,
    },
  },
} as const;
