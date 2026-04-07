import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { FULL_PROFILE_INCLUDE } from '../../player/dto/profile-response.dto';

@Injectable()
export class InventoryEntity {
  constructor(private readonly prisma: PrismaService) {}

  async findProfile(userId: string) {
    return this.prisma.playerProfile.findUnique({
      where: { userId },
    });
  }

  async findGearItem(uid: string, profileId: string, itemType?: string) {
    return this.prisma.gearItem.findFirst({
      where: {
        uid,
        profileId,
        ...(itemType && { itemType }),
      },
    });
  }

  async findConsumableItem(
    profileId: string,
    itemId: string,
    itemType: string,
  ) {
    return this.prisma.consumableItem.findFirst({
      where: { profileId, itemId, itemType },
    });
  }

  async updateProfile(
    profileId: string,
    data: Prisma.PlayerProfileUpdateInput,
  ) {
    return this.prisma.playerProfile.update({
      where: { id: profileId },
      data,
      include: FULL_PROFILE_INCLUDE,
    });
  }

  async executeRepairTx(targetUid: string, kitUid: string, profileId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profileId} FOR UPDATE`;

      const kit = await tx.gearItem.findUnique({ where: { uid: kitUid } });
      const targetItem = await tx.gearItem.findUnique({
        where: { uid: targetUid },
      });

      if (
        !kit ||
        kit.profileId !== profileId ||
        kit.itemType !== 'repair_kit'
      ) {
        throw new BadRequestException('Invalid repair kit');
      }

      const kitCondition = kit.condition ?? 100;
      if (kitCondition <= 0) {
        throw new BadRequestException('Invalid repair kit');
      }
      if (
        !targetItem ||
        targetItem.profileId !== profileId ||
        targetItem.condition === null ||
        targetItem.condition >= 100
      ) {
        throw new BadRequestException('Invalid target item or fully repaired');
      }

      const needed = 100 - targetItem.condition;
      const repairAmount = Math.min(kitCondition, needed);

      const targetNewCondition = targetItem.condition + repairAmount;
      const kitNewCondition = kitCondition - repairAmount;

      await tx.gearItem.update({
        where: { uid: targetUid },
        data: {
          condition: targetNewCondition,
          isBroken: false,
        },
      });

      if (kitNewCondition <= 0) {
        await tx.gearItem.delete({ where: { uid: kitUid } });
      } else {
        await tx.gearItem.update({
          where: { uid: kitUid },
          data: { condition: kitNewCondition },
        });
      }
    });

    return await this.findProfileWithFullInclude(profileId);
  }

  async executeDeleteGearTx(
    uid: string,
    profileId: string,
    updateData: Record<string, string | null>,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profileId} FOR UPDATE`;
      await tx.gearItem.delete({ where: { uid } });

      if (Object.keys(updateData).length > 0) {
        await tx.playerProfile.update({
          where: { id: profileId },
          data: updateData,
        });
      }
    });

    return await this.findProfileWithFullInclude(profileId);
  }

  async executeConsumeTx(
    consumableId: string,
    decrementBy: number,
    profileId: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM player_profiles WHERE id = ${profileId} FOR UPDATE`;

      const item = await tx.consumableItem.findUnique({
        where: { id: consumableId },
      });
      if (!item || item.quantity < decrementBy) {
        throw new BadRequestException('Not enough consumable items');
      }

      await tx.consumableItem.update({
        where: { id: consumableId },
        data: { quantity: { decrement: decrementBy } },
      });
    });

    return await this.findProfileWithFullInclude(profileId);
  }

  private async findProfileWithFullInclude(profileId: string) {
    return await this.prisma.playerProfile.findUnique({
      where: { id: profileId },
      include: FULL_PROFILE_INCLUDE,
    });
  }
}
