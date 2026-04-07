import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { IPlayerQuest, IPlayerProfile } from '@/common/types/player.types';

import { playerKeys } from './player.queries';

import { QuestService } from '@/services/quest.service';
import metalCoinRattle from '@/assets/music/metal_coin_rattle.mp3';

const QUEST_KEYS = {
  all: ['quests'] as const,
};

export const useQuests = () => {
  return useQuery<IPlayerQuest[]>({
    queryKey: QUEST_KEYS.all,
    queryFn: () => QuestService.getQuests(),
  });
};

export const useClaimQuestReward = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IPlayerProfile,
    Error,
    string,
    { previousQuests: IPlayerQuest[] | undefined }
  >({
    mutationFn: (playerQuestId: string) =>
      QuestService.claimReward(playerQuestId),
    onMutate: async (playerQuestId) => {
      await queryClient.cancelQueries({ queryKey: QUEST_KEYS.all });
      const previousQuests = queryClient.getQueryData<IPlayerQuest[]>(
        QUEST_KEYS.all,
      );

      if (previousQuests) {
        queryClient.setQueryData(
          QUEST_KEYS.all,
          previousQuests.map((q) =>
            q.id === playerQuestId ? { ...q, isClaimed: true } : q,
          ),
        );
      }

      return { previousQuests };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQuests) {
        queryClient.setQueryData(QUEST_KEYS.all, context.previousQuests);
      }
    },
    onSuccess: (updatedProfile) => {
      new Audio(metalCoinRattle)
        .play()
        .catch((err) => console.log('Audio playback failed:', err));

      queryClient.setQueryData(playerKeys.profile(), updatedProfile);

      queryClient.invalidateQueries({ queryKey: QUEST_KEYS.all });
    },
  });
};
