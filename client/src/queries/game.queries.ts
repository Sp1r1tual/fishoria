import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IPlayerProfile } from '@/common/types';

import { playerKeys } from './player.queries';

import { GameService } from '../services/game.service';
import { FISH_SPECIES } from '@/common/configs/game/fish.config';

import { getXpNeededForLevel } from '@/common/utils/experience.util';

const calculateOptimisticLevel = (
  currentLevel: number,
  currentXp: number,
  weight: number,
  speciesId: string,
) => {
  const multiplier = FISH_SPECIES[speciesId]?.priceMultiplier || 1.0;
  const xpGain = Math.ceil((weight || 0) * 25 * multiplier);
  let newXp = currentXp + xpGain;
  let newLevel = currentLevel;

  let xpNeeded = getXpNeededForLevel(newLevel);
  while (newXp >= xpNeeded) {
    newXp -= xpNeeded;
    newLevel += 1;
    xpNeeded = getXpNeededForLevel(newLevel);
  }

  return { newLevel, newXp };
};

export const useCatchFishMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: GameService.catchFish,
    onMutate: async (newCatch) => {
      await queryClient.cancelQueries({ queryKey: playerKeys.profile() });
      const previousPlayer = queryClient.getQueryData<IPlayerProfile>(
        playerKeys.profile(),
      );

      if (previousPlayer) {
        const { newLevel, newXp } = calculateOptimisticLevel(
          previousPlayer.level,
          previousPlayer.xp,
          newCatch.weight,
          newCatch.speciesId,
        );

        const newConsumables = [...previousPlayer.consumables];
        if (newCatch.baitUsed && !newCatch.baitUsed.startsWith('lure_')) {
          const idx = newConsumables.findIndex(
            (c) => c.itemId === newCatch.baitUsed && c.itemType === 'bait',
          );
          if (idx !== -1) {
            newConsumables[idx] = {
              ...newConsumables[idx],
              quantity: Math.max(0, newConsumables[idx].quantity - 1),
            };
          }
        }

        queryClient.setQueryData(playerKeys.profile(), {
          ...previousPlayer,
          level: newLevel,
          xp: newXp,
          consumables: newConsumables,
        });
      }

      return { previousPlayer };
    },
    onError: (_err, _newCatch, context) => {
      if (context?.previousPlayer) {
        queryClient.setQueryData(playerKeys.profile(), context.previousPlayer);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(playerKeys.profile(), data);
    },
  });
};

export const useBreakGearMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: GameService.breakGear,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: playerKeys.profile() });
      const previousPlayer = queryClient.getQueryData<IPlayerProfile>(
        playerKeys.profile(),
      );

      if (previousPlayer) {
        const newPlayer = { ...previousPlayer };

        if (variables.baitId && !variables.baitId.startsWith('lure_')) {
          const newConsumables = [...previousPlayer.consumables];
          const idx = newConsumables.findIndex(
            (c) => c.itemId === variables.baitId && c.itemType === 'bait',
          );
          if (idx !== -1) {
            newConsumables[idx] = {
              ...newConsumables[idx],
              quantity: Math.max(0, newConsumables[idx].quantity - 1),
            };
            newPlayer.consumables = newConsumables;
          }
        }

        if (variables.type === 'hook' && previousPlayer.equippedHookUid) {
          newPlayer.equippedHookUid = null;
        }

        if (variables.type === 'rod' && previousPlayer.equippedRodUid) {
          const newGearItems = previousPlayer.gearItems.map((g) =>
            g.uid === previousPlayer.equippedRodUid
              ? { ...g, isBroken: true, condition: 0 }
              : g,
          );
          newPlayer.gearItems = newGearItems;
          newPlayer.equippedRodUid = null;
        }

        if (variables.type === 'reel' && previousPlayer.equippedReelUid) {
          const newGearItems = (
            newPlayer.gearItems || previousPlayer.gearItems
          ).map((g) =>
            g.uid === previousPlayer.equippedReelUid
              ? { ...g, isBroken: true, condition: 0 }
              : g,
          );
          newPlayer.gearItems = newGearItems;
          newPlayer.equippedReelUid = null;
        }

        queryClient.setQueryData(playerKeys.profile(), newPlayer);
      }

      return { previousPlayer };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPlayer) {
        queryClient.setQueryData(playerKeys.profile(), context.previousPlayer);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(playerKeys.profile(), data);
    },
  });
};
