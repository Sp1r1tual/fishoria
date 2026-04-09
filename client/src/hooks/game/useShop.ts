import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  IGadgetConfig,
  GearItemType,
  GearTypeType,
  IModalConfig,
  IOwnedGearItem,
} from '@/common/types';

export type { GearItemType, GearTypeType };

import { useAppDispatch } from '@/hooks/core/useAppStore';
import { useGameAudio } from '@/hooks/audio/useGameAudio';
import { addToast } from '@/store/slices/uiSlice';

import {
  BAITS,
  BAIT_IDS,
  GROUNDBAITS,
  GROUNDBAIT_IDS,
} from '@/common/configs/game';

import { usePlayerQuery } from '@/queries/player.queries';
import { useBuyMutation } from '@/queries/shop.queries';

const UNIQUE_GADGET_IDS = ['echo_sounder'] as const;
const isUniqueGadget = (id: string) =>
  UNIQUE_GADGET_IDS.includes(id as (typeof UNIQUE_GADGET_IDS)[number]);

export function useShop() {
  const dispatch = useAppDispatch();
  const { data: player, isLoading } = usePlayerQuery();
  const buyMutation = useBuyMutation();
  const { onPurchase } = useGameAudio(false);
  const { t } = useTranslation();

  // If player is not loaded yet, use default values for UI
  const money = player?.money ?? 0;
  const consumables = player?.consumables ?? [];

  const getConsumableCount = (id: string, type: string) => {
    return (
      consumables.find(
        (c: { itemId: string; itemType: string }) =>
          c.itemId === id && c.itemType === type,
      )?.quantity ?? 0
    );
  };

  const [qtys, setQtys] = useState<Record<string, number>>({
    ...Object.fromEntries(BAIT_IDS.map((id) => [id, 5])),
    ...Object.fromEntries(GROUNDBAIT_IDS.map((id) => [id, 5])),
  });

  const [modal, setModal] = useState<IModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // ─── Notifications ────────────────────────────────────────────────────────

  const notifySuccess = (message: string) =>
    dispatch(addToast({ message, type: 'success' }));

  const notifyError = (message: string) =>
    dispatch(addToast({ message, type: 'error' }));

  // ─── Modal ────────────────────────────────────────────────────────────────

  const closeModal = () => setModal((p) => ({ ...p, isOpen: false }));

  const openModal = (
    config: Omit<IModalConfig, 'isOpen' | 'onConfirm'>,
    onConfirm: () => void,
  ) => setModal({ ...config, isOpen: true, onConfirm });

  // ─── Qty ──────────────────────────────────────────────────────────────────

  const decreaseQty = (id: string) =>
    setQtys((p) => ({ ...p, [id]: Math.max(1, (p[id] || 1) - 1) }));

  const increaseQty = (id: string) =>
    setQtys((p) => ({ ...p, [id]: Math.min(99, (p[id] || 1) + 1) }));

  // ─── Owned count ──────────────────────────────────────────────────────────

  const getOwnedCount = (type: GearTypeType, id: string): number => {
    if (!player) return 0;
    if (type === 'bait' || type === 'groundbait') {
      return getConsumableCount(id, type);
    }
    if (type === 'gadget') {
      if (id === 'echo_sounder') return player.hasEchoSounder ? 1 : 0;
      if (id === 'repair_kit')
        return player.gearItems.filter(
          (g: IOwnedGearItem) => g.itemId === 'repair_kit',
        ).length;
      return 0;
    }
    return player.gearItems.filter(
      (g: IOwnedGearItem) => g.itemType === type && g.itemId === id,
    ).length;
  };

  // ─── Buy consumable (bait / groundbait) ───────────────────────────────────

  const handleBuyConsumable = (
    id: string,
    config: { price: number; icon?: string; name: string },
    translationNs: 'baits' | 'groundbaits',
    itemType: string,
  ) => {
    const qty = qtys[id] ?? 1;
    const total = config.price * qty;

    if (money < total) {
      notifyError(t('shop.notEnoughMoney'));
      return;
    }

    openModal(
      {
        title: t('shop.confirmTitle'),
        message: t('shop.confirmMessage', {
          qty,
          name: t(`${translationNs}.${id}.name`),
        }),
        icon: config.icon,
        price: total,
      },
      async () => {
        const payload = { itemId: id, itemType, quantity: qty };
        closeModal();
        try {
          await buyMutation.mutateAsync(payload);
          notifySuccess(
            t('shop.boughtSuccess', {
              qty,
              name: t(`${translationNs}.${id}.name`),
            }),
          );
          onPurchase();
        } catch (e: unknown) {
          const err = e as { response?: { data?: { message?: string } } };
          notifyError(err.response?.data?.message || t('errors.unknown'));
        }
      },
    );
  };

  const handleBuyBait = (baitId: string) => {
    const bait = BAITS[baitId as keyof typeof BAITS];
    handleBuyConsumable(baitId, bait, 'baits', 'bait');
  };

  const handleBuyGroundbait = (id: string) => {
    const gb = GROUNDBAITS[id as keyof typeof GROUNDBAITS];
    handleBuyConsumable(id, gb, 'groundbaits', 'groundbait');
  };

  // ─── Buy gear ─────────────────────────────────────────────────────────────

  const handleBuyGear = (type: GearTypeType, item: GearItemType) => {
    if (money < item.price) {
      notifyError(t('shop.notEnoughMoney'));
      return;
    }

    openModal(
      {
        title: t('shop.purchaseGear'),
        message: t('shop.confirmMessage', {
          qty: 1,
          name: t(`gear_items.${item.id}.name`),
        }),
        price: item.price,
      },
      async () => {
        closeModal();
        try {
          await buyMutation.mutateAsync({
            itemId: item.id,
            itemType: type,
            quantity: 1,
          });
          notifySuccess(
            t('shop.boughtSuccess', {
              qty: 1,
              name: t(`gear_items.${item.id}.name`),
            }),
          );
          onPurchase();
        } catch (e: unknown) {
          const err = e as { response?: { data?: { message?: string } } };
          notifyError(err.response?.data?.message || t('errors.unknown'));
        }
      },
    );
  };

  const handleBuyGadget = (item: IGadgetConfig) => {
    const ownedCount = getOwnedCount('gadget', item.id);

    if (isUniqueGadget(item.id) && ownedCount > 0) {
      notifyError(t('shop.alreadyOwned'));
      return;
    }

    if (money < item.price) {
      notifyError(t('shop.notEnoughMoney'));
      return;
    }

    openModal(
      {
        title: t('shop.purchaseGear'),
        message: t('shop.confirmMessage', {
          qty: 1,
          name: t(`gear_items.${item.id}.name`),
        }),
        price: item.price,
      },
      async () => {
        closeModal();
        try {
          await buyMutation.mutateAsync({
            itemId: item.id,
            itemType: item.id === 'repair_kit' ? 'repair_kit' : 'gadget',
            quantity: 1,
          });
          notifySuccess(
            t('shop.boughtSuccess', {
              qty: 1,
              name: t(`gear_items.${item.id}.name`),
            }),
          );
          onPurchase();
        } catch (e: unknown) {
          const err = e as { response?: { data?: { message?: string } } };
          notifyError(err.response?.data?.message || t('errors.unknown'));
        }
      },
    );
  };

  return {
    player,
    isLoading,
    money,
    baitCounts: Object.fromEntries(
      consumables
        .filter((c: { itemType: string }) => c.itemType === 'bait')
        .map((c: { itemId: string; quantity: number }) => [
          c.itemId,
          c.quantity,
        ]),
    ),
    groundbaitCounts: Object.fromEntries(
      consumables
        .filter((c: { itemType: string }) => c.itemType === 'groundbait')
        .map((c: { itemId: string; quantity: number }) => [
          c.itemId,
          c.quantity,
        ]),
    ),
    qtys,
    modal,

    closeModal,
    decreaseQty,
    increaseQty,
    getOwnedCount,
    handleBuyBait,
    handleBuyGroundbait,
    handleBuyGear,
    handleBuyGadget,
    isUniqueGadget,
  };
}
