import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IPlayerProfile, IOwnedGearItem } from '@/common/types';

import { store } from '@/store';
import { addPendingEquips } from '@/store/slices/gameSlice';
import { playerKeys } from './player.queries';

import { InventoryService } from '../services/inventory.service';

type EquipPayload =
  | {
      targetType: 'rod' | 'reel' | 'line' | 'hook' | 'bait' | 'groundbait';
      uid?: string | null;
      targetId?: string | null;
    }
  | {
      equips: {
        targetType: 'rod' | 'reel' | 'line' | 'hook' | 'bait' | 'groundbait';
        uid?: string | null;
        targetId?: string | null;
      }[];
    };

export const useEquipMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    unknown,
    EquipPayload,
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: async (payload) => {
      const state = store.getState();
      if (state.game.currentLakeId) {
        const equips = 'equips' in payload ? payload.equips : [payload];
        store.dispatch(addPendingEquips(equips));
        return queryClient.getQueryData<IPlayerProfile>(playerKeys.profile());
      }
      return InventoryService.equip(payload);
    },
    onMutate: async (payload) => {
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        playerKeys.profile(),
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

        queryClient.setQueryData(playerKeys.profile(), updatedProfile);
        queryClient.cancelQueries({ queryKey: playerKeys.profile() });
      }

      return { previousProfile };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(playerKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(playerKeys.profile(), updatedProfile);
    },
  });
};

export const useRepairMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    unknown,
    { kitUid: string; targetUid: string; targetType: 'rod' | 'reel' },
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: InventoryService.repair,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: playerKeys.profile() });
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        playerKeys.profile(),
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

        queryClient.setQueryData(playerKeys.profile(), updatedProfile);
      }
      return { previousProfile };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(playerKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(playerKeys.profile(), updatedProfile);
    },
  });
};

export const useConsumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    unknown,
    { itemId: string; itemType: string; quantity?: number },
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: InventoryService.consumeConsumable,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: playerKeys.profile() });
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        playerKeys.profile(),
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
        queryClient.setQueryData(playerKeys.profile(), updatedProfile);
      }

      return { previousProfile };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(playerKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(playerKeys.profile(), updatedProfile);
    },
  });
};

export const useDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    unknown,
    { uid: string },
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: InventoryService.deleteGear,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: playerKeys.profile() });
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        playerKeys.profile(),
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
        queryClient.setQueryData(playerKeys.profile(), updatedProfile);
      }
      return { previousProfile };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(playerKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(playerKeys.profile(), updatedProfile);
    },
  });
};
