import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { IPlayerQuest, IPlayerProfile } from '@/common/types/player.types';

import { useGameAudio } from '@/hooks/audio/useGameAudio';
import { useAppDispatch } from '@/hooks/core/useAppStore';

import { PLAYER_KEYS } from './player.queries';
import { addToast } from '@/store/slices/uiSlice';

import { QuestService } from '@/services/quest.service';

export const QUEST_KEYS = {
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
  const { onPurchase } = useGameAudio(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

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
      onPurchase();

      dispatch(
        addToast({
          message: t('quests.rewardClaimed'),
          type: 'success',
        }),
      );

      queryClient.setQueryData(PLAYER_KEYS.profile(), updatedProfile);

      queryClient.invalidateQueries({ queryKey: QUEST_KEYS.all });
    },
  });
};
