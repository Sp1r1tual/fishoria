import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type {
  IPlayerProfile,
  ICatchFishPayload,
  IBreakGearPayload,
} from '@/common/types';

import { PLAYER_KEYS } from './player.queries';
import { store } from '@/store/store';
import { clearPendingEquips } from '@/store/slices/gameSlice';

import { InventoryService } from '../services/inventory.service';
import { GameService } from '../services/game.service';

import { updateProfilePreservingGear } from '@/common/utils/gear.util';
import { calculateOptimisticLevel } from '@/common/utils/experience.util';

export const useCatchFishMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IPlayerProfile,
    AxiosError<{ message?: string }>,
    ICatchFishPayload,
    { previousPlayer: IPlayerProfile | undefined }
  >({
    mutationFn: async (payload: ICatchFishPayload) => {
      const state = store.getState();
      const equipsToFlush = state.game.pendingEquips;

      if (equipsToFlush && equipsToFlush.length > 0) {
        store.dispatch(clearPendingEquips());
        try {
          await InventoryService.equip({ equips: equipsToFlush });
        } catch (error) {
          console.error('Failed to flush gears before catch:', error);
        }
      }
      return GameService.catchFish(payload);
    },
    onMutate: async (newCatch) => {
      await queryClient.cancelQueries({ queryKey: PLAYER_KEYS.profile() });
      const previousPlayer = queryClient.getQueryData<IPlayerProfile>(
        PLAYER_KEYS.profile(),
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

        const optimisticFish = {
          id: `temp_${Date.now()}`,
          speciesId: newCatch.speciesId,
          speciesName: newCatch.speciesName || newCatch.speciesId,
          lakeId: newCatch.lakeId,
          lakeName: newCatch.lakeName || newCatch.lakeId,
          weight: newCatch.weight,
          length: newCatch.length,
          baitUsed: newCatch.baitUsed,
          method: newCatch.method,
          isReleased: newCatch.isReleased ?? false,
          caughtAt: new Date().toISOString(),
        };

        queryClient.setQueryData(PLAYER_KEYS.profile(), {
          ...previousPlayer,
          level: newLevel,
          xp: newXp,
          consumables: newConsumables,
          fishCatches: [...previousPlayer.fishCatches, optimisticFish],
        });
      }

      return { previousPlayer };
    },
    onError: (_err: AxiosError<{ message?: string }>, _newCatch, context) => {
      if (context?.previousPlayer) {
        queryClient.setQueryData(PLAYER_KEYS.profile(), context.previousPlayer);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        PLAYER_KEYS.profile(),
        (old: IPlayerProfile | undefined) =>
          updateProfilePreservingGear(old, data),
      );
    },
  });
};

export const useBreakGearMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IPlayerProfile,
    AxiosError<{ message?: string }>,
    IBreakGearPayload,
    { previousPlayer: IPlayerProfile | undefined }
  >({
    mutationFn: async (payload: IBreakGearPayload) => {
      const state = store.getState();
      const equipsToFlush = state.game.pendingEquips;

      if (equipsToFlush && equipsToFlush.length > 0) {
        store.dispatch(clearPendingEquips());
        try {
          await InventoryService.equip({ equips: equipsToFlush });
        } catch (error) {
          console.error('Failed to flush gears before break:', error);
        }
      }
      return GameService.breakGear(payload);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: PLAYER_KEYS.profile() });
      const previousPlayer = queryClient.getQueryData<IPlayerProfile>(
        PLAYER_KEYS.profile(),
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

        queryClient.setQueryData(PLAYER_KEYS.profile(), newPlayer);
      }

      return { previousPlayer };
    },
    onError: (_err: AxiosError<{ message?: string }>, _vars, context) => {
      if (context?.previousPlayer) {
        queryClient.setQueryData(PLAYER_KEYS.profile(), context.previousPlayer);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        PLAYER_KEYS.profile(),
        (old: IPlayerProfile | undefined) =>
          updateProfilePreservingGear(old, data),
      );
    },
  });
};
