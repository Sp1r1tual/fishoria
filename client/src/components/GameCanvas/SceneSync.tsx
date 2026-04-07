import { useEffect } from 'react';

import { useAppSelector } from '@/hooks/core/useAppStore';

import type { IOwnedGearItem } from '@/common/types';

import { usePlayerQuery } from '@/queries/player.queries';

import type { LakeScene } from '@/game/engine/scenes/LakeScene';
import {
  BAITS,
  SHOP_HOOKS,
  SHOP_RODS,
  SHOP_REELS,
  SHOP_LINES,
} from '@/common/configs/game';

interface ISceneSyncProps {
  sceneRef: React.RefObject<LakeScene | null>;
}

export function SceneSync({ sceneRef }: ISceneSyncProps) {
  const currentLakeId = useAppSelector((s) => s.game.currentLakeId);
  const groundbaitExpiresAt = useAppSelector((s) => s.game.groundbaitExpiresAt);
  const baseDepth = useAppSelector((s) => s.game.baseDepth);

  const { data: player } = usePlayerQuery();

  useEffect(() => {
    if (!sceneRef.current || !player) return;

    const gearItems = player.gearItems || [];
    const consumables = player.consumables || [];

    const rodInstance = gearItems.find(
      (g: IOwnedGearItem) => g.uid === player.equippedRodUid,
    );
    const reelInstance = gearItems.find(
      (g: IOwnedGearItem) => g.uid === player.equippedReelUid,
    );
    const lineInstance = gearItems.find(
      (g: IOwnedGearItem) => g.uid === player.equippedLineUid,
    );
    const hookInstance = gearItems.find(
      (g: IOwnedGearItem) => g.uid === player.equippedHookUid,
    );

    const rodShopConfig = rodInstance
      ? SHOP_RODS.find((r) => r.id === rodInstance.itemId) || SHOP_RODS[0]
      : null;
    const reelShopConfig = reelInstance
      ? SHOP_REELS.find((r) => r.id === reelInstance.itemId) || SHOP_REELS[0]
      : null;
    const lineShopConfig = lineInstance
      ? SHOP_LINES.find((l) => l.id === lineInstance.itemId) || SHOP_LINES[0]
      : null;
    const hookShopConfig = hookInstance
      ? SHOP_HOOKS.find((h) => h.id === hookInstance.itemId) || SHOP_HOOKS[0]
      : null;

    const rodConfig =
      rodShopConfig && rodInstance
        ? {
            ...rodShopConfig,
            isBroken: rodInstance.isBroken ?? false,
            condition: rodInstance.condition,
          }
        : null;
    const reelConfig =
      reelShopConfig && reelInstance
        ? {
            ...reelShopConfig,
            isBroken: reelInstance.isBroken ?? false,
            condition: reelInstance.condition,
          }
        : null;
    const lineConfig =
      lineShopConfig && lineInstance
        ? { ...lineShopConfig, meters: lineInstance.meters }
        : null;
    const hookConfig = hookShopConfig ? { ...hookShopConfig } : null;

    const baitCounts = consumables
      .filter((c: { itemType: string }) => c.itemType === 'bait')
      .reduce(
        (
          acc: Record<string, number>,
          c: { itemId: string; quantity: number },
        ) => ({ ...acc, [c.itemId]: c.quantity }),
        {},
      );

    const ownedHookIds = gearItems
      .filter((g: IOwnedGearItem) => g.itemType === 'hook')
      .reduce(
        (acc: Record<string, number>, g: IOwnedGearItem) => ({
          ...acc,
          [g.itemId]: (acc[g.itemId] || 0) + 1,
        }),
        {},
      );

    const activeBait = player.activeBait || 'worm';
    const activeGroundbait = player.activeGroundbait || 'none';

    const isLure = activeBait.startsWith('lure_');
    const bCount = isLure
      ? ownedHookIds[activeBait] || 0
      : baitCounts[activeBait] || 0;

    sceneRef.current.syncWithState({
      lakeId: currentLakeId,
      activeBait,
      baitName: isLure
        ? SHOP_HOOKS.find((h) => h.id === activeBait)?.name || activeBait
        : (BAITS as Record<string, { name: string }>)[activeBait]?.name ||
          activeBait,
      hasBait: bCount > 0,
      activeGroundbait,
      groundbaitExpiresAt,
      baseDepth,
      rodConfig,
      reelConfig,
      lineConfig,
      hookConfig,
      // Pass UIDs for wear tracking
      equippedRodUid: player.equippedRodUid,
      equippedReelUid: player.equippedReelUid,
      equippedLineUid: player.equippedLineUid,
      equippedHookUid: player.equippedHookUid,
    });

    // Keep available line length in sync with actual server-side meters
    sceneRef.current.setAvailableLineLength(
      lineInstance?.meters ?? lineShopConfig?.totalLength ?? 0,
    );
  }, [sceneRef, player, currentLakeId, groundbaitExpiresAt, baseDepth]);

  return null;
}
