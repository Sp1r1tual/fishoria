import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  IPlayerProfile,
  IBuyItemPayload,
  GearTypeType,
} from '@/common/types';

import { PLAYER_KEYS } from './player.queries';

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
import { ECONOMY } from '@/common/configs/game/system.config';

const getItemPrice = (itemId: string, itemType: string): number => {
  switch (itemType) {
    case 'bait':
      return (BAITS as Record<string, { price: number }>)[itemId]?.price ?? 0;
    case 'groundbait':
      return (
        (GROUNDBAITS as Record<string, { price: number }>)[itemId]?.price ?? 0
      );
    case 'rod':
      return SHOP_RODS.find((r) => r.id === itemId)?.price ?? 0;
    case 'reel':
      return SHOP_REELS.find((r) => r.id === itemId)?.price ?? 0;
    case 'line':
      return SHOP_LINES.find((l) => l.id === itemId)?.price ?? 0;
    case 'hook':
      return SHOP_HOOKS.find((h) => h.id === itemId)?.price ?? 0;
    case 'gadget':
      return SHOP_GADGETS.find((g) => g.id === itemId)?.price ?? 0;
    default:
      return 0;
  }
};

export const useBuyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IPlayerProfile,
    unknown,
    IBuyItemPayload,
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: ShopService.buy,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: PLAYER_KEYS.profile() });
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        PLAYER_KEYS.profile(),
      );

      if (previousProfile) {
        const updatedProfile = structuredClone(previousProfile);

        const price = getItemPrice(newItem.itemId, newItem.itemType);
        const qty = newItem.quantity || 1;

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
              itemType: newItem.itemType as GearTypeType,
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

        queryClient.setQueryData(PLAYER_KEYS.profile(), updatedProfile);
      }

      return { previousProfile };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          PLAYER_KEYS.profile(),
          context.previousProfile,
        );
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PLAYER_KEYS.profile(), data);
    },
  });
};

export const useSellMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IPlayerProfile,
    unknown,
    void,
    { previousProfile: IPlayerProfile | undefined }
  >({
    mutationFn: ShopService.sell,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: PLAYER_KEYS.profile() });
      const previousProfile = queryClient.getQueryData<IPlayerProfile>(
        PLAYER_KEYS.profile(),
      );

      if (previousProfile) {
        const updatedProfile = structuredClone(previousProfile);

        let total = 0;
        updatedProfile.fishCatches = updatedProfile.fishCatches.filter((f) => {
          if (f.isReleased) return true;

          const species =
            FISH_SPECIES[f.speciesId as keyof typeof FISH_SPECIES];
          const multiplier = species?.priceMultiplier || 1.0;

          total += Math.ceil(
            f.weight * ECONOMY.baseFishPricePerKg * multiplier,
          );
          return false;
        });

        updatedProfile.money += total;
        queryClient.setQueryData(PLAYER_KEYS.profile(), updatedProfile);
      }
      return { previousProfile };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          PLAYER_KEYS.profile(),
          context.previousProfile,
        );
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PLAYER_KEYS.profile(), data);
    },
  });
};
