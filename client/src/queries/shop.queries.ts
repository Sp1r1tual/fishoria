import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IPlayerProfile } from '@/common/types';

import { playerKeys } from './player.queries';

import { ShopService } from '../services/shop.service';
import {
  BAITS,
  GROUNDBAITS,
  SHOP_RODS,
  SHOP_REELS,
  SHOP_LINES,
  SHOP_HOOKS,
  SHOP_GADGETS,
  FISH_SPECIES,
} from '@/common/configs/game';

export const useBuyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    unknown,
    { itemId: string; itemType: string; quantity?: number },
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: ShopService.buy,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: playerKeys.profile() });
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        playerKeys.profile(),
      );

      if (previousProfile) {
        const updatedProfile = structuredClone(previousProfile);

        let price = 0;
        const qty = newItem.quantity || 1;

        if (newItem.itemType === 'bait')
          price =
            (BAITS as Record<string, { price: number }>)[newItem.itemId]
              ?.price ?? 0;
        if (newItem.itemType === 'groundbait')
          price =
            (GROUNDBAITS as Record<string, { price: number }>)[newItem.itemId]
              ?.price ?? 0;
        if (newItem.itemType === 'rod')
          price = SHOP_RODS.find((r) => r.id === newItem.itemId)?.price ?? 0;
        if (newItem.itemType === 'reel')
          price = SHOP_REELS.find((r) => r.id === newItem.itemId)?.price ?? 0;
        if (newItem.itemType === 'line')
          price = SHOP_LINES.find((l) => l.id === newItem.itemId)?.price ?? 0;
        if (newItem.itemType === 'hook')
          price = SHOP_HOOKS.find((h) => h.id === newItem.itemId)?.price ?? 0;
        if (newItem.itemType === 'gadget')
          price = SHOP_GADGETS.find((r) => r.id === newItem.itemId)?.price ?? 0;

        const totalPrice = price * qty;
        updatedProfile.money -= totalPrice;

        if (newItem.itemType === 'bait' || newItem.itemType === 'groundbait') {
          const existing = updatedProfile.consumables.find(
            (c: { itemId: string; itemType: string; quantity: number }) =>
              c.itemId === newItem.itemId && c.itemType === newItem.itemType,
          );
          if (existing) {
            existing.quantity += qty;
          } else {
            updatedProfile.consumables.push({
              itemId: newItem.itemId,
              itemType: newItem.itemType,
              quantity: qty,
            });
          }
        } else {
          for (let i = 0; i < qty; i++) {
            updatedProfile.gearItems.push({
              uid: `__optimistic_${Date.now()}_${i}`,
              id: `__optimistic_${Date.now()}_${i}`,
              itemId: newItem.itemId,
              itemType: newItem.itemType,
              condition:
                newItem.itemType === 'rod' ||
                newItem.itemType === 'reel' ||
                newItem.itemType === 'repair_kit'
                  ? 100
                  : undefined,
              meters: newItem.itemType === 'line' ? 300 : undefined,
              isBroken: false,
            });
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
    onSuccess: (data) => {
      queryClient.setQueryData(playerKeys.profile(), data);
    },
  });
};

export const useSellMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    unknown,
    void,
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: ShopService.sell,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: playerKeys.profile() });
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        playerKeys.profile(),
      );

      if (previousProfile) {
        const updatedProfile = structuredClone(previousProfile);

        let total = 0;
        updatedProfile.fishCatches.forEach((f) => {
          const species =
            FISH_SPECIES[f.speciesId as keyof typeof FISH_SPECIES];
          const multiplier = species?.priceMultiplier || 1.0;
          total += Math.ceil(f.weight * 15 * multiplier);
        });
        updatedProfile.money += total;
        updatedProfile.fishCatches = [];
        queryClient.setQueryData(playerKeys.profile(), updatedProfile);
      }
      return { previousProfile };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(playerKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(playerKeys.profile(), data);
    },
  });
};
