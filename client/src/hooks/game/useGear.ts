import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import type {
  BaitTypeType,
  GearTypeType,
  IGearItemBase,
  IOwnedGearItem,
} from '@/common/types';

import { useAppSelector, useAppDispatch } from '@/hooks/core/useAppStore';
import { useClickSound } from '@/hooks/audio/useClickSound';

import {
  SHOP_RODS,
  SHOP_REELS,
  SHOP_LINES,
  SHOP_HOOKS,
  GROUNDBAITS,
  BAITS,
  SHOP_GADGETS,
} from '@/common/configs/game';

import { usePlayerQuery } from '@/queries/player.queries';
import {
  useEquipMutation,
  useRepairMutation,
  useDeleteMutation,
} from '@/queries/inventory.queries';
import { addToast } from '@/store/slices/uiSlice';

interface IDeleteModal {
  isOpen: boolean;
  type: string;
  uid: string;
  name: string;
}

interface IRepairModal {
  isOpen: boolean;
  kitUid: string | null;
}

export function useGear() {
  const navigate = useNavigate();
  const playClick = useClickSound();
  const dispatch = useAppDispatch();
  const { data: player } = usePlayerQuery();
  const { phase } = useAppSelector((s) => s.game);
  const activeBait = player?.activeBait || 'worm';
  const activeGroundbait = player?.activeGroundbait || 'none';
  const { t } = useTranslation();

  const equipMutation = useEquipMutation();
  const repairMutation = useRepairMutation();
  const deleteMutation = useDeleteMutation();

  const [deleteModal, setDeleteModal] = useState<IDeleteModal>({
    isOpen: false,
    type: '',
    uid: '',
    name: '',
  });

  const [repairModal, setRepairModal] = useState<IRepairModal>({
    isOpen: false,
    kitUid: null,
  });

  const handleEquip = useCallback(
    (type: GearTypeType, _item: IGearItemBase, uid: string | null = null) => {
      if (phase !== 'idle') return;

      playClick();

      if (type === 'bait') {
        const baitId = _item.id as BaitTypeType;
        if (baitId.startsWith('lure_')) {
          const inst = player?.gearItems.find(
            (h: IOwnedGearItem) => h.itemId === baitId,
          );
          if (inst) {
            equipMutation.mutate({
              equips: [
                { targetType: 'hook', uid: inst.uid },
                { targetType: 'bait', targetId: baitId },
              ],
            });
          }
        } else {
          equipMutation.mutate({ targetType: 'bait', targetId: baitId });
        }
        return;
      }

      if (type === 'groundbait') {
        equipMutation.mutate({ targetType: 'groundbait', targetId: _item.id });
        return;
      }

      // Standard gear equip
      try {
        const equips: {
          targetType: 'rod' | 'reel' | 'line' | 'hook' | 'bait';
          uid?: string | null;
          targetId?: string | null;
        }[] = [
          {
            targetType: type as Extract<
              GearTypeType,
              'rod' | 'reel' | 'line' | 'hook'
            >,
            uid,
          },
        ];

        if (type === 'hook' && _item.id.startsWith('lure_')) {
          equips.push({ targetType: 'bait', targetId: _item.id });
        }

        // Auto-equip compatible bait/hook if rod swapped
        if (type === 'rod') {
          const _ownedItem = _item as unknown as IOwnedGearItem;
          const rodConfig = SHOP_RODS.find(
            (r) => r.id === (_ownedItem.itemId || _item.id),
          );
          const isSpinning = rodConfig?.rodCategory === 'spinning';
          const isSpinningBait = activeBait.startsWith('lure_');

          if (isSpinning && !isSpinningBait) {
            const ownedLures = SHOP_HOOKS.filter(
              (h) =>
                h.rigType === 'spinning' &&
                player?.gearItems.some(
                  (gi: IOwnedGearItem) => gi.itemId === h.id,
                ),
            );
            if (ownedLures.length > 0) {
              const matching = player?.gearItems.find(
                (inst: IOwnedGearItem) => inst.itemId === ownedLures[0].id,
              );
              if (matching) {
                equips.push({ targetType: 'hook', uid: matching.uid });
                equips.push({ targetType: 'bait', targetId: ownedLures[0].id });
              }
            }
          } else if (isSpinning && isSpinningBait) {
            const matching = player?.gearItems.find(
              (inst: IOwnedGearItem) => inst.itemId === activeBait,
            );
            if (matching && player?.equippedHookUid !== matching.uid) {
              equips.push({ targetType: 'hook', uid: matching.uid });
            }
          } else if (!isSpinning && isSpinningBait) {
            const ownedHooks = SHOP_HOOKS.filter(
              (h) =>
                h.rigType === 'float' &&
                player?.gearItems.some(
                  (gi: IOwnedGearItem) => gi.itemId === h.id,
                ),
            );
            if (ownedHooks.length > 0) {
              const matching = player?.gearItems.find(
                (inst: IOwnedGearItem) => inst.itemId === ownedHooks[0].id,
              );
              if (matching) {
                equips.push({ targetType: 'hook', uid: matching.uid });
              }
            } else {
              // Unequip the lure hook if no classic hook is available
              equips.push({ targetType: 'hook', uid: null });
            }

            const firstClassic = Object.keys(BAITS).find(
              (id) =>
                (player?.consumables.find(
                  (c: { itemId: string; itemType: string }) =>
                    c.itemId === id && c.itemType === 'bait',
                )?.quantity ?? 0) > 0,
            );
            if (firstClassic) {
              equips.push({ targetType: 'bait', targetId: firstClassic });
            }
          }
        }

        equipMutation.mutate({ equips });
      } catch (e) {
        console.error('Failed to equip', e);
      }
    },
    [player, phase, activeBait, equipMutation, playClick],
  );

  const handleDelete = useCallback(
    (type: string, uid: string, name: string) => {
      setDeleteModal({ isOpen: true, type, uid, name });
    },
    [],
  );

  const confirmDelete = useCallback(async () => {
    if (phase !== 'idle') return;
    try {
      await deleteMutation.mutateAsync({ uid: deleteModal.uid });
    } catch (e) {
      console.error('Failed to delete', e);
    }
    setDeleteModal((p) => ({ ...p, isOpen: false }));
  }, [phase, deleteModal.uid, deleteMutation]);

  const handleRepair = useCallback(
    async (kitUid: string, targetUid: string, targetType: 'rod' | 'reel') => {
      if (phase !== 'idle') return;
      playClick();
      try {
        await repairMutation.mutateAsync({ kitUid, targetUid, targetType });
        dispatch(
          addToast({
            message: t('gear.repairModal.success', 'Gear item repaired'),
            type: 'success',
          }),
        );
      } catch (e) {
        console.error('Failed to repair', e);
      }
      setRepairModal({ isOpen: false, kitUid: null });
    },
    [phase, repairMutation, playClick, dispatch, t],
  );

  const handleBack = useCallback(
    (onClose?: () => void) => {
      if (onClose) onClose();
      else navigate('/');
    },
    [navigate],
  );

  // ── Memoized Inventory lists ────────────────────────────────────────────────────

  const memoizedRods = useMemo(() => {
    if (!player) return [];
    const categoryOrder: Record<string, number> = {
      float: 0,
      spinning: 1,
      feeder: 2,
    };
    return player.gearItems
      .filter((g: IOwnedGearItem) => g.itemType === 'rod')
      .map((inst: IOwnedGearItem) => ({
        ...SHOP_RODS.find((r) => r.id === inst.itemId),
        ...inst,
        id: inst.itemId,
      }))
      .sort((aBrief: IGearItemBase, bBrief: IGearItemBase) => {
        const orderA = aBrief.rodCategory
          ? categoryOrder[aBrief.rodCategory]
          : 99;
        const orderB = bBrief.rodCategory
          ? categoryOrder[bBrief.rodCategory]
          : 99;
        if (orderA !== orderB) return orderA - orderB;
        return (aBrief.price ?? 0) - (bBrief.price ?? 0);
      });
  }, [player]);

  const memoizedReels = useMemo(() => {
    if (!player) return [];
    return player.gearItems
      .filter((g: IOwnedGearItem) => g.itemType === 'reel')
      .map((inst: IOwnedGearItem) => ({
        ...SHOP_REELS.find((r) => r.id === inst.itemId),
        ...inst,
        id: inst.itemId,
      }))
      .sort(
        (aBrief: IGearItemBase, bBrief: IGearItemBase) =>
          (aBrief.price ?? 0) - (bBrief.price ?? 0),
      );
  }, [player]);

  const memoizedLines = useMemo(() => {
    if (!player) return [];
    const rawLines = player.gearItems
      .filter((g: IOwnedGearItem) => g.itemType === 'line')
      .map((inst: IOwnedGearItem) => ({
        ...SHOP_LINES.find((r) => r.id === inst.itemId),
        ...inst,
        id: inst.itemId,
      }));

    const grouped: (IGearItemBase & { count?: number })[] = [];
    const counts: Record<string, number> = {};
    const firstUids: Record<string, string> = {};

    rawLines.forEach((item: IGearItemBase & IOwnedGearItem) => {
      const isEquipped = item.uid === player.equippedLineUid;
      const currentMeters = item.meters ?? 0;
      const totalLength = item.totalLength ?? 300;
      const isFull = item.meters === null || currentMeters >= totalLength;

      // Group all items that are at full length
      if (isFull) {
        counts[item.id] = (counts[item.id] || 0) + 1;
        // If this part of group is equipped, prioritize its UID
        if (isEquipped && item.uid) firstUids[item.id] = item.uid;
        else if (!firstUids[item.id] && item.uid) firstUids[item.id] = item.uid;
      } else {
        grouped.push(item);
      }
    });

    Object.keys(counts).forEach((itemId) => {
      const base = SHOP_LINES.find((r) => r.id === itemId);
      if (base) {
        grouped.push({
          ...base,
          id: itemId,
          uid: firstUids[itemId],
          count: counts[itemId],
        } as IGearItemBase);
      }
    });

    return grouped.sort(
      (aBrief: IGearItemBase, bBrief: IGearItemBase) =>
        (aBrief.price ?? 0) - (bBrief.price ?? 0),
    );
  }, [player]);

  const memoizedHooks = useMemo(() => {
    if (!player) return [];
    const equippedRod = player.gearItems.find(
      (g: IOwnedGearItem) => g.uid === player.equippedRodUid,
    );
    const rodConfig = SHOP_RODS.find((r) => r.id === equippedRod?.itemId);
    const rodCategory = rodConfig?.rodCategory || 'float';

    const rigOrder: Record<string, number> = {
      float: 0,
      spinning: 1,
      feeder: 2,
    };

    const rawHooks = player.gearItems
      .filter((g: IOwnedGearItem) => g.itemType === 'hook')
      .map((inst: IOwnedGearItem) => ({
        ...SHOP_HOOKS.find((h) => h.id === inst.itemId),
        ...inst,
        id: inst.itemId,
      }))
      .filter((h: IGearItemBase) => {
        if (!h.rigType) return true;
        if (rodCategory === 'spinning') return h.rigType === 'spinning';
        return h.rigType !== 'spinning';
      });

    const grouped: (IGearItemBase & { count?: number })[] = [];
    const counts: Record<string, number> = {};
    const firstUids: Record<string, string> = {};

    rawHooks.forEach((item: IGearItemBase & IOwnedGearItem) => {
      const isEquipped = item.uid === player.equippedHookUid;
      const currentCondition = item.condition ?? 100;
      const isPerfect = item.condition === null || currentCondition >= 100;

      // Group all items in perfect condition
      if (isPerfect) {
        counts[item.id] = (counts[item.id] || 0) + 1;
        // If this part of group is equipped, prioritize its UID
        if (isEquipped && item.uid) firstUids[item.id] = item.uid;
        else if (!firstUids[item.id] && item.uid) firstUids[item.id] = item.uid;
      } else {
        grouped.push(item);
      }
    });

    Object.keys(counts).forEach((itemId) => {
      const base = SHOP_HOOKS.find((h) => h.id === itemId);
      if (base) {
        grouped.push({
          ...base,
          id: itemId,
          uid: firstUids[itemId],
          count: counts[itemId],
        } as IGearItemBase);
      }
    });

    return grouped.sort((aBrief: IGearItemBase, bBrief: IGearItemBase) => {
      const orderA = aBrief.rigType ? rigOrder[aBrief.rigType] : 99;
      const orderB = bBrief.rigType ? rigOrder[bBrief.rigType] : 99;
      if (orderA !== orderB) return orderA - orderB;
      return (aBrief.price ?? 0) - (bBrief.price ?? 0);
    });
  }, [player]);

  const memoizedBaits = useMemo(() => {
    if (!player) return [];
    const equippedRod = player.gearItems.find(
      (g: IOwnedGearItem) => g.uid === player.equippedRodUid,
    );
    const rodConfig = SHOP_RODS.find((r) => r.id === equippedRod?.itemId);
    const isSpinningRod = rodConfig?.rodCategory === 'spinning';

    return Object.keys(BAITS)
      .filter((id) => {
        const count =
          player.consumables.find(
            (c: { itemId: string; itemType: string }) =>
              c.itemId === id && c.itemType === 'bait',
          )?.quantity ?? 0;
        if (count <= 0) return false;
        const isLure = id.startsWith('lure_');
        return isSpinningRod ? isLure : !isLure;
      })
      .map((id) => ({
        ...BAITS[id],
        id,
        count:
          player.consumables.find(
            (c: { itemId: string; itemType: string }) =>
              c.itemId === id && c.itemType === 'bait',
          )?.quantity ?? 0,
      }));
  }, [player]);

  const memoizedGroundbaits = useMemo(() => {
    if (!player) return [];
    return Object.keys(GROUNDBAITS)
      .filter((id) => {
        const count =
          player.consumables.find(
            (c: { itemId: string; itemType: string }) =>
              c.itemId === id && c.itemType === 'groundbait',
          )?.quantity ?? 0;
        return count > 0 || id === 'none';
      })
      .map((id) => ({
        ...GROUNDBAITS[id as keyof typeof GROUNDBAITS],
        id,
        count:
          player.consumables.find(
            (c: { itemId: string; itemType: string }) =>
              c.itemId === id && c.itemType === 'groundbait',
          )?.quantity ?? 0,
      }));
  }, [player]);

  const isSpinningRod = useMemo(() => {
    if (!player) return false;
    const equippedRod = player.gearItems.find(
      (g: IOwnedGearItem) => g.uid === player.equippedRodUid,
    );
    const rodConfig = SHOP_RODS.find((r) => r.id === equippedRod?.itemId);
    return rodConfig?.rodCategory === 'spinning';
  }, [player]);

  const memoizedGadgets = useMemo(() => {
    if (!player) return [];
    const r = SHOP_GADGETS.find((i) => i.id === 'repair_kit');

    const kits = player.gearItems
      .filter((g: IOwnedGearItem) => g.itemId === 'repair_kit')
      .map((kit: IOwnedGearItem) => ({
        ...r,
        uid: kit.uid,
        id: kit.itemId,
        condition: kit.condition,
      }));

    const grouped: (IGearItemBase & { count?: number })[] = [];
    let perfectCount = 0;
    let perfectUid = '';

    kits.forEach((kit: IGearItemBase & { uid?: string }) => {
      const currentCondition = kit.condition ?? 100;
      const isPerfect = kit.condition === null || currentCondition >= 100;
      if (isPerfect) {
        perfectCount++;
        if (!perfectUid) perfectUid = kit.uid || '';
      } else {
        grouped.push(kit as IGearItemBase);
      }
    });

    if (perfectCount > 0 && r) {
      grouped.push({
        ...r,
        uid: perfectUid,
        id: 'repair_kit',
        count: perfectCount,
        condition: 100,
      } as IGearItemBase);
    }

    return grouped;
  }, [player]);

  const memoizedRepairable = useMemo(() => {
    const rods = memoizedRods
      .filter(
        (r: IGearItemBase) => r.condition !== undefined && r.condition < 100,
      )
      .map((r: IGearItemBase) => ({ ...r, itemType: 'rod' as const }));
    const reels = memoizedReels
      .filter(
        (r: IGearItemBase) => r.condition !== undefined && r.condition < 100,
      )
      .map((r: IGearItemBase) => ({ ...r, itemType: 'reel' as const }));
    return [...rods, ...reels];
  }, [memoizedRods, memoizedReels]);

  return {
    t,
    isLoading: !player,
    player,
    activeBait,
    activeGroundbait,
    deleteModal,
    setDeleteModal,
    repairModal,
    setRepairModal,
    handleEquip,
    handleDelete,
    confirmDelete,
    handleRepair,
    handleBack,
    getRodInstances: () => memoizedRods,
    getReelInstances: () => memoizedReels,
    getLineInstances: () => memoizedLines,
    getHookInstances: () => memoizedHooks,
    getGadgetInstances: () => memoizedGadgets,
    getOwnedBaits: () => memoizedBaits,
    getOwnedGroundbaits: () => memoizedGroundbaits,
    getRepairableItems: () => memoizedRepairable,
    isSpinningRod,
  };
}
