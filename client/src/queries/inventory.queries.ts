import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type {
  IPlayerProfile,
  IOwnedGearItem,
  IGearAction,
} from '@/common/types';

import { store } from '@/store/store';
import { addToast } from '@/store/slices/uiSlice';
import { addPendingEquips } from '@/store/slices/gameSlice';
import { PLAYER_KEYS } from './player.queries';

import { InventoryService } from '../services/inventory.service';

export const INVENTORY_KEYS = {
  all: ['inventory'] as const,
};

type EquipPayload = (IGearAction | { equips: IGearAction[] }) & {
  buffer?: boolean;
};

export const useEquipMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    EquipPayload,
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: async (payload) => {
      const { buffer, ...data } = payload;
      if (buffer) {
        return queryClient.getQueryData<IPlayerProfile>(PLAYER_KEYS.profile());
      }

      const state = store.getState();
      if (state.game.currentLakeId) {
        const equips = 'equips' in data ? data.equips : [data];

        store.dispatch(addPendingEquips(equips));
        return null;
      }
      return InventoryService.equip(
        data as Parameters<typeof InventoryService.equip>[0],
      );
    },
    onMutate: async (payload) => {
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        PLAYER_KEYS.profile(),
      );

      if (previousProfile) {
        const updatedProfile = structuredClone(previousProfile);
        const equips = 'equips' in payload ? payload.equips : [payload];

        for (const action of equips) {
          if (action.targetType === 'rod')
            updatedProfile.equippedRodUid = action.uid || null;
          if (action.targetType === 'reel')
            updatedProfile.equippedReelUid = action.uid || null;
          if (action.targetType === 'line')
            updatedProfile.equippedLineUid = action.uid || null;
          if (action.targetType === 'hook')
            updatedProfile.equippedHookUid = action.uid || null;
          if (action.targetType === 'bait' && action.targetId) {
            updatedProfile.activeBait = action.targetId;
          }
          if (action.targetType === 'groundbait' && action.targetId) {
            updatedProfile.activeGroundbait = action.targetId;
          }
        }

        queryClient.setQueryData(PLAYER_KEYS.profile(), updatedProfile);
        await queryClient.cancelQueries({ queryKey: PLAYER_KEYS.profile() });
      }

      return { previousProfile };
    },
    onError: (err: AxiosError<{ message?: string }>, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          PLAYER_KEYS.profile(),
          context.previousProfile,
        );
      }
      store.dispatch(
        addToast({
          type: 'error',
          message: err?.response?.data?.message || 'Failed to equip item',
        }),
      );
    },
    onSuccess: (updatedProfile) => {
      if (updatedProfile != null) {
        queryClient.setQueryData(PLAYER_KEYS.profile(), updatedProfile);
      }
    },
  });
};

export const useRepairMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    { kitUid: string; targetUid: string; targetType: 'rod' | 'reel' },
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: InventoryService.repair,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: PLAYER_KEYS.profile() });

      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        PLAYER_KEYS.profile(),
      );

      if (previousProfile) {
        const updatedProfile = structuredClone(previousProfile);

        const kit = updatedProfile.gearItems.find(
          (g: IOwnedGearItem) => g.uid === payload.kitUid,
        );
        const target = updatedProfile.gearItems.find(
          (g: IOwnedGearItem) => g.uid === payload.targetUid,
        );

        if (kit && target) {
          const kitCond = kit.condition ?? 100;
          const targetCond = target.condition ?? 100;
          const needed = 100 - targetCond;
          const repairAmount = Math.min(kitCond, needed);

          target.condition = targetCond + repairAmount;
          target.isBroken = false;
          kit.condition = kitCond - repairAmount;
        }

        queryClient.setQueryData(PLAYER_KEYS.profile(), updatedProfile);
      }
      return { previousProfile };
    },
    onError: (err: AxiosError<{ message?: string }>, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          PLAYER_KEYS.profile(),
          context.previousProfile,
        );
      }
      store.dispatch(
        addToast({
          type: 'error',
          message: err?.response?.data?.message || 'Failed to repair item',
        }),
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        PLAYER_KEYS.profile(),
        (old: IPlayerProfile | undefined) => {
          if (!old) return data;
          return {
            ...(data as IPlayerProfile),
            activeBait: old.activeBait,
            activeGroundbait: old.activeGroundbait,
            equippedRodUid: old.equippedRodUid,
            equippedReelUid: old.equippedReelUid,
            equippedLineUid: old.equippedLineUid,
            equippedHookUid: old.equippedHookUid,
          };
        },
      );
    },
  });
};

