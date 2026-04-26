import { Injectable, BadRequestException } from '@nestjs/common';

import { InventoryEntity } from './entities/inventory.entity';
import { PlayerService } from '../player/player.service';

type InventoryTargetType =
  | 'rod'
  | 'reel'
  | 'line'
  | 'hook'
  | 'bait'
  | 'groundbait';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryEntity: InventoryEntity,
    private readonly playerService: PlayerService,
  ) {}

  async equipGear(
    userId: string,
    equips: {
      targetType: InventoryTargetType;
      uid?: string | null;
      targetId?: string | null;
    }[],
  ) {
    const profile = await this.inventoryEntity.findProfile(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    const updateData: Record<string, string | null> = {};
    const equippedItems: Record<
      string,
      { itemId: string; isBroken?: boolean }
    > = {};

    for (const action of equips) {
      if (action.targetType === 'bait') {
        updateData.activeBait = action.targetId || action.uid || null;
        continue;
      }

      if (action.targetType === 'groundbait') {
        updateData.activeGroundbait = action.targetId || action.uid || null;
        continue;
      }

      if (action.uid !== null && action.uid !== undefined) {
        const item = await this.inventoryEntity.findGearItem(
          action.uid,
          profile.id,
          action.targetType,
        );

        if (!item)
          throw new BadRequestException(
            `Item not found in inventory: ${action.uid}`,
          );

        if (item.isBroken) {
          throw new BadRequestException(
            `Cannot equip broken item: ${action.uid}`,
          );
        }

        equippedItems[action.targetType] = item;
      }

      if (action.targetType === 'rod')
        updateData.equippedRodUid = action.uid || null;
      if (action.targetType === 'reel')
        updateData.equippedReelUid = action.uid || null;
      if (action.targetType === 'line')
        updateData.equippedLineUid = action.uid || null;
      if (action.targetType === 'hook')
        updateData.equippedHookUid = action.uid || null;
    }

    let rodItemId: string | undefined = equippedItems.rod?.itemId;
    if (
      !rodItemId &&
      profile.equippedRodUid &&
      updateData.equippedRodUid !== null
    ) {
      const item = await this.inventoryEntity.findGearItem(
        profile.equippedRodUid,
        profile.id,
        'rod',
      );
      rodItemId = item?.itemId;
    }

    const finalBaitId =
      updateData.activeBait !== undefined
        ? updateData.activeBait
        : profile.activeBait;
    const isSpinningRod = rodItemId?.includes('spinning') || false;
    const isLureBait = finalBaitId ? finalBaitId.startsWith('lure_') : false;

    if (rodItemId) {
      if (isSpinningRod && isLureBait === false) {
        throw new BadRequestException('Spinning rod can only use lures');
      }
      if (!isSpinningRod && isLureBait === true) {
        throw new BadRequestException('Classic rod cannot use lures');
      }
    }

    if (isLureBait) {
      const hookUid =
        updateData.equippedHookUid || profile.equippedHookUid || '';
      const hookItem = hookUid
        ? await this.inventoryEntity.findGearItem(hookUid, profile.id, 'hook')
        : null;
      const hookItemId = equippedItems.hook?.itemId || hookItem?.itemId;

      if (hookItemId !== finalBaitId) {
        throw new BadRequestException(
          'Selection must match equipped lure hook',
        );
      }
    }

    await this.inventoryEntity.updateProfile(profile.id, updateData);
    return this.playerService.getProfile(userId);
  }

  async repairGear(
    userId: string,
    kitUid: string,
    targetUid: string,
    targetType: 'rod' | 'reel',
  ) {
    const profile = await this.inventoryEntity.findProfile(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    const kit = await this.inventoryEntity.findGearItem(
      kitUid,
      profile.id,
      'repair_kit',
    );

    if (!kit || (kit.condition ?? 100) <= 0)
      throw new BadRequestException('Invalid repair kit');

    const targetItem = await this.inventoryEntity.findGearItem(
      targetUid,
      profile.id,
      targetType,
    );

    if (
      !targetItem ||
      targetItem.condition === null ||
      targetItem.condition >= 100
    )
      throw new BadRequestException('Invalid target item or fully repaired');

    await this.inventoryEntity.executeRepairTx(targetUid, kitUid, profile.id);
    return this.playerService.getProfile(userId);
  }

  async deleteGear(userId: string, uid: string) {
    const profile = await this.inventoryEntity.findProfile(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    const item = await this.inventoryEntity.findGearItem(uid, profile.id);
    if (!item) throw new BadRequestException('Item not found in inventory');

    const updateData: Record<string, string | null> = {};
    if (profile.equippedRodUid === uid) updateData.equippedRodUid = null;
    if (profile.equippedReelUid === uid) updateData.equippedReelUid = null;
    if (profile.equippedLineUid === uid) updateData.equippedLineUid = null;
    if (profile.equippedHookUid === uid) updateData.equippedHookUid = null;

    await this.inventoryEntity.executeDeleteGearTx(uid, profile.id, updateData);
    return this.playerService.getProfile(userId);
  }

  async consumeConsumable(
    userId: string,
    itemId: string,
    itemType: 'bait' | 'groundbait',
    quantity: number = 1,
  ) {
    const profile = await this.inventoryEntity.findProfile(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    const item = await this.inventoryEntity.findConsumableItem(
      profile.id,
      itemId,
      itemType,
    );

    if (!item || item.quantity < quantity) {
      throw new BadRequestException('Not enough consumable items');
    }

    await this.inventoryEntity.executeConsumeTx(item.id, quantity, profile.id);
    return this.playerService.getProfile(userId);
  }
}
