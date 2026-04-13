import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import type {
  BaitTypeType,
  GearTypeType,
  IGearItemBase,
  IOwnedGearItem,
  IGearAction,
} from '@/common/types';

import { useClickSound } from '@/hooks/audio/useSoundEffect';

import { useAppSelector, useAppDispatch } from '@/hooks/core/useAppStore';
import { usePlayerQuery } from '@/queries/player.queries';
import {
  useEquipMutation,
  useRepairMutation,
  useDeleteMutation,
} from '@/queries/inventory.queries';
import { addToast } from '@/store/slices/uiSlice';

import { InventoryService } from '@/services/inventory.service';
import {
  SHOP_RODS,
  SHOP_REELS,
  SHOP_LINES,
  SHOP_HOOKS,
  GROUNDBAITS,
  BAITS,
  SHOP_GADGETS,
} from '@/common/configs/game';

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
  const { phase, currentLakeId } = useAppSelector((s) => s.game);
  const [bufferedEquips, setBufferedEquips] = useState<
    Record<string, IGearAction>
  >({});
  const bufferedRef = useRef(bufferedEquips);
  const flushedRef = useRef(false);

  useEffect(() => {
    bufferedRef.current = bufferedEquips;
  }, [bufferedEquips]);

  useEffect(() => {
    return () => {
      if (flushedRef.current) return;
      const bufferArr = Object.values(bufferedRef.current);
      if (bufferArr.length > 0) {
        InventoryService.equip({ equips: bufferArr }).catch(console.error);
        flushedRef.current = true;
      }
    };
  }, []);
  const activeBait = player?.activeBait || 'worm';
  const activeGroundbait = player?.activeGroundbait || 'none';
  const { t } = useTranslation();

  const { baitCounts, gbCounts } = useMemo(() => {
    const b: Record<string, number> = {};
    const g: Record<string, number> = {};

    if (player?.consumables) {
      for (const c of player.consumables) {
        if (c.itemType === 'bait') b[c.itemId] = c.quantity;
        if (c.itemType === 'groundbait') g[c.itemId] = c.quantity;
      }
    }
    return { baitCounts: b, gbCounts: g };
  }, [player]);

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
        let equips: IGearAction[] = [];

        if (baitId.startsWith('lure_')) {
          const inst = player?.gearItems.find(
            (h: IOwnedGearItem) => h.itemId === baitId,
          );

          if (inst) {
            equips = [
              { targetType: 'hook', uid: inst.uid },
              { targetType: 'bait', targetId: baitId },
            ];
          }
        } else {
          equips = [{ targetType: 'bait', targetId: baitId }];
        }

        if (equips.length > 0) {
          if (!currentLakeId) {
            equipMutation.mutate({ equips, buffer: true });
            setBufferedEquips((prev) => {
              const next = { ...prev };
              equips.forEach((eq) => {
                next[eq.targetType] = eq;
              });
              return next;
            });
          } else {
            equipMutation.mutate({ equips });
          }
        }
        return;
      }

      if (type === 'groundbait') {
        const payload = {
          targetType: 'groundbait' as const,
          targetId: _item.id,
        };
        if (!currentLakeId) {
          equipMutation.mutate({ ...payload, buffer: true });
          setBufferedEquips((prev) => ({ ...prev, groundbait: payload }));
        } else {
          equipMutation.mutate(payload);
        }
        return;
      }

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
              equips.push({ targetType: 'hook', uid: null });
            }

            const firstClassic = Object.keys(BAITS).find(
              (id) => (baitCounts[id] ?? 0) > 0,
            );
            if (firstClassic) {
              equips.push({ targetType: 'bait', targetId: firstClassic });
            }
          }
        }

        if (!currentLakeId) {
          equipMutation.mutate({ equips, buffer: true });
          setBufferedEquips((prev) => {
            const next = { ...prev };
            equips.forEach((eq) => {
              next[eq.targetType] = eq;
            });
            return next;
          });
        } else {
          equipMutation.mutate({ equips });
        }
      } catch (error) {
        console.error('Failed to equip', error);
      }
    },
    [
      player,
      phase,
      activeBait,
      currentLakeId,
      equipMutation,
      playClick,
      baitCounts,
    ],
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
    } catch (error) {
      console.error('Failed to delete', error);
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
      } catch (error) {
        console.error('Failed to repair', error);
      }
      setRepairModal({ isOpen: false, kitUid: null });
    },
    [phase, repairMutation, playClick, dispatch, t],
  );

  const handleBack = useCallback(
    (onClose?: () => void) => {
      const bufferArr = Object.values(bufferedEquips);
      if (bufferArr.length > 0 && !flushedRef.current) {
        equipMutation.mutate({ equips: bufferArr });
        flushedRef.current = true;
      }

      if (onClose) onClose();
      else navigate('/');
    },
    [navigate, bufferedEquips, equipMutation],
  );

  /**
   * Main block for building inventory lists, optimized for performance (O(N)).
   * It iterates over `player.gearItems` exactly ONCE, sorting items into their respective categories,
   * and immediately stacks (combines) new/undamaged items.
   */
  const lists = useMemo(() => {
    const defaultRes = {
      rods: [] as IGearItemBase[],
      reels: [] as IGearItemBase[],
      lines: [] as (IGearItemBase & { count?: number })[],
      hooks: [] as (IGearItemBase & { count?: number })[],
      gadgets: [] as (IGearItemBase & { count?: number })[],
      repairable: [] as IGearItemBase[],
      baits: [] as (IGearItemBase & { count?: number })[],
      groundbaits: [] as (IGearItemBase & { count?: number })[],
      isSpinningRod: false,
    };
    if (!player) return defaultRes;

    // We fetch the currently equipped rod to know its configuration (e.g., if it's a spinning rod).
    // This dictates whether we should display floats, lures, or standard hooks.
    const equippedRod = player.gearItems.find(
      (g: IOwnedGearItem) => g.uid === player.equippedRodUid,
    );
    const rodConfig = SHOP_RODS.find((r) => r.id === equippedRod?.itemId);
    const isSpinningRod = rodConfig?.rodCategory === 'spinning';
    const rodCategory = rodConfig?.rodCategory || 'float';

    const categoryOrder: Record<string, number> = {
      float: 0,
      spinning: 1,
      feeder: 2,
    };
    const rigOrder = categoryOrder;

    const rods: IGearItemBase[] = [];
    const reels: IGearItemBase[] = [];
    const repairable: IGearItemBase[] = [];

    // These arrays will store the final consolidated items
    const linesGrouped: (IGearItemBase & { count?: number })[] = [];
    const hooksGrouped: (IGearItemBase & { count?: number })[] = [];

    // Helper object for counting and stacking identical "new" items.
    // firstUids is needed to store the UID of the item that is currently equipped
    // (so the UI can correctly mark it with a checkmark even when stacked).
    const groupTracking = {
      lines: {
        counts: {} as Record<string, number>,
        firstUids: {} as Record<string, string>,
      },
      hooks: {
        counts: {} as Record<string, number>,
        firstUids: {} as Record<string, string>,
      },
    };

    let repairKitCount = 0;
    let repairKitUid = '';
    const brokenRepairKits: IGearItemBase[] = [];

    // === SINGLE MASTER LOOP OVER ENTIRE INVENTORY ===
    for (const inst of player.gearItems) {
      if (inst.itemType === 'rod') {
        const base = SHOP_RODS.find((r) => r.id === inst.itemId);

        if (base) {
          const item = { ...base, ...inst, id: inst.itemId } as IGearItemBase;

          rods.push(item);

          if (item.condition !== undefined && item.condition < 100)
            repairable.push({ ...item, itemType: 'rod' as const });
        }
      } else if (inst.itemType === 'reel') {
        const base = SHOP_REELS.find((r) => r.id === inst.itemId);

        if (base) {
          const item = { ...base, ...inst, id: inst.itemId } as IGearItemBase;

          reels.push(item);

          if (item.condition !== undefined && item.condition < 100)
            repairable.push({ ...item, itemType: 'reel' as const });
        }
      } else if (inst.itemType === 'line') {
        const base = SHOP_LINES.find((r) => r.id === inst.itemId);
        if (base) {
          const item = { ...base, ...inst, id: inst.itemId } as IGearItemBase &
            IOwnedGearItem;
          const isEquipped = item.uid === player.equippedLineUid;
          const currentMeters = item.meters ?? 0;
          const totalLength = item.totalLength ?? 300;

          // If the fishing line is completely unused (equals the initial length),
          // increment its counter for stacked display (x1, x2, x3, etc.).
          // Otherwise, we store it as a separate distinct slot in the backpack.
          if (item.meters === null || currentMeters >= totalLength) {
            groupTracking.lines.counts[item.id] =
              (groupTracking.lines.counts[item.id] || 0) + 1;

            if (isEquipped && item.uid)
              groupTracking.lines.firstUids[item.id] = item.uid;
            else if (!groupTracking.lines.firstUids[item.id] && item.uid)
              groupTracking.lines.firstUids[item.id] = item.uid;
          } else {
            linesGrouped.push(item);
          }
        }
      } else if (inst.itemType === 'hook') {
        const base = SHOP_HOOKS.find((h) => h.id === inst.itemId);

        if (base) {
          if (
            !base.rigType ||
            (rodCategory === 'spinning'
              ? base.rigType === 'spinning'
              : base.rigType !== 'spinning')
          ) {
            const item = {
              ...base,
              ...inst,
              id: inst.itemId,
            } as IGearItemBase & IOwnedGearItem;
            const isEquipped = item.uid === player.equippedHookUid;
            const currentCondition = item.condition ?? 100;

            if (item.condition === null || currentCondition >= 100) {
              groupTracking.hooks.counts[item.id] =
                (groupTracking.hooks.counts[item.id] || 0) + 1;

              if (isEquipped && item.uid)
                groupTracking.hooks.firstUids[item.id] = item.uid;
              else if (!groupTracking.hooks.firstUids[item.id] && item.uid)
                groupTracking.hooks.firstUids[item.id] = item.uid;
            } else {
              hooksGrouped.push(item);
            }
          }
        }
      } else if (inst.itemId === 'repair_kit') {
        const base = SHOP_GADGETS.find((i) => i.id === 'repair_kit');
        if (base) {
          const item = {
            ...base,
            uid: inst.uid,
            id: inst.itemId,
            condition: inst.condition,
          } as IGearItemBase;

          if (item.condition === null || (item.condition ?? 100) >= 100) {
            repairKitCount++;
            if (!repairKitUid && item.uid) repairKitUid = item.uid;
          } else {
            brokenRepairKits.push(item);
          }
        }
      }
    }

    // === CONVERT DICTIONARY STACKS BACK TO ARRAYS ===

    // Take the calculated groupTracking.lines dictionary and convert it into objects with a `count` property
    Object.keys(groupTracking.lines.counts).forEach((itemId) => {
      const base = SHOP_LINES.find((r) => r.id === itemId);
      if (base) {
        linesGrouped.push({
          ...base,
          id: itemId,
          uid: groupTracking.lines.firstUids[itemId],
          count: groupTracking.lines.counts[itemId],
        } as IGearItemBase);
      }
    });

    Object.keys(groupTracking.hooks.counts).forEach((itemId) => {
      const base = SHOP_HOOKS.find((h) => h.id === itemId);
      if (base) {
        hooksGrouped.push({
          ...base,
          id: itemId,
          uid: groupTracking.hooks.firstUids[itemId],
          count: groupTracking.hooks.counts[itemId],
        } as IGearItemBase);
      }
    });

    // Merge damaged repair kits and the stack of perfect repair kits into the gadgets list
    const gadgets = [...brokenRepairKits] as (IGearItemBase & {
      count?: number;
    })[];
    if (repairKitCount > 0) {
      const base = SHOP_GADGETS.find((i) => i.id === 'repair_kit');

      if (base) {
        gadgets.push({
          ...base,
          id: 'repair_kit',
          uid: repairKitUid,
          count: repairKitCount,
          condition: 100,
        } as IGearItemBase);
      }
    }

    const sortPrice = (a: IGearItemBase, b: IGearItemBase) =>
      (a.price ?? 0) - (b.price ?? 0);

    rods.sort((a, b) => {
      const orderA = a.rodCategory ? categoryOrder[a.rodCategory] : 99;
      const orderB = b.rodCategory ? categoryOrder[b.rodCategory] : 99;
      if (orderA !== orderB) return orderA - orderB;
      return sortPrice(a, b);
    });

    reels.sort(sortPrice);
    linesGrouped.sort(sortPrice);
    hooksGrouped.sort((a, b) => {
      const orderA = a.rigType ? rigOrder[a.rigType] : 99;
      const orderB = b.rigType ? rigOrder[b.rigType] : 99;
      if (orderA !== orderB) return orderA - orderB;
      return sortPrice(a, b);
    });

    const baits = Object.keys(BAITS)
      .filter((id) => {
        const isLure = id.startsWith('lure_');
        return (baitCounts[id] ?? 0) > 0 && (isSpinningRod ? isLure : !isLure);
      })
      .map((id) => ({ ...BAITS[id], id, count: baitCounts[id] ?? 0 }));

    const groundbaits = Object.keys(GROUNDBAITS)
      .filter((id) => (gbCounts[id] ?? 0) > 0 || id === 'none')
      .map((id) => ({
        ...GROUNDBAITS[id as keyof typeof GROUNDBAITS],
        id,
        count: gbCounts[id] ?? 0,
      }));

    return {
      rods,
      reels,
      lines: linesGrouped,
      hooks: hooksGrouped,
      gadgets,
      repairable,
      baits,
      groundbaits,
      isSpinningRod,
    };
  }, [player, baitCounts, gbCounts]);

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
    getRodInstances: () => lists.rods,
    getReelInstances: () => lists.reels,
    getLineInstances: () => lists.lines,
    getHookInstances: () => lists.hooks,
    getGadgetInstances: () => lists.gadgets,
    getOwnedBaits: () => lists.baits,
    getOwnedGroundbaits: () => lists.groundbaits,
    getRepairableItems: () => lists.repairable,
    isSpinningRod: lists.isSpinningRod,
  };
}
