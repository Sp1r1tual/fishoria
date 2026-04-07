import { $mainApi } from '@/http/axios';

import type { IPlayerQuest, IPlayerProfile } from '@/common/types/player.types';

export const QuestService = {
  getQuests: async (): Promise<IPlayerQuest[]> => {
    const { data } = await $mainApi.get('/quests');
    return data;
  },
  claimReward: async (playerQuestId: string): Promise<IPlayerProfile> => {
    const { data } = await $mainApi.post('/quests/claim', { playerQuestId });
    return data;
  },
};