export const useConsumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    { itemId: string; itemType: string; quantity?: number },
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: InventoryService.consumeConsumable,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: PLAYER_KEYS.profile() });

      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        PLAYER_KEYS.profile(),
      );

      if (previousProfile) {
        const updatedProfile = structuredClone(previousProfile);
        const index = updatedProfile.consumables.findIndex(
          (c: { itemId: string; itemType: string }) =>
            c.itemId === newItem.itemId && c.itemType === newItem.itemType,
        );

        if (index !== -1) {
          updatedProfile.consumables[index].quantity -= newItem.quantity || 1;

          if (updatedProfile.consumables[index].quantity <= 0) {
            updatedProfile.consumables.splice(index, 1);
          }
        }
        queryClient.setQueryData(PLAYER_KEYS.profile(), updatedProfile);
      }

      return { previousProfile };
    },
    onError: (err: AxiosError<{ message?: string }>, _newItem, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          PLAYER_KEYS.profile(),
          context.previousProfile,
        );
      }
      store.dispatch(
        addToast({
          type: 'error',
          message: err?.response?.data?.message || 'Failed to consume item',
        }),
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        PLAYER_KEYS.profile(),
        (old: IPlayerProfile | undefined) => {
          if (!old) return data;
          return {
            ...(data as IPlayerProfile),
            activeBait: old.activeBait,
            activeGroundbait: old.activeGroundbait,
            equippedRodUid: old.equippedRodUid,
            equippedReelUid: old.equippedReelUid,
            equippedLineUid: old.equippedLineUid,
            equippedHookUid: old.equippedHookUid,
          };
        },
      );
    },
  });
};

export const useDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    { uid: string },
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: InventoryService.deleteGear,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: PLAYER_KEYS.profile() });
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        PLAYER_KEYS.profile(),
      );

      if (previousProfile) {
        const updatedProfile = structuredClone(previousProfile);
        updatedProfile.gearItems = updatedProfile.gearItems.filter(
          (g: IOwnedGearItem) => g.uid !== payload.uid,
        );
        if (updatedProfile.equippedRodUid === payload.uid)
          updatedProfile.equippedRodUid = null;
        if (updatedProfile.equippedReelUid === payload.uid)
          updatedProfile.equippedReelUid = null;
        if (updatedProfile.equippedLineUid === payload.uid)
          updatedProfile.equippedLineUid = null;
        if (updatedProfile.equippedHookUid === payload.uid)
          updatedProfile.equippedHookUid = null;
        queryClient.setQueryData(PLAYER_KEYS.profile(), updatedProfile);
      }
      return { previousProfile };
    },
    onError: (err: AxiosError<{ message?: string }>, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          PLAYER_KEYS.profile(),
          context.previousProfile,
        );
      }
      store.dispatch(
        addToast({
          type: 'error',
          message: err?.response?.data?.message || 'Failed to delete item',
        }),
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        PLAYER_KEYS.profile(),
        (old: IPlayerProfile | undefined) => {
          if (!old) return data;
          return {
            ...(data as IPlayerProfile),
            activeBait: old.activeBait,
            activeGroundbait: old.activeGroundbait,
            equippedRodUid: old.equippedRodUid,
            equippedReelUid: old.equippedReelUid,
            equippedLineUid: old.equippedLineUid,
            equippedHookUid: old.equippedHookUid,
          };
        },
      );
    },
  });
};
