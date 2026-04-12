import type { IPlayerQuest, IPlayerProfile } from '@/common/types/player.types';

import { $mainApi } from '@/http/axios';

export class QuestService {
  static async getQuests(): Promise<IPlayerQuest[]> {
    const { data } = await $mainApi.get('/quests');
    return data;
  }

  static async claimReward(playerQuestId: string): Promise<IPlayerProfile> {
    const { data } = await $mainApi.post('/quests/claim', { playerQuestId });
    return data;
  }
}
