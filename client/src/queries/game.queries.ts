import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type {
  IPlayerProfile,
  IOwnedGearItem,
  ICatchFishPayload,
  IBreakGearPayload,
} from '@/common/types';

import { PLAYER_KEYS } from './player.queries';
import { store } from '@/store/store';
import { clearPendingEquips } from '@/store/slices/gameSlice';

import { addToast } from '@/store/slices/uiSlice';
import { InventoryService } from '../services/inventory.service';
import { GameService } from '../services/game.service';

import { calculateOptimisticLevel } from '@/common/utils/experience.util';

const preserveValidGearSelection = (
  localUid: string | null,
  serverUid: string | null,
  allGearItems: IOwnedGearItem[],
) => {
  if (!localUid) return serverUid;
  const item = allGearItems.find((gi: IOwnedGearItem) => gi.uid === localUid);

  if (
    item &&
    !item.isBroken &&
    (item.condition === undefined ||
      item.condition === null ||
      item.condition > 0)
  ) {
    return localUid;
  }

  return serverUid;
};

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
      const pendingEquips = state.game.pendingEquips;

      if (pendingEquips && pendingEquips.length > 0) {
        try {
          await InventoryService.equip({ equips: pendingEquips });
        } catch (error) {
          console.error('Failed to flush gears before catch:', error);
        }
        store.dispatch(clearPendingEquips());
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
    onError: (err: AxiosError<{ message?: string }>, _newCatch, context) => {
      if (context?.previousPlayer) {
        queryClient.setQueryData(PLAYER_KEYS.profile(), context.previousPlayer);
      }
      store.dispatch(
        addToast({
          type: 'error',
          message: err?.response?.data?.message || 'Failed to save catch',
        }),
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        PLAYER_KEYS.profile(),
        (old: IPlayerProfile | undefined) => {
          if (!old) return data;
          return {
            ...data,
            activeBait: old.activeBait,
            activeGroundbait: old.activeGroundbait,
            equippedRodUid: preserveValidGearSelection(
              old.equippedRodUid,
              data.equippedRodUid,
              data.gearItems,
            ),
            equippedReelUid: preserveValidGearSelection(
              old.equippedReelUid,
              data.equippedReelUid,
              data.gearItems,
            ),
            equippedLineUid: preserveValidGearSelection(
              old.equippedLineUid,
              data.equippedLineUid,
              data.gearItems,
            ),
            equippedHookUid: preserveValidGearSelection(
              old.equippedHookUid,
              data.equippedHookUid,
              data.gearItems,
            ),
          };
        },
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
      const pendingEquips = state.game.pendingEquips;

      if (pendingEquips && pendingEquips.length > 0) {
        try {
          await InventoryService.equip({ equips: pendingEquips });
        } catch (error) {
          console.error('Failed to flush gears before break:', error);
        }
        store.dispatch(clearPendingEquips());
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
    onError: (err: AxiosError<{ message?: string }>, _vars, context) => {
      if (context?.previousPlayer) {
        queryClient.setQueryData(PLAYER_KEYS.profile(), context.previousPlayer);
      }
      store.dispatch(
        addToast({
          type: 'error',
          message:
            err?.response?.data?.message || 'Failed to update gear state',
        }),
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        PLAYER_KEYS.profile(),
        (old: IPlayerProfile | undefined) => {
          if (!old) return data;
          return {
            ...data,
            activeBait: old.activeBait,
            activeGroundbait: old.activeGroundbait,
            equippedRodUid: preserveValidGearSelection(
              old.equippedRodUid,
              data.equippedRodUid,
              data.gearItems,
            ),
            equippedReelUid: preserveValidGearSelection(
              old.equippedReelUid,
              data.equippedReelUid,
              data.gearItems,
            ),
            equippedLineUid: preserveValidGearSelection(
              old.equippedLineUid,
              data.equippedLineUid,
              data.gearItems,
            ),
            equippedHookUid: preserveValidGearSelection(
              old.equippedHookUid,
              data.equippedHookUid,
              data.gearItems,
            ),
          };
        },
      );
    },
  });
};
